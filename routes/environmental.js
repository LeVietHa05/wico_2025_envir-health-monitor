const express = require('express');
const router = express.Router();
const EnvironmentalData = require('../models/EnvironmentalData');

// GET all environmental data
router.get('/', async (req, res) => {
    try {
        const data = await EnvironmentalData.find();
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET one environmental data by ID
router.get('/:id', async (req, res) => {
    try {
        const data = await EnvironmentalData.findById(req.params.id);
        if (data) res.json(data);
        else res.status(404).json({ message: 'Data not found' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST new environmental data
router.post('/', async (req, res) => {
    const data = new EnvironmentalData({
        temperature: req.body.temperature,
        humidity: req.body.humidity,
        airQuality: req.body.airQuality,
        sensorId: req.body.sensorId
    });
    try {
        const newData = await data.save();
        res.status(201).json(newData);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT update environmental data
router.put('/:id', async (req, res) => {
    try {
        const data = await EnvironmentalData.findById(req.params.id);
        if (!data) return res.status(404).json({ message: 'Data not found' });

        data.temperature = req.body.temperature || data.temperature;
        data.humidity = req.body.humidity || data.humidity;
        data.airQuality = req.body.airQuality || data.airQuality;
        data.sensorId = req.body.sensorId || data.sensorId;

        const updatedData = await data.save();
        res.json(updatedData);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE environmental data
router.delete('/:id', async (req, res) => {
    try {
        const data = await EnvironmentalData.findById(req.params.id);
        if (!data) return res.status(404).json({ message: 'Data not found' });

        await data.remove();
        res.json({ message: 'Data deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;