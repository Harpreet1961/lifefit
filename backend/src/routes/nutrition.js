const express = require("express");
const pool = require("../db");

const router = express.Router();

router.get("/today", async (req, res) => {
  try {
    const { date } = req.query

    const nutritionDate =
      date ||
      new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata',
      }).format(new Date())
   const result = await pool.query(
  `
      SELECT
        COALESCE(
          ROUND(
            SUM(
              (meals.quantity_g / 100) * foods.calories_per_100g
            ),
            2
          ),
          0
        ) AS total_calories,

        COALESCE(
          ROUND(
            SUM(
              (meals.quantity_g / 100) * foods.protein_per_100g
            ),
            2
          ),
          0
        ) AS total_protein,

        COALESCE(
          ROUND(
            SUM(
              (meals.quantity_g / 100) * foods.carbs_per_100g
            ),
            2
          ),
          0
        ) AS total_carbs,

        COALESCE(
          ROUND(
            SUM(
              (meals.quantity_g / 100) * foods.fat_per_100g
            ),
            2
          ),
          0
        ) AS total_fat

      FROM meals
      JOIN foods ON meals.food_id = foods.id

     WHERE meals.user_id = 1
  AND meals.eaten_at >= $1::date
  AND meals.eaten_at < ($1::date + INTERVAL '1 day');
    `
    , [nutritionDate]);

    res.json(result.rows[0]);

  } catch (error) {
    console.error("Error calculating today's nutrition:", error.message);

    res.status(500).json({
      error: "Failed to calculate today's nutrition",
    });
  }
});

module.exports = router;