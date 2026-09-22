const express = require("express");
const cors = require("cors");
const pool = require("./db");
const foodsRouter = require("./routes/foods");
const mealsRouter = require("./routes/meals");
const nutritionRouter = require("./routes/nutrition");
const exercisesRouter = require("./routes/exercises");
const workoutsRouter = require("./routes/workouts");
const profileRouter = require("./routes/profile");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/api/foods", foodsRouter);
app.use("/api/meals", mealsRouter);
app.use("/api/nutrition", nutritionRouter);
app.use("/api/exercises", exercisesRouter);
app.use("/api/workouts", workoutsRouter);
app.use("/api/profile", profileRouter);
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to LifeFit API",
  });
});

app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      status: "healthy",
      database: "connected",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      status: "unhealthy",
      database: "disconnected",
    });
  }
});

app.listen(PORT, () => {
  console.log(`LifeFit backend running on http://localhost:${PORT}`);
});