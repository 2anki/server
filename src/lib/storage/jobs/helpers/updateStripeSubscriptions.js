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
const stripe_1 = require("../../../integrations/stripe");
const data_layer_1 = require("../../../../data_layer");
const stripe = (0, stripe_1.getStripe)();
const updateStripeSubscriptions = () => __awaiter(void 0, void 0, void 0, function* () {
    let hasMore = true;
    let startingAfter = undefined;
    const database = (0, data_layer_1.getDatabase)();
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
                    const sub = yield database
                        .table('subscriptions')
                        .where({ email: customer.email })
                        .first();
                    if (sub && !sub.active) {
                        console.info('Updating customer', customer.id, customer.email);
                        yield database
                            .table('subscriptions')
                            .where({ email: customer.email })
                            .update({ active: true });
                    }
                    else {
                        console.info('Customer already active', customer.id);
                    }
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
    updateStripeSubscriptions().catch(console.error);
}
//# sourceMappingURL=updateStripeSubscriptions.js.map