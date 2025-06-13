// backend/cart-service/src/controllers/cartController.js
const { CartItem, Product, sequelize } = require('../models');

// GET / - Get all items in the user's cart
exports.getCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const cartItems = await CartItem.findAll({
            where: { user_id: userId },
            include: [{
                model: Product,
                attributes: ['id', 'name', 'slug', 'price', 'images'] // Only include necessary product fields
            }],
            order: [['createdAt', 'DESC']]
        });

        // Calculate total
        const total = cartItems.reduce((sum, item) => {
            return sum + (item.quantity * item.Product.price);
        }, 0);

        res.status(200).json({
            success: true,
            data: {
                items: cartItems,
                subtotal: parseFloat(total.toFixed(2))
            }
        });
    } catch (error) {
        console.error('Error getting cart:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// POST / - Add an item to the cart
exports.addItem = async (req, res) => {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user.id;

    if (!productId) {
        return res.status(400).json({ success: false, message: 'Product ID is required.' });
    }

    try {
        // Check if the item already exists in the user's cart
        let cartItem = await CartItem.findOne({
            where: {
                user_id: userId,
                product_id: productId
            }
        });

        if (cartItem) {
            // If it exists, update the quantity
            cartItem.quantity += quantity;
            await cartItem.save();
        } else {
            // If it doesn't exist, create a new cart item
            cartItem = await CartItem.create({
                user_id: userId,
                product_id: productId,
                quantity: quantity
            });
        }

        // Respond with the updated item details
        const result = await CartItem.findByPk(cartItem.id, {
            include: [{ model: Product, attributes: ['name', 'price'] }]
        });

        res.status(201).json({ success: true, message: 'Item added to cart.', data: result });
    } catch (error) {
        console.error('Error adding item to cart:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// PUT /:itemId - Update item quantity in the cart
exports.updateItem = async (req, res) => {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;

    if (!quantity || quantity < 1) {
        return res.status(400).json({ success: false, message: 'A valid quantity is required.' });
    }

    try {
        const cartItem = await CartItem.findOne({ where: { id: itemId, user_id: userId } });

        if (!cartItem) {
            return res.status(404).json({ success: false, message: 'Cart item not found.' });
        }

        cartItem.quantity = quantity;
        await cartItem.save();

        res.status(200).json({ success: true, message: 'Cart updated.', data: cartItem });
    } catch (error) {
        console.error('Error updating cart item:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// DELETE /:itemId - Remove an item from the cart
exports.removeItem = async (req, res) => {
    const { itemId } = req.params;
    const userId = req.user.id;

    try {
        const cartItem = await CartItem.findOne({ where: { id: itemId, user_id: userId } });

        if (!cartItem) {
            return res.status(404).json({ success: false, message: 'Cart item not found.' });
        }

        await cartItem.destroy();
        res.status(200).json({ success: true, message: 'Item removed from cart.' });
    } catch (error) {
        console.error('Error removing cart item:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
