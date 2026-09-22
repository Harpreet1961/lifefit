const express = require("express");
const pool = require("../db");

const router = express.Router();

// Get all meals with calculated nutrition
router.get("/", async (req, res) => {
  try {
    const { date } = req.query;

    const mealDate =
  date ||
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
  }).format(new Date());

    const result = await pool.query(
      `
      SELECT
        meals.id,
        users.name AS user_name,
        foods.name AS food_name,
        meals.meal_type,
        meals.quantity_g,
        meals.eaten_at,

        ROUND(
          (meals.quantity_g / 100) * foods.calories_per_100g,
          2
        ) AS total_calories,

        ROUND(
          (meals.quantity_g / 100) * foods.protein_per_100g,
          2
        ) AS total_protein,

        ROUND(
          (meals.quantity_g / 100) * foods.carbs_per_100g,
          2
        ) AS total_carbs,

        ROUND(
          (meals.quantity_g / 100) * foods.fat_per_100g,
          2
        ) AS total_fat

      FROM meals
      JOIN users ON meals.user_id = users.id
      JOIN foods ON meals.food_id = foods.id

      WHERE meals.user_id = 1
  AND meals.eaten_at >= $1::date
  AND meals.eaten_at < ($1::date + INTERVAL '1 day')

      ORDER BY meals.eaten_at DESC;
      `,
      [mealDate]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching meals:", error.message);

    res.status(500).json({
      error: "Failed to fetch meals",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      user_id,
      food_id,
      meal_type,
      quantity_g,
      meal_date,
    } = req.body;

    // Validate required fields
    if (
      !user_id ||
      !food_id ||
      !meal_type ||
      !quantity_g ||
      !meal_date
    ) {
      return res.status(400).json({
        error: "user_id, food_id, meal_type, and quantity_g and meal_date are required",
      });
    }

    // Validate gram quantity
    if (quantity_g <= 0) {
      return res.status(400).json({
        error: "quantity_g must be greater than zero",
      });
    }

    // Insert meal
    const result = await pool.query(
      `
   INSERT INTO meals (
  user_id,
  food_id,
  meal_type,
  quantity_g,
  quantity,
  eaten_at
)
VALUES (
  $1,
  $2,
  $3,
  $4,
  $4,
  $5::date + CURRENT_TIME
)
RETURNING id;
      `,
      [
        user_id,
        food_id,
        meal_type,
        quantity_g,
        meal_date,
      ]
    );

    const mealId = result.rows[0].id;

    // Fetch meal with calculated nutrition
    const mealResult = await pool.query(
      `
      SELECT
        meals.id,
        users.name AS user_name,
        foods.name AS food_name,
        meals.meal_type,
        meals.quantity_g,
        meals.eaten_at,

        ROUND(
          (meals.quantity_g / 100) * foods.calories_per_100g,
          2
        ) AS total_calories,

        ROUND(
          (meals.quantity_g / 100) * foods.protein_per_100g,
          2
        ) AS total_protein,

        ROUND(
          (meals.quantity_g / 100) * foods.carbs_per_100g,
          2
        ) AS total_carbs,

        ROUND(
          (meals.quantity_g / 100) * foods.fat_per_100g,
          2
        ) AS total_fat

      FROM meals
      JOIN users ON meals.user_id = users.id
      JOIN foods ON meals.food_id = foods.id
      WHERE meals.id = $1;
      `,
      [mealId]
    );

    res.status(201).json({
      message: "Meal added successfully",
      meal: mealResult.rows[0],
    });

  } catch (error) {
    console.error("Error adding meal:", error.message);

    res.status(500).json({
      error: "Failed to add meal",
    });
  }
});
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM meals
      WHERE id = $1
      RETURNING id;
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Meal not found",
      });
    }

    res.json({
      message: "Meal deleted successfully",
      id: result.rows[0].id,
    });
  } catch (error) {
    console.error("Error deleting meal:", error.message);

    res.status(500).json({
      error: "Failed to delete meal",
    });
  }
});

module.exports = router;