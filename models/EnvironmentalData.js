const mongoose = require('mongoose');

const environmentalDataSchema = new mongoose.Schema({
    temperature: { type: Number, required: false, default: 0 },
    humidity: { type: Number, required: false, default: 0 },
    pm25: { type: Number, required: false, default: 0 },
    pm10: { type: Number, required: false, default: 0 },
    pm1: { type: Number, required: false, default: 0 },
    uv: { type: Number, required: false, default: 0 },
    timestamp: { type: Date, default: Date.now },
    sensorId: { type: String, required: false, default: 0 },
});

module.exports = mongoose.model('EnvironmentalData', environmentalDataSchema);