const option = {
  allowEIO3: true,
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    transports: ["websocket", "polling"],
    credentials: true,
  },
};

const TOKEN_AQI_API = "b95e23725dc391147ec1de8db91cda9adaaf93b5";
const api_endpoint = `https://api.waqi.info/feed/here/?token=${TOKEN_AQI_API}`;

const db = require("./db");

const io = require("socket.io")(option);

const socketapi = {
  io: io,
};

const maxEnvirLength = 10;
const maxHealthLength = 2;

const envirData = {
  humidity: [],
  temperature: [],
  uv: [],
  pm25: [],
  pm1: [],
  pm10: [],
  aqi: [],
};
const healthData = {
  objectTemp: [],
  ambientTemp: [],
  heartRate: [],
  spo2: [],
};

function calculateAverage(dataArray) {
  if (dataArray.length === 0) return 0;
  const sum = dataArray.reduce((acc, val) => acc + val, 0);
  return +(sum / dataArray.length).toFixed(2);
}

let deviceStatus = "offline";
io.on("connection", (socket) => {
  let sensorId = "";
  lastPong = Date.now();
  console.log("[INFO] new connection: [" + socket.id + "]");
  socket.on("message", (data) => {
    if (typeof data == "string" && data.indexOf("test") >= 0) {
      console.log("test");
      socket.broadcast.emit("message", data);
      return;
    }
    sensorId = data.sensorId ? data.sensorId : "web";
    if (sensorId == "esp32") deviceStatus = "online";
    console.log(
      `message from ${data.sensorId ? data.sensorId : "web"} via socket id: ${
        socket.id
      } on topic message`
    );

    if (+data.spo2 !== 0) {
      for (const key in healthData) {
        if (data.hasOwnProperty(key) && healthData.hasOwnProperty(key)) {
          healthData[key].push(+data[key]);
        }
      }
      if (healthData.objectTemp.length >= maxHealthLength) {
        const averageHealth = {
          objectTemp: calculateAverage(healthData.objectTemp),
          heartRate: calculateAverage(healthData.heartRate),
          spo2: calculateAverage(healthData.spo2),
        };
        console.log(averageHealth)
        //clear healthData
        for (const key in healthData) {
          healthData[key] = [];
        }

        db.get(
          "SELECT id FROM Users WHERE sensorId = ?",
          [data.sensorId],
          (err, row) => {
            if (err) {
              console.log("No matching user for sensor: " + data.sensorId);
            }
            if (row) {
              console.log(row);

              db.run(
                "INSERT INTO HealthData (userId, sensorId, heartRate, oxygenLevel, temperature) VALUES (? ,?,?,?,?)",
                [
                  row.id,
                  data.sensorId,
                  averageHealth.heartRate,
                  averageHealth.spo2,
                  averageHealth.objectTemp,
                ],
                (err) => {
                  if (err) {
                    console.error("Error inserting HealthData:", err.message);
                  } else {
                    socket.broadcast.emit("/data/health", {
                      heartRateIndex: averageHealth.heartRate,
                      oxygenIndex: averageHealth.spo2,
                      healthTempIndex: averageHealth.objectTemp,
                    });
                    console.log(`Inserted HealthData for userId: ${row.id}`);
                  }
                }
              );
            }
          }
        );
      }
    }

    //lay du lieu online bu vao neu khong do duoc
    if (+data.aqi == 0) {
      fetch(api_endpoint)
        .then((res) => res.json())
        .then((res) => {
          data.aqi = res.data.aqi;
        });
    }

    for (const key in envirData) {
      if (data.hasOwnProperty(key) && envirData.hasOwnProperty(key)) {
        envirData[key].push(+data[key]);
      }
    }
    if (envirData.humidity.length >= maxEnvirLength) {
      const averageData = {
        humidity: calculateAverage(envirData.humidity),
        temperature: calculateAverage(envirData.temperature),
        uv: calculateAverage(envirData.uv),
        pm25: calculateAverage(envirData.pm25),
        pm1: calculateAverage(envirData.pm1),
        pm10: calculateAverage(envirData.pm10),
        aqi: calculateAverage(envirData.aqi),
      };

      //clear the data in envir
      for (const key in envirData) {
        if (envirData.hasOwnProperty(key)) {
          envirData[key] = [];
        }
      }

      db.run(
        "INSERT INTO EnvironmentalData (temperature, humidity, pm25, pm10, pm1, uv, aqi, sensorId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          averageData.temperature,
          averageData.humidity,
          averageData.pm25,
          averageData.pm10,
          averageData.pm1,
          averageData.uv,
          averageData.aqi,
          data.sensorId,
        ],
        function (err) {
          if (err) {
            console.log(err)
            console.log("error inserting data into db");
          } else {
            socket.broadcast.emit("/data/envir", {
              tempIndex: averageData.temperature,
              humiIndex: averageData.humidity,
              pm25Index: averageData.pm25,
              uvIndex: averageData.uv,
              aqiIndex: averageData.aqi,
            });
            console.log("New data added to db");
          }
        }
      );
    }
  });

  // socket.on("/esp/pong", (data) => {
  // lastPong = Date.now();
  // })
  //
  // setInterval(() => {
  // if (Date.now - lastPong > 5000 && deviceID == "esp32") {
  // console.log("[" + socket.id + "] is offline");
  // deviceStatus = "offline";
  // }
  // socket.broadcast.emit("deviceStatus", deviceStatus);
  // }, 1000)
  /**************************** */
  //xu ly chung
  socket.on("reconnect", function () {
    console.log("[" + socket.id + "] reconnect.");
  });
  socket.on("disconnect", () => {
    console.log("[" + socket.id + "] disconnect.");
    socket.broadcast.emit("deviceStatus", "offline");
  });
  socket.on("connect_error", (err) => {
    console.log(err.stack);
  });
});
module.exports = socketapi;
