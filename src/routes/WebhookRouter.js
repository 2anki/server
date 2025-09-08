"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const stripe_1 = require("../lib/integrations/stripe");
const data_layer_1 = require("../data_layer");
const StripeController_1 = require("../controllers/StripeController/StripeController");
const UsersRepository_1 = __importDefault(require("../data_layer/UsersRepository"));
const EmailService_1 = require("../services/EmailService/EmailService");
const WebhooksRouter = () => {
    const router = express_1.default.Router();
    const controller = new StripeController_1.StripeController();
    /**
     * @swagger
     * /webhook:
     *   post:
     *     summary: Stripe webhook handler
     *     description: Handle Stripe webhook events for payment processing and subscription management
     *     tags: [Webhooks]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             description: Stripe webhook event payload
     *     responses:
     *       200:
     *         description: Webhook processed successfully
     *       400:
     *         description: Invalid webhook signature or payload
     *         content:
     *           text/plain:
     *             schema:
     *               type: string
     *               example: "Webhook Error: Invalid signature"
     *     security: []
     *     x-webhook-events:
     *       - customer.subscription.updated
     *       - customer.subscription.deleted
     *       - checkout.session.completed
     */
    router.post('/webhook', 
    // @ts-ignore
    express_1.default.raw({ type: 'application/json' }), (request, response) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const sig = request.headers['stripe-signature'];
        const stripe = (0, stripe_1.getStripe)();
        let event;
        try {
            event = stripe.webhooks.constructEvent(request.body, 
            // @ts-ignore
            sig, process.env.STRIPE_ENDPOINT_SECRET);
        }
        catch (err) {
            // @ts-ignore
            response.status(400).send(`Webhook Error: ${err.message}`);
            console.error(err);
            return;
        }
        // Handle the event
        switch (event.type) {
            case 'customer.subscription.updated':
                const customerSubscriptionUpdated = event.data.object;
                const customerId = (0, stripe_1.getCustomerId)(customerSubscriptionUpdated.customer);
                if (!customerId) {
                    console.error('No customer ID found');
                    return;
                }
                const customer = yield stripe.customers.retrieve(customerId);
                yield (0, stripe_1.updateStoreSubscription)((0, data_layer_1.getDatabase)(), customer, customerSubscriptionUpdated);
                if (customerSubscriptionUpdated.cancel_at_period_end === true &&
                    ((_a = event.data.previous_attributes) === null || _a === void 0 ? void 0 : _a.cancel_at_period_end) === false) {
                    const cancelDate = new Date(customerSubscriptionUpdated.current_period_end * 1000);
                    const emailService = (0, EmailService_1.useDefaultEmailService)();
                    if ('email' in customer) {
                        // Log the scheduled cancellation for debugging purposes
                        console.info(`Subscription cancellation scheduled for user ${customer.email}, ` +
                            `access remains until ${cancelDate.toISOString()}`);
                        yield emailService.sendSubscriptionScheduledCancellationEmail(customer.email, customer.name || 'there', cancelDate);
                    }
                }
                break;
            case 'customer.subscription.deleted':
                const customerSubscriptionDeleted = event.data.object;
                if (typeof customerSubscriptionDeleted.customer === 'string') {
                    const deletedCustomerId = (0, stripe_1.getCustomerId)(customerSubscriptionDeleted.customer);
                    if (!deletedCustomerId) {
                        console.error('No customer ID found');
                        return;
                    }
                    const customerDeleted = yield stripe.customers.retrieve(deletedCustomerId);
                    yield (0, stripe_1.updateStoreSubscription)((0, data_layer_1.getDatabase)(), customerDeleted, customerSubscriptionDeleted);
                    if ('email' in customerDeleted) {
                        const emailService = (0, EmailService_1.useDefaultEmailService)();
                        yield emailService.sendSubscriptionCancelledEmail(customerDeleted.email, customerDeleted.name || 'there', customerSubscriptionDeleted.id);
                    }
                }
                break;
            case 'checkout.session.completed':
                const session = event.data.object;
                const amount = (_b = session.amount_total) !== null && _b !== void 0 ? _b : 0;
                const LIFE_TIME_PRICE = 9600;
                if (amount >= LIFE_TIME_PRICE) {
                    const lifeTimeCustomer = yield stripe.customers.retrieve(
                    // @ts-ignore
                    (0, stripe_1.getCustomerId)(session.customer));
                    const users = new UsersRepository_1.default((0, data_layer_1.getDatabase)());
                    // @ts-ignore
                    yield users.updatePatreonByEmail(lifeTimeCustomer.email, true);
                }
                console.log('checkout.session.completed');
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
        // Return a 200 response to acknowledge receipt of the event
        response.send();
    }));
    /**
     * @swagger
     * /successful-checkout:
     *   get:
     *     summary: Successful checkout page
     *     description: Display the successful checkout confirmation page after payment
     *     tags: [Payments]
     *     responses:
     *       200:
     *         description: Checkout success page rendered
     *         content:
     *           text/html:
     *             schema:
     *               type: string
     *               description: HTML success page
     */
    router.get('/successful-checkout', (req, res) => controller.getSuccessfulCheckout(req, res));
    return router;
};
exports.default = WebhooksRouter;
//# sourceMappingURL=WebhookRouter.js.map