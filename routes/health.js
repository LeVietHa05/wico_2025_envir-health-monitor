const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// GET health data (authenticated, user-specific or admin)
router.get('/', authMiddleware, (req, res) => {
    const query = req.user.role === 'admin'
        ? 'SELECT h.*, u.email, u.sensorId FROM HealthData h JOIN Users u ON h.userId = u.id '
        : 'SELECT * FROM HealthData WHERE userId = ?';
    const params = req.user.role === 'admin' ? [] : [req.user.id];
    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }
        console.log('Health data retrieved:', rows);
        res.json(rows);
    });
});

// GET one health data by ID (authenticated, user-specific or admin)
router.get('/:id', authMiddleware, (req, res) => {
    db.get('SELECT * FROM HealthData WHERE id = ?', [req.params.id], (err, row) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }
        if (!row) {
            return res.status(404).json({ message: 'Data not found' });
        }
        if (row.userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }
        res.json(row);
    });
});

// POST new health data (authenticated)
router.post('/', authMiddleware, (req, res) => {
    const { heartRate, oxygenLevel, temperature } = req.body;
    db.run(
        'INSERT INTO HealthData (userId, heartRate, oxygenLevel, temperature) VALUES (?, ?, ?, ?)',
        [req.user.id, heartRate, oxygenLevel, temperature],
        function (err) {
            if (err) {
                return res.status(400).json({ message: err.message });
            }
            res.status(201).json({ id: this.lastID, userId: req.user.id, ...req.body });
        }
    );
});

// PUT update health data (authenticated, user-specific or admin)
router.put('/:id', authMiddleware, (req, res) => {
    db.get('SELECT * FROM HealthData WHERE id = ?', [req.params.id], (err, row) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }
        if (!row) {
            return res.status(404).json({ message: 'Data not found' });
        }
        if (row.userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }
        const { heartRate, oxygenLevel, temperature } = req.body;
        db.run(
            'UPDATE HealthData SET heartRate = ?, oxygenLevel = ?, temperature = ? WHERE id = ?',
            [heartRate, oxygenLevel, temperature, req.params.id],
            function (err) {
                if (err) {
                    return res.status(400).json({ message: err.message });
                }
                res.json({ id: req.params.id, userId: row.userId, ...req.body });
            }
        );
    });
});

// DELETE health data (authenticated, user-specific or admin)
router.delete('/:id', authMiddleware, (req, res) => {
    db.get('SELECT * FROM HealthData WHERE id = ?', [req.params.id], (err, row) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }
        if (!row) {
            return res.status(404).json({ message: 'Data not found' });
        }
        if (row.userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }
        db.run('DELETE FROM HealthData WHERE id = ?', [req.params.id], function (err) {
            if (err) {
                return res.status(500).json({ message: err.message });
            }
            res.json({ message: 'Data deleted' });
        });
    });
});

module.exports = router;