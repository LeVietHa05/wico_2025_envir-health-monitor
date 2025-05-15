const mongoose = require('mongoose');

const healthDataSchema = new mongoose.Schema({
    userId: { type: String, required: false, default: "" },
    heartRate: { type: Number, required: false, default: 0 },
    oxygenLevel: { type: Number, required: false, default: 0 },
    temperature: { type: Number, required: false, default: 0 },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('HealthData', healthDataSchema);