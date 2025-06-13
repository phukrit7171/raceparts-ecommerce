// backend/product-service/src/controllers/productController.js
const { Product, Category, Op, sequelize } = require('../models');

// GET /products
exports.getAllProducts = async (req, res) => {
    try {
        // Destructure query parameters with defaults
        const { page = 1, limit = 12, search, category: categorySlug, sort = 'createdAt', order = 'DESC' } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = { is_active: true };
        let categoryWhereClause = {};

        // Add category filtering to the include
        if (categorySlug) {
            categoryWhereClause.slug = categorySlug;
        }

        // Add search term to the main where clause
        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } }
            ];
        }

        console.log('Product service: Executing advanced product search with query:', req.query);

        const { count, rows } = await Product.findAndCountAll({
            where: whereClause,
            include: [{
                model: Category,
                as: 'category',
                where: categoryWhereClause,
                required: !!categorySlug // Converts to INNER JOIN if category is specified, else LEFT JOIN
            }],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [[sort, order.toUpperCase()]],
            distinct: true // Ensures correct count when using includes
        });

        console.log(`Product service: Found ${count} total items, returning page ${page}.`);
        res.status(200).json({
            success: true,
            data: rows,
            pagination: {
                totalItems: count,
                totalPages: Math.ceil(count / limit),
                currentPage: parseInt(page),
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
        console.log(`Product service: Received request for slug: ${slug}`);
        const product = await Product.findOne({
            where: { slug, is_active: true },
            include: {
                model: Category,
                as: 'category'
            }
        });

        if (!product) {
            console.log(`Product service: Product with slug '${slug}' not found.`);
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        
        console.log(`Product service: Found product '${product.name}'.`);
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        console.error(`Error fetching product by slug ${req.params.slug}:`, error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// GET /categories
exports.getAllCategories = async (req, res) => {
    try {
        console.log('Product service: Received request for all categories.');
        const categories = await Category.findAll({
            order: [['name', 'ASC']],
            attributes: [
                'id', 
                'name', 
                'slug', 
                // This is a special Sequelize query to count the number of associated products for each category
                [sequelize.fn('COUNT', sequelize.col('products.id')), 'product_count']
            ],
            include: [{
                model: Product,
                as: 'products',
                attributes: [], // We don't need product data, just the count
                where: { is_active: true },
                required: false // Use a LEFT JOIN to include categories with 0 products
            }],
            group: ['Category.id', 'Category.name', 'Category.slug'] // Group by all non-aggregated columns
        });
        
        console.log(`Product service: Found ${categories.length} categories.`);
        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};