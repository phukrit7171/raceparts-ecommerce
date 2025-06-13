exports.extractUser = (req, res, next) => {
    const userId = req.headers['x-user-id'];
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized: User ID not provided.' });
    }
    req.user = { id: parseInt(userId) };
    next();
};