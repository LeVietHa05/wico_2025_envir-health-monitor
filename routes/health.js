const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all health data
router.get('/', (req, res) => {
    db.all('SELECT * FROM HealthData', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }
        res.json(rows);
    });
});

// GET one health data by ID
router.get('/:id', (req, res) => {
    db.get('SELECT * FROM HealthData WHERE id = ?', [req.params.id], (err, row) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }
        if (row) {
            res.json(row);
        } else {
            res.status(404).json({ message: 'Data not found' });
        }
    });
});

// POST new health data
router.post('/', (req, res) => {
    const { userId, heartRate, oxygenLevel, temperature } = req.body;
    db.run(
        'INSERT INTO HealthData (userId, heartRate, oxygenLevel, temperature) VALUES (?, ?, ?, ?)',
        [userId, heartRate, oxygenLevel, temperature],
        function (err) {
            if (err) {
                return res.status(400).json({ message: err.message });
            }
            res.status(201).json({ id: this.lastID, ...req.body });
        }
    );
});

// PUT update health data
router.put('/:id', (req, res) => {
    const { userId, heartRate, oxygenLevel, temperature } = req.body;
    db.run(
        'UPDATE HealthData SET userId = ?, heartRate = ?, oxygenLevel = ?, temperature = ? WHERE id = ?',
        [userId, heartRate, oxygenLevel, temperature, req.params.id],
        function (err) {
            if (err) {
                return res.status(400).json({ message: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ message: 'Data not found' });
            }
            res.json({ id: req.params.id, ...req.body });
        }
    );
});

// DELETE health data
router.delete('/:id', (req, res) => {
    db.run('DELETE FROM HealthData WHERE id = ?', [req.params.id], function (err) {
        if (err) {
            return res.status(500).json({ message: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: 'Data not found' });
        }
        res.json({ message: 'Data deleted' });
    });
});

module.exports = router;