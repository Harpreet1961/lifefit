const express = require("express");
const pool = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        name,
        calories_per_100g,
        protein_per_100g,
        carbs_per_100g,
        fat_per_100g,
        food_state
      FROM foods
      ORDER BY name;
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching foods:", error.message);

    res.status(500).json({
      error: "Failed to fetch foods",
    });
  }
});

module.exports = router;