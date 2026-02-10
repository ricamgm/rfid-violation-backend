const express = require("express");
const cors = require("cors");

const rfidRoutes = require("./routes/rfid.routes");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);
app.use(express.json());

app.use("/api/rfid", rfidRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

module.exports = app;
