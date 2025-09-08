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
exports.updateStripeSubscriptions = updateStripeSubscriptions;
const stripe_1 = require("../../../integrations/stripe");
const data_layer_1 = require("../../../../data_layer");
const stripe = (0, stripe_1.getStripe)();
const database = (0, data_layer_1.getDatabase)();
/**
 * Fetches a batch of active subscriptions from Stripe
 */
function fetchSubscriptionBatch(startingAfter) {
    return stripe.subscriptions.list({
        limit: 100,
        status: 'active',
        starting_after: startingAfter,
    });
}
/**
 * Retrieves customer information from Stripe
 */
function getCustomer(customerId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const customer = yield stripe.customers.retrieve(customerId);
            if ('email' in customer && customer.email) {
                return customer;
            }
            console.warn('Customer does not have an email', customerId);
            return null;
        }
        catch (error) {
            console.error('Error retrieving customer', customerId, error);
            return null;
        }
    });
}
/**
 * Updates or creates a subscription record in the database
 */
/**
 * Determines if a subscription should be considered active based on its status and cancellation schedule
 */
function determineSubscriptionActiveStatus(subscription, email) {
    const isActive = subscription.status === 'active';
    const isCancelScheduled = subscription.cancel_at_period_end === true;
    // If not active or not scheduled for cancellation, just return the active status
    if (!isActive || !isCancelScheduled) {
        return isActive;
    }
    // For subscriptions scheduled for cancellation, check if we're still in the paid period
    const periodEndDate = new Date(subscription.current_period_end * 1000);
    const currentDate = new Date();
    const shouldRemainActive = currentDate < periodEndDate;
    if (shouldRemainActive) {
        console.info(`Subscription for ${email} is scheduled for cancellation but still active until ${periodEndDate.toISOString()}`);
    }
    return shouldRemainActive;
}
/**
 * Updates an existing subscription record in the database
 */
function updateExistingSubscription(db, email, subscription, shouldRemainActive, existingActive) {
    return __awaiter(this, void 0, void 0, function* () {
        const statusChanged = existingActive !== shouldRemainActive;
        const payload = JSON.stringify(subscription);
        if (statusChanged) {
            console.info(`Updating subscription status for ${email} to ${shouldRemainActive ? 'active' : 'inactive'}`);
            yield db
                .table('subscriptions')
                .where({ email })
                .update({ active: shouldRemainActive, payload });
        }
        else {
            console.info(`Subscription status for ${email} remains ${shouldRemainActive ? 'active' : 'inactive'}`);
            yield db.table('subscriptions').where({ email }).update({ payload });
        }
    });
}
/**
 * Creates a new subscription record in the database
 */
function createNewSubscription(db, email, customerId, subscription, shouldRemainActive) {
    return __awaiter(this, void 0, void 0, function* () {
        console.info(`Creating subscription for customer ${customerId}, ${email}, active: ${shouldRemainActive}`);
        yield db.table('subscriptions').insert({
            email,
            active: shouldRemainActive,
            payload: JSON.stringify(subscription),
        });
    });
}
/**
 * Updates or creates a subscription record in the database
 */
function updateSubscriptionRecord(db, customer, subscription) {
    return __awaiter(this, void 0, void 0, function* () {
        const email = customer.email.toLowerCase();
        try {
            const shouldRemainActive = determineSubscriptionActiveStatus(subscription, email);
            const existingSubscription = yield db
                .table('subscriptions')
                .where({ email })
                .first();
            if (existingSubscription) {
                yield updateExistingSubscription(db, email, subscription, shouldRemainActive, existingSubscription.active);
            }
            else {
                yield createNewSubscription(db, email, customer.id, subscription, shouldRemainActive);
            }
        }
        catch (error) {
            console.error('Error updating subscription record', customer.id, email, error);
            throw error;
        }
    });
}
/**
 * Processes a single subscription
 */
function processSubscription(db, subscription) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (typeof subscription.customer !== 'string') {
                console.warn('Subscription has non-string customer ID', subscription.id);
                return;
            }
            const customer = yield getCustomer(subscription.customer);
            if (!customer)
                return;
            yield updateSubscriptionRecord(db, customer, subscription);
        }
        catch (error) {
            console.error('Error processing subscription', subscription.id, error);
            // We don't rethrow here to allow processing of other subscriptions
        }
    });
}
/**
 * Updates the pagination parameters based on the subscription batch
 */
function updatePaginationParams(subscriptions) {
    const hasMore = subscriptions.has_more;
    let startingAfter = undefined;
    if (hasMore && subscriptions.data.length > 0) {
        startingAfter = subscriptions.data[subscriptions.data.length - 1].id;
        console.info(`More subscriptions available, next starting point: ${startingAfter}`);
    }
    else {
        console.info('No more subscriptions to fetch');
    }
    return { hasMore, startingAfter };
}
/**
 * Main function to synchronize Stripe subscriptions with the database
 */
function updateStripeSubscriptions() {
    return __awaiter(this, void 0, void 0, function* () {
        let hasMore = true;
        let startingAfter = undefined;
        console.info('Starting subscription sync with Stripe');
        try {
            while (hasMore) {
                console.info(`Fetching subscriptions${startingAfter ? ' after ' + startingAfter : ''}`);
                const subscriptions = yield fetchSubscriptionBatch(startingAfter);
                console.info(`Processing ${subscriptions.data.length} subscriptions`);
                // If no subscriptions were returned, exit the loop
                if (subscriptions.data.length === 0) {
                    console.info('No more subscriptions to process');
                    break;
                }
                // Process each subscription
                const processPromises = subscriptions.data.map((subscription) => processSubscription(database, subscription));
                // Wait for all subscriptions to be processed
                yield Promise.all(processPromises);
                // Update pagination parameters
                const pagination = updatePaginationParams(subscriptions);
                hasMore = pagination.hasMore;
                startingAfter = pagination.startingAfter;
            }
            console.info('Subscription sync completed successfully');
        }
        catch (error) {
            console.error('Error in updateStripeSubscriptions:', error);
            throw error; // Re-throw to be caught by the caller
        }
    });
}
// Run directly if this file is executed directly
if (require.main === module) {
    updateStripeSubscriptions()
        .catch(console.error)
        .finally(() => __awaiter(void 0, void 0, void 0, function* () {
        yield database.destroy(); // 🔥 properly close DB connection
    }));
}
//# sourceMappingURL=updateStripeSubscriptions.js.map