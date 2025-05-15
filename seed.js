const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Kết nối tới database.db
const db = new sqlite3.Database(path.join(__dirname, 'database.db'), (err) => {
    if (err) {
        console.error('Error connecting to SQLite:', err.message);
        return;
    }
    console.log('Connected to SQLite database');
});

// Dữ liệu giả cho EnvironmentalData
const environmentalData = [
    { temperature: 25.5, humidity: 60, pm25: 15, pm10: 25, pm1: 10, uv: 3, sensorId: 'SENSOR_001' },
    { temperature: 28.0, humidity: 55, pm25: 20, pm10: 30, pm1: 12, uv: 4, sensorId: 'SENSOR_002' },
    { temperature: 22.3, humidity: 65, pm25: 10, pm10: 15, pm1: 8, uv: 2, sensorId: 'SENSOR_003' },
    { temperature: 30.1, humidity: 50, pm25: 25, pm10: 35, pm1: 15, uv: 5, sensorId: 'SENSOR_001' },
];

// Dữ liệu giả cho HealthData
const healthData = [
    { userId: 'USER_001', heartRate: 72, oxygenLevel: 98, temperature: 36.6 },
    { userId: 'USER_002', heartRate: 65, oxygenLevel: 97, temperature: 36.8 },
    { userId: 'USER_003', heartRate: 80, oxygenLevel: 99, temperature: 36.5 },
    { userId: 'USER_001', heartRate: 70, oxygenLevel: 96, temperature: 36.7 },
];

// Hàm chèn dữ liệu giả
function seedDatabase() {
    // Chèn EnvironmentalData
    environmentalData.forEach((data) => {
        db.run(
            `INSERT INTO EnvironmentalData (temperature, humidity, pm25, pm10, pm1, uv, sensorId) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [data.temperature, data.humidity, data.pm25, data.pm10, data.pm1, data.uv, data.sensorId],
            function (err) {
                if (err) {
                    console.error('Error inserting EnvironmentalData:', err.message);
                } else {
                    console.log(`Inserted EnvironmentalData with ID: ${this.lastID}`);
                }
            }
        );
    });

    // Chèn HealthData
    healthData.forEach((data) => {
        db.run(
            `INSERT INTO HealthData (userId, heartRate, oxygenLevel, temperature) VALUES (?, ?, ?, ?)`,
            [data.userId, data.heartRate, data.oxygenLevel, data.temperature],
            function (err) {
                if (err) {
                    console.error('Error inserting HealthData:', err.message);
                } else {
                    console.log(`Inserted HealthData with ID: ${this.lastID}`);
                }
            }
        );
    });

    // Đóng kết nối sau khi chèn xong
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('Database connection closed');
        }
    });
}

// Chạy hàm chèn dữ liệu
seedDatabase();