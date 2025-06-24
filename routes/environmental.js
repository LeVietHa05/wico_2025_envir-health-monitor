const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all environmental data (public)
router.get('/', (req, res) => {
    db.all('SELECT * FROM EnvironmentalData', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }
        res.json(rows);
    });
});

// GET latest environmental data for each sensorId (public)
router.get('/latest', (req, res) => {
    let query = `
    SELECT e1.*
    FROM EnvironmentalData e1
    INNER JOIN (
      SELECT sensorId, MAX(timestamp) as maxTimestamp
      FROM EnvironmentalData
      GROUP BY sensorId
    ) e2 ON e1.sensorId = e2.sensorId AND e1.timestamp = e2.maxTimestamp
  `
  query = 'SElECT * FROM EnvironmentalData WHERE sensorId = ? ORDER BY timestamp DESC LIMIT 1'
    db.all(query, ["SENSOR_001"], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }
        res.json(rows);
    });
});

// GET one environmental data by ID (public)
router.get('/:id', (req, res) => {
    db.get('SELECT * FROM EnvironmentalData WHERE id = ? LIMIT 10', [req.params.id], (err, row) => {
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

// GET latest 10 environmental data points for a sensorId (public)
router.get('/sensor/:sensorId', (req, res) => {
    const sensorId = req.params.sensorId;
    console.log(`Fetching latest 10 data points for sensorId: ${sensorId}`);
    db.all(
        'SELECT * FROM EnvironmentalData WHERE sensorId = ? ORDER BY timestamp DESC LIMIT 10',
        [sensorId],
        (err, rows) => {
            if (err) {
                console.error('Error fetching data:', err.message);
                return res.status(500).json({ message: err.message });
            }
            res.json(rows.reverse()); // reverse to have oldest first
        }
    );
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
