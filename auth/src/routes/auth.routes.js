import { Router } from "express";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import passport from "passport";
import { sendAuthNotification } from "../config/mq.js";
import jwt from "jsonwebtoken";
import { verifyAuth } from '../middleware/verifyAuth.js';

const router = Router();

// ─── Helpers ─────────────────────────────────────────────────────────────────

const signToken = (userId) =>
    jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

const setAuthCookie = (res, token) =>
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

// ─── Email / Password ─────────────────────────────────────────────────────────

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Basic validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'name, email and password are required' });
        }
        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters' });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({ message: 'Email already in use' });
        }

        const hashed = await bcrypt.hash(password, 12);

        const user = await User.create({ name, email, password: hashed });

        await sendAuthNotification({
            userId: user._id,
            action: 'register',
            timestamp: new Date(),
            email: user.email
        });

        const token = signToken(user._id);
        setAuthCookie(res, token);

        // res.status(201).json({
        //     message: 'Account created',
        //     token,
        //     user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar }
        // });
        
        res.redirect(`http://localhost:5173/auth/callback?token=${token}`);
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'email and password are required' });
        }

        const user = await User.findOne({ email });

        // User doesn't exist, or signed up via Google (no password set)
        if (!user || !user.password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        await sendAuthNotification({
            userId: user._id,
            action: 'login',
            timestamp: new Date(),
            email: user.email
        });

        const token = signToken(user._id);
        setAuthCookie(res, token);

        // res.status(200).json({
        //     message: 'Login successful',
        //     token,
        //     user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar }
        // });
        
        res.redirect(`http://localhost:5173/auth/callback?token=${token}`);
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// ─── Google OAuth ─────────────────────────────────────────────────────────────

router.get('/google', passport.authenticate('google', {
    session: false,
    scope: ['profile', 'email']
}));

router.get('/google/callback', passport.authenticate('google', {
    session: false,
    failureRedirect: '/'
}), async (req, res) => {
    try {
        const { id, displayName, emails, photos } = req.user;
        let user = await User.findOne({ googleId: id });

        if (!user) {
            user = await User.create({
                googleId: id,
                email: emails[0].value,
                name: displayName,
                avatar: photos[0].value
            });
        }

        await sendAuthNotification({
            userId: user._id,
            action: 'google_login',
            timestamp: new Date(),
            email: emails[0].value
        });

        const token = signToken(user._id);
        setAuthCookie(res, token);

        res.redirect(`http://localhost:5173/auth/callback?token=${token}`);
    } catch (err) {
        console.error('Google auth error:', err);
        res.redirect('http://localhost:5173');
    }
});

router.get('/me', verifyAuth, async (req, res) => {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
});

router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logged out successfully' });
});

export default router;