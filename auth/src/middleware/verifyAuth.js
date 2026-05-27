import jwt from 'jsonwebtoken';

export const verifyAuth = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = payload.id;
        next();
    } catch {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};