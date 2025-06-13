// backend/payment-service/src/controllers/paymentController.js
const { CartItem, Product, Order, OrderItem, sequelize } = require('../models');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const calculateOrderAmount = async (userId) => {
    const cartItems = await CartItem.findAll({
        where: { user_id: userId },
        include: [{ model: Product, attributes: ['price'] }]
    });

    if (cartItems.length === 0) {
        throw new Error("Cannot create payment for an empty cart.");
    }

    const total = cartItems.reduce((sum, item) => {
        return sum + (item.quantity * item.Product.price);
    }, 0);
    
    // Stripe expects the amount in the smallest currency unit (e.g., cents)
    return Math.round(total * 100);
};

// POST /create-payment-intent
exports.createPaymentIntent = async (req, res) => {
    const userId = req.user.id;
    try {
        const amount = await calculateOrderAmount(userId);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'usd',
            automatic_payment_methods: { enabled: true },
            metadata: { userId: userId.toString() } // Pass our internal user ID to Stripe
        });

        res.send({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        console.error("Error creating payment intent:", error);
        res.status(400).json({ success: false, message: error.message });
    }
};

// This is a special function to be used by the webhook handler
const createOrder = async (session) => {
    const userId = parseInt(session.metadata.userId);
    const paymentIntentId = session.payment_intent;

    // Use a transaction to ensure all or nothing
    const t = await sequelize.transaction();
    try {
        // 1. Get user's cart items
        const cartItems = await CartItem.findAll({
            where: { user_id: userId },
            include: [Product],
            transaction: t
        });

        if (cartItems.length === 0) throw new Error("Cart is empty, cannot create order.");
        
        // 2. Calculate final total amount (as a source of truth)
        const totalAmount = cartItems.reduce((sum, item) => sum + (item.quantity * item.Product.price), 0);
        
        // 3. Create the Order
        const order = await Order.create({
            user_id: userId,
            total_amount: totalAmount,
            status: 'paid',
            stripe_payment_intent_id: paymentIntentId,
            shipping_address: session.shipping_details ? JSON.stringify(session.shipping_details) : null
        }, { transaction: t });

        // 4. Create OrderItems from CartItems
        const orderItems = cartItems.map(item => ({
            order_id: order.id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.Product.price
        }));
        await OrderItem.bulkCreate(orderItems, { transaction: t });

        // 5. (Important) Decrease stock quantity for each product
        for (const item of cartItems) {
            await Product.update(
                { stock_quantity: sequelize.literal(`stock_quantity - ${item.quantity}`) },
                { where: { id: item.product_id }, transaction: t }
            );
        }

        // 6. Clear the user's cart
        await CartItem.destroy({ where: { user_id: userId }, transaction: t });
        
        // If everything is successful, commit the transaction
        await t.commit();
        console.log(`✅ Successfully created order ${order.uuid} for user ${userId}`);

    } catch (error) {
        // If anything fails, roll back the entire transaction
        await t.rollback();
        console.error(`❌ Failed to create order for user ${userId}. Rolled back transaction.`, error);
    }
};


// POST /webhook
exports.handleWebhook = (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error(`Webhook signature verification failed.`, err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            console.log(`🔔 Webhook received: checkout.session.completed for user ${session.metadata.userId}`);
            // This is where we fulfill the order
            createOrder(session).catch(console.error);
            break;
        // ... handle other event types
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.json({ received: true });
};