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
exports.updateStoreSubscription = exports.getCustomerId = exports.getStripe = void 0;
const stripe_1 = __importDefault(require("stripe"));
const stripe = new stripe_1.default(process.env.STRIPE_KEY);
const getStripe = () => stripe;
exports.getStripe = getStripe;
const getCustomerId = (customer) => {
    if (typeof customer === 'string') {
        return customer;
    }
    return customer === null || customer === void 0 ? void 0 : customer.id;
};
exports.getCustomerId = getCustomerId;
const updateStoreSubscription = (db, customer, subscription) => __awaiter(void 0, void 0, void 0, function* () {
    const email = customer.email;
    // A subscription should be considered active if:
    // 1. Its status is 'active' AND
    // 2. Either it's not scheduled for cancellation OR it is scheduled but hasn't reached the end date yet
    const isActive = subscription.status === 'active';
    const isCancelScheduled = subscription.cancel_at_period_end === true;
    // If cancellation is scheduled, we need to check if we're still within the paid period
    let shouldRemainActive = isActive;
    if (isActive && isCancelScheduled) {
        // current_period_end is in seconds since epoch, so convert to milliseconds for Date
        const periodEndDate = new Date(subscription.current_period_end * 1000);
        const currentDate = new Date();
        // Keep active if current date is before the period end date
        shouldRemainActive = currentDate < periodEndDate;
    }
    yield db('subscriptions')
        .insert({
        email: email === null || email === void 0 ? void 0 : email.toLowerCase(),
        active: shouldRemainActive,
        payload: JSON.stringify(subscription),
    })
        .onConflict('email')
        .merge();
});
exports.updateStoreSubscription = updateStoreSubscription;
//# sourceMappingURL=stripe.js.map