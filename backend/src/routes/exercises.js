
const express = require("express");
const pool = require("../db");

const router = express.Router();

// Get all exercises
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        name,
        muscle_group
      FROM exercises
      ORDER BY name;
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching exercises:", error.message);

    res.status(500).json({
      error: "Failed to fetch exercises",
    });
  }
});

module.exports = router;

