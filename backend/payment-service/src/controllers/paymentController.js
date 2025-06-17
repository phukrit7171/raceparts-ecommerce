// backend/payment-service/src/controllers/paymentController.js

const { CartItem, Product, Order, OrderItem, sequelize } = require('../models');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// This is the function we are fixing.
exports.createCheckoutSession = async (req, res) => {
    const userId = req.user.id;
    const { origin } = req.body;

    if (!origin) {
        return res.status(400).json({ success: false, message: 'Origin URL is required for redirects.' });
    }

    try {
        console.log('[Payment Service] Starting createCheckoutSession...');
        const cartItems = await CartItem.findAll({
            where: { user_id: userId }
        });

        if (cartItems.length === 0) {
            console.log('[Payment Service] Cart is empty. Aborting.');
            return res.status(400).json({ success: false, message: "Cannot checkout with an empty cart." });
        }

        const line_items = [];
        for (const item of cartItems) {
            // Explicitly find each product to guarantee we have its data
            console.log(`[Payment Service] Looking up product ID: ${item.product_id}`);
            const product = await Product.findByPk(item.product_id);
            if (!product) {
                console.warn(`[Payment Service] Could not find product with ID ${item.product_id}. Skipping.`);
                continue;
            }
            line_items.push({
                price_data: {
                    currency: 'thb',
                    product_data: {
                        name: product.name,
                    },
                    unit_amount: Math.round(product.price * 100),
                },
                quantity: item.quantity,
            });
        }
        
        console.log('--- Attempting to send this to Stripe (FOOLPROOF VERSION): ---');
        console.log(JSON.stringify(line_items, null, 2));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card','promptpay'],
            line_items: line_items,
            mode: 'payment',
            success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/cart`,
            metadata: { userId: userId.toString() },
            shipping_address_collection: { allowed_countries: ['US', 'CA', 'GB','TH'] },
        });

        console.log('[Payment Service] Successfully created Stripe session.');
        res.json({ id: session.id, url: session.url });

    } catch (error) {
        console.error("[Payment Service] CRITICAL ERROR in createCheckoutSession:", error);
        res.status(500).json({ success: false, message: "Failed to create checkout session." });
    }
};

// --- The rest of the file remains the same ---
const createOrder = async (session) => {
    const userId = parseInt(session.metadata.userId);
    const paymentIntentId = session.payment_intent; 
    const t = await sequelize.transaction();
    try {
        const cartItems = await CartItem.findAll({ where: { user_id: userId }, include: [Product], transaction: t });
        if (cartItems.length === 0) throw new Error("Cart is empty, cannot create order.");
        const totalAmount = cartItems.reduce((sum, item) => sum + (item.quantity * item.Product.price), 0);
        const order = await Order.create({
            user_id: userId,
            total_amount: totalAmount,
            status: 'paid',
            stripe_payment_intent_id: paymentIntentId,
            shipping_address: JSON.stringify(session.shipping_details)
        }, { transaction: t });
        const orderItems = cartItems.map(item => ({
            order_id: order.id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.Product.price
        }));
        await OrderItem.bulkCreate(orderItems, { transaction: t });
        for (const item of cartItems) {
            await Product.update(
                { stock_quantity: sequelize.literal(`stock_quantity - ${item.quantity}`) },
                { where: { id: item.product_id }, transaction: t }
            );
        }
        await CartItem.destroy({ where: { user_id: userId }, transaction: t });
        await t.commit();
        console.log(`✅ Successfully created order ${order.uuid} for user ${userId} via Stripe Checkout.`);
    } catch (error) {
        await t.rollback();
        console.error(`❌ Failed to create order for user ${userId} via webhook. Rolled back transaction.`, error);
    }
};

exports.handleWebhook = (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            console.log(`🔔 Webhook received: checkout.session.completed for user ${session.metadata.userId}`);
            createOrder(session).catch(console.error);
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }
    res.json({ received: true });
};