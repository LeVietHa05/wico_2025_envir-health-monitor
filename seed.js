const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const admin = require("firebase-admin");
const dotenv = require("dotenv");
dotenv.config();

const serviceAccountPath = path.join(__dirname, "/firebase-adminsdk.json");
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = new sqlite3.Database(path.join(__dirname, "database.db"), (err) => {
  if (err) {
    console.error("Error connecting to SQLite:", err.message);
  } else {
    console.log("Connected to SQLite database");
  }
});

const users = [
  {
    email: "admin@example.com",
    password: "admin123",
    role: "admin",
    sensorId: null,
  },
  {
    email: "user1@example.com",
    password: "user123",
    role: "user",
    sensorId: null,
  },
  {
    email: "user2@example.com",
    password: "user123",
    role: "user",
    sensorId: null,
  },
];

const environmentalData = [
  {
    temperature: 25.5,
    humidity: 60,
    pm25: 15,
    pm10: 25,
    pm1: 10,
    uv: 3,
    aqi: 2,
    sensorId: "SENSOR_001",
  },
  {
    temperature: 28.0,
    humidity: 55,
    pm25: 20,
    pm10: 30,
    pm1: 12,
    uv: 4,
    aqi: 2,
    sensorId: "SENSOR_002",
  },
  {
    temperature: 22.3,
    humidity: 65,
    pm25: 10,
    pm10: 15,
    pm1: 8,
    uv: 2,
    aqi: 2,
    sensorId: "SENSOR_003",
  },
];

const healthData = [
  {
    userId: "2",
    sensorId: "SENSOR_002",
    heartRate: 72,
    oxygenLevel: 98,
    temperature: 36.6,
  },
  {
    userId: "3",
    sensorId: "SENSOR_003",
    heartRate: 68,
    oxygenLevel: 100,
    temperature: 36.5,
  },
];

async function seedDatabase() {
  //   for (const user of users) {
  //     try {
  //       const userRecord = await admin.auth().createUser({
  //         email: user.email,
  //         password: user.password,
  //       });
  //       db.run(
  //         `INSERT INTO Users (email, role, sensorId, firebaseUid) VALUES (?, ?, ?, ?)`,
  //         [user.email, user.role, user.sensorId, userRecord.uid],
  //         function (err) {
  //           if (err) {
  //             console.error("Error inserting User:", err.message);
  //             admin.auth().deleteUser(userRecord.uid);
  //           } else {
  //             console.log(`Inserted User with ID: ${this.lastID}`);
  //           }
  //         }
  //       );
  //     } catch (err) {
  //       console.error("Error creating Firebase user:", err.message);
  //     }
  //   }

  //   environmentalData.forEach((data) => {
  //     db.run(
  //       `INSERT INTO EnvironmentalData (temperature, humidity, pm25, pm10, pm1, uv, sensorId) VALUES (?, ?, ?, ?, ?, ?, ?)`,
  //       [
  //         data.temperature,
  //         data.humidity,
  //         data.pm25,
  //         data.pm10,
  //         data.pm1,
  //         data.uv,
  //         data.sensorId,
  //       ],
  //       function (err) {
  //         if (err) {
  //           console.error("Error inserting EnvironmentalData:", err.message);
  //         } else {
  //           console.log(`Inserted EnvironmentalData with ID: ${this.lastID}`);
  //         }
  //       }
  //     );
  //   });

  //   healthData.forEach((data) => {
  //     db.run(
  //       `INSERT INTO HealthData (userId, sensorId,  heartRate, oxygenLevel, temperature) VALUES (?, ?, ?, ?, ?)`,
  //       [
  //         data.userId,
  //         data.sensorId,
  //         data.heartRate,
  //         data.oxygenLevel,
  //         data.temperature,
  //       ],
  //       function (err) {
  //         if (err) {
  //           console.error("Error inserting HealthData:", err.message);
  //         } else {
  //           console.log(`Inserted HealthData with ID: ${this.lastID}`);
  //         }
  //       }
  //     );
  //   });

  db.run(
    `UPDATE Users SET 
  id='1',
  email='admin@example.com',
  role='admin',
  sensorId='SENSOR_001',
  firebaseUid='FlbFpW89Kxh4sUKPCzSI5x0RVpu2'
 WHERE id=1; SELECT * FROM User`,
    function (err) {
      console.log(err);
    }
  );
  db.close((err) => {
    if (err) {
      console.error("Error closing database:", err.message);
    } else {
      console.log("Database connection closed");
    }
  });
}

seedDatabase();
