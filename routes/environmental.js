const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all environmental data
router.get('/', (req, res) => {
    db.all('SELECT * FROM EnvironmentalData', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }
        res.json(rows);
    });
});

// GET one environmental data by ID
router.get('/:id', (req, res) => {
    db.get('SELECT * FROM EnvironmentalData WHERE id = ?', [req.params.id], (err, row) => {
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

// POST new environmental data
router.post('/', (req, res) => {
    const { temperature, humidity, pm25, pm10, pm1, uv, sensorId } = req.body;
    db.run(
        'INSERT INTO EnvironmentalData (temperature, humidity, pm25, pm10, pm1, uv, sensorId) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [temperature, humidity, pm25, pm10, pm1, uv, sensorId],
        function (err) {
            if (err) {
                return res.status(400).json({ message: err.message });
            }
            res.status(201).json({ id: this.lastID, ...req.body });
        }
    );
});

// PUT update environmental data
router.put('/:id', (req, res) => {
    const { temperature, humidity, pm25, pm10, pm1, uv, sensorId } = req.body;
    db.run(
        'UPDATE EnvironmentalData SET temperature = ?, humidity = ?, pm25 = ?, pm10 = ?, pm1 = ?, uv = ?, sensorId = ? WHERE id = ?',
        [temperature, humidity, pm25, pm10, pm1, uv, sensorId, req.params.id],
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

// DELETE environmental data
router.delete('/:id', (req, res) => {
    db.run('DELETE FROM EnvironmentalData WHERE id = ?', [req.params.id], function (err) {
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