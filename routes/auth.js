const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

// Đăng ký
router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.run(
            'INSERT INTO Users (email, password) VALUES (?, ?)',
            [email, hashedPassword],
            function (err) {
                if (err) {
                    return res.status(400).json({ message: 'Email already exists' });
                }
                res.status(201).json({ message: 'User registered' });
            }
        );
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Đăng nhập
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    db.get('SELECT * FROM Users WHERE email = ?', [email], async (err, user) => {
        if (err || !user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        res.json({ token });
    });
});

// Đổi mật khẩu
router.post('/change-password', authMiddleware, async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    db.get('SELECT password FROM Users WHERE id = ?', [req.user.id], async (err, user) => {
        if (err || !user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid old password' });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        db.run(
            'UPDATE Users SET password = ? WHERE id = ?',
            [hashedPassword, req.user.id],
            (err) => {
                if (err) {
                    return res.status(500).json({ message: err.message });
                }
                res.json({ message: 'Password changed' });
            }
        );
    });
});

// Quên mật khẩu
router.post('/forgot-password', (req, res) => {
    const { email } = req.body;
    db.get('SELECT * FROM Users WHERE email = ?', [email], (err, user) => {
        if (err || !user) {
            return res.status(404).json({ message: 'Email not found' });
        }
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const expiry = new Date(Date.now() + 3600000).toISOString();
        db.run(
            'UPDATE Users SET resetToken = ?, resetTokenExpiry = ? WHERE id = ?',
            [token, expiry, user.id],
            (err) => {
                if (err) {
                    return res.status(500).json({ message: err.message });
                }
                // Giả lập gửi email
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS,
                    },
                });
                transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: email,
                    subject: 'Password Reset',
                    text: `Use this token to reset your password: ${token}`,
                }).then(() => {
                    res.json({ message: 'Reset token sent to email' });
                }).catch((err) => {
                    res.status(500).json({ message: 'Error sending email' });
                });
            }
        );
    });
});

// Reset mật khẩu
router.post('/reset-password', (req, res) => {
    const { token, newPassword } = req.body;
    db.get(
        'SELECT * FROM Users WHERE resetToken = ? AND resetTokenExpiry > ?',
        [token, new Date().toISOString()],
        async (err, user) => {
            if (err || !user) {
                return res.status(400).json({ message: 'Invalid or expired token' });
            }
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            db.run(
                'UPDATE Users SET password = ?, resetToken = NULL, resetTokenExpiry = NULL WHERE id = ?',
                [hashedPassword, user.id],
                (err) => {
                    if (err) {
                        return res.status(500).json({ message: err.message });
                    }
                    res.json({ message: 'Password reset successful' });
                }
            );
        }
    );
});

// Gán sensorId
router.post('/assign-sensor', authMiddleware, (req, res) => {
    const { sensorId } = req.body;
    db.run(
        'UPDATE Users SET sensorId = ? WHERE id = ?',
        [sensorId, req.user.id],
        function (err) {
            if (err) {
                return res.status(400).json({ message: 'Sensor ID already assigned' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.json({ message: 'Sensor ID assigned' });
        }
    );
});

module.exports = router;