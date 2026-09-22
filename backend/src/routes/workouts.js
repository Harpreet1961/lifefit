
const express = require("express");
const pool = require("../db");

const router = express.Router();

// Get workouts for a specific date
router.get("/", async (req, res) => {
  try {
    const { date } = req.query;

    const workoutDate =
      date ||
      new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
      }).format(new Date());

    const result = await pool.query(
      `
      SELECT
        workouts.id,
        users.name AS user_name,
        exercises.name AS exercise_name,
        exercises.muscle_group,
        workouts.sets,
        workouts.reps,
        workouts.weight,
        workouts.performed_at

      FROM workouts
      JOIN users
        ON workouts.user_id = users.id
      JOIN exercises
        ON workouts.exercise_id = exercises.id

      WHERE workouts.user_id = 1
        AND workouts.performed_at >= $1::date
        AND workouts.performed_at < ($1::date + INTERVAL '1 day')

      ORDER BY workouts.performed_at DESC;
      `,
      [workoutDate]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching workouts:", error.message);

    res.status(500).json({
      error: "Failed to fetch workouts",
    });
  }
});

// Add a workout
router.post("/", async (req, res) => {
  try {
    const {
      user_id,
      exercise_id,
      sets,
      reps,
      weight,
      workout_date,
    } = req.body;

    // Validate required fields
    if (
      !user_id ||
      !exercise_id ||
      !sets ||
      !reps ||
      weight === undefined ||
      !workout_date
    ) {
      return res.status(400).json({
        error:
          "user_id, exercise_id, sets, reps, weight, and workout_date are required",
      });
    }

    // Validate values
    if (sets <= 0 || reps <= 0 || weight < 0) {
      return res.status(400).json({
        error:
          "sets and reps must be greater than zero, and weight cannot be negative",
      });
    }

    // Insert workout
    const result = await pool.query(
      `
      INSERT INTO workouts (
        user_id,
        exercise_id,
        sets,
        reps,
        weight,
        performed_at
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6::date + CURRENT_TIME
      )
      RETURNING id;
      `,
      [
        user_id,
        exercise_id,
        sets,
        reps,
        weight,
        workout_date,
      ]
    );

    const workoutId = result.rows[0].id;

    // Return the newly created workout
    const workoutResult = await pool.query(
      `
      SELECT
        workouts.id,
        users.name AS user_name,
        exercises.name AS exercise_name,
        exercises.muscle_group,
        workouts.sets,
        workouts.reps,
        workouts.weight,
        workouts.performed_at

      FROM workouts
      JOIN users
        ON workouts.user_id = users.id
      JOIN exercises
        ON workouts.exercise_id = exercises.id

      WHERE workouts.id = $1;
      `,
      [workoutId]
    );

    res.status(201).json({
      message: "Workout added successfully",
      workout: workoutResult.rows[0],
    });

  } catch (error) {
    console.error("Error adding workout:", error.message);

    res.status(500).json({
      error: "Failed to add workout",
    });
  }
});
// Delete a workout
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM workouts
      WHERE id = $1
      RETURNING id;
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Workout not found",
      });
    }

    res.json({
      message: "Workout deleted successfully",
      id: result.rows[0].id,
    });
  } catch (error) {
    console.error("Error deleting workout:", error.message);

    res.status(500).json({
      error: "Failed to delete workout",
    });
  }
});

module.exports = router;

