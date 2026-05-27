import { Router } from "express";
import User from "../models/user.model.js";
import passport from "passport";
import { sendAuthNotification } from "../config/mq.js";
import jwt from "jsonwebtoken";

const router = Router();


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
            user = new User({
                googleId: id,
                email: emails[0].value,
                name: displayName,
                avatar: photos[0].value
            });
            await user.save();
        }

        await sendAuthNotification({
            userId: user._id,
            action: 'google_login',
            timestamp: new Date(),
            email: emails[0].value
        })

        // Generate JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Set token in cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'Lax',
            // domain: "localhost",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        res.redirect(`http://localhost:5173/auth/callback?token=${token}`); // Redirect to your frontend after successful login
    } catch (err) {
        console.error('Error during Google authentication:', err);
        res.redirect('http://localhost:5173'); // Redirect to your frontend on error
    }
});


export default router;