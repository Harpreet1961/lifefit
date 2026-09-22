const express = require("express");
const pool = require("../db");

const router = express.Router();

// Get user profile
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        id,
        name,
        email,
        age,
        height_cm,
        current_weight_kg,
        goal_weight_kg,
        calorie_target,
        protein_target_g,
        created_at
      FROM users
      WHERE id = 1;
      `
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching profile:", error.message);

    res.status(500).json({
      error: "Failed to fetch profile",
    });
  }
});
// Update user profile
router.put("/", async (req, res) => {
  try {
    const {
      name,
      age,
      height_cm,
      current_weight_kg,
      goal_weight_kg,
      calorie_target,
      protein_target_g,
    } = req.body;

if (!name || !name.trim()) {
  return res.status(400).json({
    error: "name is required",
  });
}

if (age !== undefined && age !== null && age <= 0) {
  return res.status(400).json({
    error: "age must be greater than zero",
  });
}

if (
  height_cm !== undefined &&
  height_cm !== null &&
  height_cm <= 0
) {
  return res.status(400).json({
    error: "height_cm must be greater than zero",
  });
}

if (
  current_weight_kg !== undefined &&
  current_weight_kg !== null &&
  current_weight_kg <= 0
) {
  return res.status(400).json({
    error: "current_weight_kg must be greater than zero",
  });
}

if (
  goal_weight_kg !== undefined &&
  goal_weight_kg !== null &&
  goal_weight_kg <= 0
) {
  return res.status(400).json({
    error: "goal_weight_kg must be greater than zero",
  });
}

if (
  calorie_target !== undefined &&
  calorie_target !== null &&
  calorie_target <= 0
) {
  return res.status(400).json({
    error: "calorie_target must be greater than zero",
  });
}

if (
  protein_target_g !== undefined &&
  protein_target_g !== null &&
  protein_target_g <= 0
) {
  return res.status(400).json({
    error: "protein_target_g must be greater than zero",
  });
}

    const result = await pool.query(
      `
      UPDATE users
      SET
        name = $1,
        age = $2,
        height_cm = $3,
        current_weight_kg = $4,
        goal_weight_kg = $5,
        calorie_target = $6,
        protein_target_g = $7
      WHERE id = 1
      RETURNING
        id,
        name,
        email,
        age,
        height_cm,
        current_weight_kg,
        goal_weight_kg,
        calorie_target,
        protein_target_g,
        created_at;
      `,
      [
        name,
        age,
        height_cm,
        current_weight_kg,
        goal_weight_kg,
        calorie_target,
        protein_target_g,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.json({
      message: "Profile updated successfully",
      profile: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating profile:", error.message);

    res.status(500).json({
      error: "Failed to update profile",
    });
  }
});
module.exports = router;