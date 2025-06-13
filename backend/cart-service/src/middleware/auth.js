exports.extractUser = (req, res, next) => {
    const userId = req.headers['x-user-id'];
    const userEmail = req.headers['x-user-email'];

    if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized: User ID not provided.' });
    }

    req.user = {
        id: parseInt(userId),
        email: userEmail
    };
    
    next();
};