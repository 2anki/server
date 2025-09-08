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
Object.defineProperty(exports, "__esModule", { value: true });
const EmailService_1 = require("../../../../services/EmailService/EmailService");
const stripe_1 = require("../../../integrations/stripe");
const stripe = (0, stripe_1.getStripe)();
const sendVatNotificationEmail = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const emailService = (0, EmailService_1.useDefaultEmailService)();
    let hasMore = true;
    let startingAfter = undefined;
    while (hasMore) {
        const subscriptions = yield stripe.subscriptions.list({
            limit: 100,
            status: 'active',
            starting_after: startingAfter,
        });
        for (const subscription of subscriptions.data) {
            if (typeof subscription.customer === 'string') {
                const customer = yield stripe.customers.retrieve(subscription.customer);
                if ('email' in customer) {
                    console.log({
                        email: customer.email,
                        currency: subscription.currency,
                    });
                    yield emailService.sendVatNotificationEmail((_a = customer.email) !== null && _a !== void 0 ? _a : `alexander+${subscription.id}@alemayhu.com`, // fallback to inform dev if email is not set
                    subscription.currency, (_b = customer.name) !== null && _b !== void 0 ? _b : 'there');
                }
                else {
                    console.warn('Customer does not have an email');
                }
            }
        }
        hasMore = subscriptions.has_more;
        if (hasMore) {
            startingAfter = subscriptions.data[subscriptions.data.length - 1].id;
        }
    }
});
if (require.main === module) {
    sendVatNotificationEmail().catch(console.error);
}
//# sourceMappingURL=sendVatNotificationEmail.js.map