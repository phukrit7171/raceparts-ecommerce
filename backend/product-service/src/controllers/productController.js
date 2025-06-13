// backend/product-service/src/controllers/productController.js
const { Product, Category, Op, sequelize } = require('../models');

// GET /products
exports.getAllProducts = async (req, res) => {
    try {
        const { page = 1, limit = 12, search, category: categorySlug, sort = 'createdAt', order = 'DESC' } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = { is_active: true };
        let categoryWhereClause = {};

        // Handle category filtering
        if (categorySlug) {
            categoryWhereClause.slug = categorySlug;
        }

        // Handle search
        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows } = await Product.findAndCountAll({
            where: whereClause,
            include: [{
                model: Category,
                as: 'category',
                where: categoryWhereClause,
                required: !!categorySlug // Makes the include an INNER JOIN if a category is specified
            }],
            limit,
            offset,
            order: [[sort, order]],
            distinct: true // Important for correct counting with includes
        });

        res.status(200).json({
            success: true,
            data: rows,
            pagination: {
                totalItems: count,
                totalPages: Math.ceil(count / limit),
                currentPage: parseInt(page),
                itemsPerPage: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// GET /products/slug/:slug
exports.getProductBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const product = await Product.findOne({
            where: { slug, is_active: true },
            include: {
                model: Category,
                as: 'category'
            }
        });

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.status(200).json({ success: true, data: product });
    } catch (error) {
        console.error(`Error fetching product by slug ${req.params.slug}:`, error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// GET /products/categories
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({
            order: [['name', 'ASC']],
            attributes: [
                'id', 
                'name', 
                'slug', 
                [sequelize.fn('COUNT', sequelize.col('products.id')), 'product_count']
            ],
            include: [{
                model: Product,
                as: 'products',
                attributes: [],
                where: { is_active: true },
                required: false
            }],
            group: ['Category.id']
        });
        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};