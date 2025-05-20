const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

if (!process.env.FIREBASE_ADMIN_CREDENTIAL_PATH) {
    console.error('Error: FIREBASE_ADMIN_CREDENTIAL_PATH is not defined in .env');
    process.exit(1);
}

const serviceAccountPath = require('path').resolve(__dirname, process.env.FIREBASE_ADMIN_CREDENTIAL_PATH);
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

router.post('/register', async (req, res) => {
    const { email } = req.body;
    try {
        let userRecord;
        try {
            userRecord = await admin.auth().getUserByEmail(email);
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                return res.status(400).json({ message: 'User not found in Firebase. Please register via client.' });
            }
            throw error;
        }

        db.get('SELECT * FROM Users WHERE email = ?', [email], (err, existingUser) => {
            if (err) {
                return res.status(500).json({ message: 'Database error' });
            }
            if (existingUser) {
                admin.auth().deleteUser(userRecord.uid).catch((deleteErr) => {
                    console.error('Error deleting Firebase user:', deleteErr.message);
                });
                return res.status(400).json({ message: 'Email already registered in database' });
            }

            db.run(
                'INSERT INTO Users (email, role, firebaseUid) VALUES (?, ?, ?)',
                [email, 'user', userRecord.uid],
                function (err) {
                    if (err) {
                        admin.auth().deleteUser(userRecord.uid).catch((deleteErr) => {
                            console.error('Error deleting Firebase user:', deleteErr.message);
                        });
                        return res.status(400).json({ message: 'Error creating user in database' });
                    }
                    res.status(201).json({ message: 'User registered' });
                }
            );
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/login', async (req, res) => {
    const { email } = req.body;
    try {
        const userRecord = await admin.auth().getUserByEmail(email);
        db.get('SELECT * FROM Users WHERE firebaseUid = ?', [userRecord.uid], (err, user) => {
            if (err || !user) {
                return res.status(404).json({ message: 'User not found' });
            }
            const token = jwt.sign(
                { id: user.id, role: user.role, sensorId: user.sensorId },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );
            res.json({ token });
        });
    } catch (err) {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const link = await admin.auth().generatePasswordResetLink(email);
        res.json({ message: 'Password reset link sent' });
    } catch (err) {
        res.status(400).json({ message: 'Email not found or error occurred' });
    }
});

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
            res.json({ message: 'Gán sensor thành công' });
        }
    );
});

router.post('/logout', authMiddleware, (req, res) => {
    try {
        // Vì token được lưu ở client, server chỉ cần xác nhận yêu cầu
        res.json({ message: 'Logged out successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error logging out' });
    }
});

module.exports = router;