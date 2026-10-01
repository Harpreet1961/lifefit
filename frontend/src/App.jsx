import { useEffect, useState } from 'react'
import './App.css'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

function App() {
  const [selectedDate, setSelectedDate] = useState(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
    }).format(new Date())
  )
  const [nutrition, setNutrition] = useState(null)
  const [meals, setMeals] = useState([])
  const [foods, setFoods] = useState([])
  const [exercises, setExercises] = useState([])
  const [workouts, setWorkouts] = useState([])
  const [profile, setProfile] = useState(null)
  const [profileForm, setProfileForm] = useState({
    name: '',
    age: '',
    height_cm: '',
    current_weight_kg: '',
    goal_weight_kg: '',
    calorie_target: '',
    protein_target_g: '',
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  const [mealType, setMealType] = useState('Breakfast')
  const [foodId, setFoodId] = useState('')
  const [quantityG, setQuantityG] = useState('')
  const [addingMeal, setAddingMeal] = useState(false)
  const [deletingMeal, setDeletingMeal] = useState(null)
  const [exerciseId, setExerciseId] = useState('')
  const [sets, setSets] = useState('')
  const [reps, setReps] = useState('')
  const [weight, setWeight] = useState('')
  const [addingWorkout, setAddingWorkout] = useState(false)
  const [deletingWorkout, setDeletingWorkout] = useState(null)
  /* BMI Calucluation */
  const bmi =
    profile?.height_cm && profile?.current_weight_kg
      ? (
        profile.current_weight_kg /
        Math.pow(profile.height_cm / 100, 2)
      ).toFixed(1)
      : null

  /* Target vs Actual Calories*/

  const calorieTarget = profile?.calorie_target || 0
  const proteinTarget = profile?.protein_target_g || 0

  const caloriesConsumed = Number(
    nutrition?.total_calories || 0
  )

  const proteinConsumed = Number(
    nutrition?.total_protein || 0
  )

  const caloriesRemaining =
    calorieTarget - caloriesConsumed

  const proteinRemaining =
    proteinTarget - proteinConsumed
  const caloriesOver =
    caloriesConsumed > calorieTarget
      ? caloriesConsumed - calorieTarget
      : 0

  const proteinOver =
    proteinConsumed > proteinTarget
      ? proteinConsumed - proteinTarget
      : 0
  const calorieProgress =
    calorieTarget > 0
      ? Math.min((caloriesConsumed / calorieTarget) * 100, 100)
      : 0

  const proteinProgress =
    proteinTarget > 0
      ? Math.min((proteinConsumed / proteinTarget) * 100, 100)
      : 0

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError('')

        const [
          nutritionResponse,
          mealsResponse,
          foodsResponse,
          exercisesResponse,
          workoutsResponse,
          profileResponse,
        ] = await Promise.all([
          fetch(`${API_BASE_URL}/api/nutrition/today?date=${selectedDate}`),
          fetch(`${API_BASE_URL}/api/meals?date=${selectedDate}`),
          fetch(`${API_BASE_URL}/api/foods`),
          fetch(`${API_BASE_URL}/api/exercises`),
          fetch(`${API_BASE_URL}/api/workouts?date=${selectedDate}`),
          fetch(`${API_BASE_URL}/api/profile`),
        ])

        if (
          !nutritionResponse.ok ||
          !mealsResponse.ok ||
          !foodsResponse.ok ||
          !exercisesResponse.ok ||
          !workoutsResponse.ok ||
          !profileResponse.ok
        ) {
          throw new Error('Failed to fetch LifeFit data')
        }

        const nutritionData = await nutritionResponse.json()
        const mealsData = await mealsResponse.json()
        const foodsData = await foodsResponse.json()
        const exercisesData = await exercisesResponse.json()
        const workoutsData = await workoutsResponse.json()
        const profileData = await profileResponse.json()

        setNutrition(nutritionData)
        setMeals(mealsData)
        setFoods(foodsData)
        setExercises(exercisesData)
        setWorkouts(workoutsData)
        setProfile(profileData)
        setProfileForm({
          name: profileData.name || '',
          age: profileData.age || '',
          height_cm: profileData.height_cm || '',
          current_weight_kg: profileData.current_weight_kg || '',
          goal_weight_kg: profileData.goal_weight_kg || '',
          calorie_target: profileData.calorie_target || '',
          protein_target_g: profileData.protein_target_g || '',
        })

        setLoading(false)
      } catch (err) {
        console.error(err)
        setError('Unable to load LifeFit data')
        setLoading(false)
      }
    }

    loadData()
  }, [selectedDate])

  const saveProfile = async (event) => {
    event.preventDefault()

    try {
      setSavingProfile(true)
      setError('')

      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: profileForm.name,
          age: profileForm.age ? Number(profileForm.age) : null,
          height_cm: profileForm.height_cm
            ? Number(profileForm.height_cm)
            : null,
          current_weight_kg: profileForm.current_weight_kg
            ? Number(profileForm.current_weight_kg)
            : null,
          goal_weight_kg: profileForm.goal_weight_kg
            ? Number(profileForm.goal_weight_kg)
            : null,
          calorie_target: profileForm.calorie_target
            ? Number(profileForm.calorie_target)
            : null,
          protein_target_g: profileForm.protein_target_g
            ? Number(profileForm.protein_target_g)
            : null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save profile')
      }

      setProfile(data)
      setProfileForm({
        name: data.name || '',
        age: data.age || '',
        height_cm: data.height_cm || '',
        current_weight_kg: data.current_weight_kg || '',
        goal_weight_kg: data.goal_weight_kg || '',
        calorie_target: data.calorie_target || '',
        protein_target_g: data.protein_target_g || '',
      })
    } catch (err) {
      console.error(err)
      setError(err.message)
    } finally {
      setSavingProfile(false)
    }
  }

  const addMeal = async (event) => {
    event.preventDefault()

    if (!foodId || !quantityG) {
      setError('Please select a food and enter quantity')
      return
    }

    try {
      setAddingMeal(true)
      setError('')

      const response = await fetch(`${API_BASE_URL}/api/meals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 1,
          food_id: Number(foodId),
          meal_type: mealType,
          quantity_g: Number(quantityG),
          meal_date: selectedDate,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add meal')
      }

      setMeals((currentMeals) => [data.meal, ...currentMeals])

      const nutritionResponse = await fetch(
        `${API_BASE_URL}/api/nutrition/today?date=${selectedDate}`
      )

      if (!nutritionResponse.ok) {
        throw new Error('Meal added, but failed to refresh nutrition')
      }

      const nutritionData = await nutritionResponse.json()
      setNutrition(nutritionData)

      setFoodId('')
      setQuantityG('')
    } catch (err) {
      console.error(err)
      setError(err.message)
    } finally {
      setAddingMeal(false)
    }
  }

  const deleteMeal = async (mealId) => {
    try {
      setDeletingMeal(mealId)
      setError('')

      const response = await fetch(
        `${API_BASE_URL}/api/meals/${mealId}`,
        {
          method: 'DELETE',
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete meal')
      }

      setMeals((currentMeals) =>
        currentMeals.filter((meal) => meal.id !== mealId)
      )

      const nutritionResponse = await fetch(
        `${API_BASE_URL}/api/nutrition/today?date=${selectedDate}`
      )

      if (!nutritionResponse.ok) {
        throw new Error('Meal deleted, but failed to refresh nutrition')
      }

      const nutritionData = await nutritionResponse.json()
      setNutrition(nutritionData)
    } catch (err) {
      console.error(err)
      setError(err.message)
    } finally {
      setDeletingMeal(null)
    }
  }

  const addWorkout = async () => {
    if (!exerciseId || !sets || !reps || weight === '') {
      setError('Please fill all workout fields')
      return
    }

    try {
      setAddingWorkout(true)
      setError('')

      const response = await fetch(`${API_BASE_URL}/api/workouts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 1,
          exercise_id: Number(exerciseId),
          sets: Number(sets),
          reps: Number(reps),
          weight: Number(weight),
          workout_date: selectedDate,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to add workout')
      }

      const workoutsResponse = await fetch(
        `${API_BASE_URL}/api/workouts?date=${selectedDate}`
      )

      const workoutsData = await workoutsResponse.json()
      setWorkouts(workoutsData)

      setExerciseId('')
      setSets('')
      setReps('')
      setWeight('')
    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to add workout')
    } finally {
      setAddingWorkout(false)
    }
  }

  const deleteWorkout = async (workoutId) => {
    try {
      setDeletingWorkout(workoutId)
      setError('')

      const response = await fetch(
        `${API_BASE_URL}/api/workouts/${workoutId}`,
        {
          method: 'DELETE',
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete workout')
      }

      setWorkouts((currentWorkouts) =>
        currentWorkouts.filter((workout) => workout.id !== workoutId)
      )
    } catch (err) {
      console.error(err)
      setError(err.message)
    } finally {
      setDeletingWorkout(null)
    }
  }
  const updateProfile = async (event) => {
    event.preventDefault()

    if (!profileForm.name.trim()) {
      alert('Name is required')
      return
    }

    if (profileForm.age && Number(profileForm.age) <= 0) {
      alert('Age must be greater than zero')
      return
    }

    if (
      profileForm.height_cm &&
      Number(profileForm.height_cm) <= 0
    ) {
      alert('Height must be greater than zero')
      return
    }

    if (
      profileForm.current_weight_kg &&
      Number(profileForm.current_weight_kg) <= 0
    ) {
      alert('Current weight must be greater than zero')
      return
    }

    if (
      profileForm.goal_weight_kg &&
      Number(profileForm.goal_weight_kg) <= 0
    ) {
      alert('Goal weight must be greater than zero')
      return
    }

    if (
      profileForm.calorie_target &&
      Number(profileForm.calorie_target) <= 0
    ) {
      alert('Calorie target must be greater than zero')
      return
    }

    if (
      profileForm.protein_target_g &&
      Number(profileForm.protein_target_g) <= 0
    ) {
      alert('Protein target must be greater than zero')
      return
    }

    try {
      setSavingProfile(true)

      const response = await fetch(
        `${API_BASE_URL}/api/profile`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: profileForm.name,
            age: profileForm.age
              ? Number(profileForm.age)
              : null,
            height_cm: profileForm.height_cm
              ? Number(profileForm.height_cm)
              : null,
            current_weight_kg: profileForm.current_weight_kg
              ? Number(profileForm.current_weight_kg)
              : null,
            goal_weight_kg: profileForm.goal_weight_kg
              ? Number(profileForm.goal_weight_kg)
              : null,
            calorie_target: profileForm.calorie_target
              ? Number(profileForm.calorie_target)
              : null,
            protein_target_g: profileForm.protein_target_g
              ? Number(profileForm.protein_target_g)
              : null,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || 'Failed to update profile'
        )
      }

      setProfile(data.profile)

      alert('Profile updated successfully')
    } catch (error) {
      console.error(error)
      alert(error.message)
    } finally {
      setSavingProfile(false)
    }
  }
  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>🏋️ LifeFit</h1>
          <p>Your personal fitness dashboard</p>
        </div>

        <input
          className="date-button"
          type="date"
          value={selectedDate}
          onChange={(event) => setSelectedDate(event.target.value)}
        />
      </header>

      <main>
        <section className="welcome">
          <h2>Good morning! 👋</h2>
          <p>Here's your progress for today.</p>
        </section>

        {/* ========== PROFILE SECTION ========== */}
        <section className="section">
          <div className="section-header">
            <h2>My Profile</h2>
          </div>

          {profile ? (
            <div className="profile-card">
              <form onSubmit={updateProfile}>
                <input
                  type="text"
                  placeholder="Name"
                  value={profileForm.name}
                  onChange={(event) =>
                    setProfileForm({
                      ...profileForm,
                      name: event.target.value,
                    })
                  }
                />
                <input
                  type="number"
                  placeholder="Age"
                  value={profileForm.age}
                  onChange={(event) =>
                    setProfileForm({
                      ...profileForm,
                      age: event.target.value,
                    })
                  }
                />
                <input
                  type="number"
                  placeholder="Height (cm)"
                  value={profileForm.height_cm}
                  onChange={(event) =>
                    setProfileForm({
                      ...profileForm,
                      height_cm: event.target.value,
                    })
                  }
                />
                <input
                  type="number"
                  placeholder="Current Weight (kg)"
                  value={profileForm.current_weight_kg}
                  onChange={(event) =>
                    setProfileForm({
                      ...profileForm,
                      current_weight_kg: event.target.value,
                    })
                  }
                />
                <input
                  type="number"
                  placeholder="Goal Weight (kg)"
                  value={profileForm.goal_weight_kg}
                  onChange={(event) =>
                    setProfileForm({
                      ...profileForm,
                      goal_weight_kg: event.target.value,
                    })
                  }
                />
                <input
                  type="number"
                  placeholder="Daily Calorie Target"
                  value={profileForm.calorie_target}
                  onChange={(event) =>
                    setProfileForm({
                      ...profileForm,
                      calorie_target: event.target.value,
                    })
                  }
                />
                <input
                  type="number"
                  placeholder="Daily Protein Target (g)"
                  value={profileForm.protein_target_g}
                  onChange={(event) =>
                    setProfileForm({
                      ...profileForm,
                      protein_target_g: event.target.value,
                    })
                  }
                />
                <button
                  type="submit"
                  disabled={savingProfile}
                >
                  {savingProfile ? 'Saving...' : 'Save Profile'}
                </button>
              </form>

              <div className="profile-summary">
                <p>
                  <strong>Name:</strong> {profile.name || 'Not set'}
                </p>
                <p>
                  <strong>Age:</strong> {profile.age ?? 'Not set'}
                </p>
                <p>
                  <strong>Height:</strong>{' '}
                  {profile.height_cm
                    ? `${profile.height_cm} cm`
                    : 'Not set'}
                </p>
                <p>
                  <strong>Current Weight:</strong>{' '}
                  {profile.current_weight_kg
                    ? `${profile.current_weight_kg} kg`
                    : 'Not set'}
                </p>
                <p>
                  <strong>BMI:</strong>{' '}
                  {bmi ?? 'Not available'}
                </p>
                <p>
                  <strong>Goal Weight:</strong>{' '}
                  {profile.goal_weight_kg
                    ? `${profile.goal_weight_kg} kg`
                    : 'Not set'}
                </p>
                <p>
                  <strong>Daily Calorie Target:</strong>{' '}
                  {profile.calorie_target ?? 'Not set'}
                </p>
                <p>
                  <strong>Daily Protein Target:</strong>{' '}
                  {profile.protein_target_g
                    ? `${profile.protein_target_g} g`
                    : 'Not set'}
                </p>
              </div>
            </div>
          ) : (
            <p>Loading profile...</p>
          )}
        </section>

        {/* ========== STATS ========== */}
        <section className="stats">
          <div className="stat-card">
            <span className="stat-icon">🔥</span>
            <h3>Calories</h3>
            <strong>
              {loading
                ? 'Loading...'
                : nutrition
                  ? Math.round(Number(nutrition.total_calories))
                  : '-'}
            </strong>
            <p>
              / {profile?.calorie_target ? profile.calorie_target : '—'} kcal
            </p>
          </div>

          <div className="stat-card">
            <span className="stat-icon">🥩</span>
            <h3>Protein</h3>
            <strong>
              {loading
                ? 'Loading...'
                : nutrition
                  ? `${Number(nutrition.total_protein).toFixed(1)} g`
                  : '-'}
            </strong>
            <p>
              /{' '}
              {profile?.protein_target_g
                ? `${profile.protein_target_g} g`
                : '—'}
            </p>
          </div>

          <div className="stat-card">
            <span className="stat-icon">⚖️</span>
            <h3>Weight</h3>
            <strong>
              {profile?.current_weight_kg
                ? `${profile.current_weight_kg} kg`
                : '—'}
            </strong>
            <p>
              Goal:{' '}
              {profile?.goal_weight_kg
                ? `${profile.goal_weight_kg} kg`
                : '—'}
            </p>
          </div>
        </section>
        <div className="target-summary">
          {calorieTarget > 0 && (
            <div className="progress-section">
              <div className="progress-header">
                <span>🔥 Calories</span>
                <span>
                  {Math.round(caloriesConsumed)} / {calorieTarget} kcal
                </span>
              </div>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${calorieProgress}%` }}
                />
              </div>

              <p>
                {caloriesOver > 0
                  ? `${Math.round(caloriesOver)} kcal over target`
                  : caloriesRemaining > 0
                    ? `${Math.round(caloriesRemaining)} kcal remaining`
                    : 'Calorie target reached'}
              </p>
            </div>
          )}

          {proteinTarget > 0 && (
            <div className="progress-section">
              <div className="progress-header">
                <span>🥩 Protein</span>
                <span>
                  {proteinConsumed.toFixed(1)} / {proteinTarget} g
                </span>
              </div>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${proteinProgress}%` }}
                />
              </div>

              <p>
                {proteinOver > 0
                  ? `${proteinOver.toFixed(1)} g over target`
                  : proteinRemaining > 0
                    ? `${proteinRemaining.toFixed(1)} g remaining`
                    : 'Protein target reached'}
              </p>
            </div>
          )}
        </div>

        {error && <p className="error">{error}</p>}

        {/* ========== MEALS ========== */}
        <section className="section">
          <div className="section-header">
            <h2>Today's Meals</h2>
          </div>

          <form onSubmit={addMeal}>
            <select
              value={mealType}
              onChange={(event) => setMealType(event.target.value)}
            >
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Snack">Snack</option>
              <option value="Dinner">Dinner</option>
            </select>

            <select
              value={foodId}
              onChange={(event) => setFoodId(event.target.value)}
            >
              <option value="">Select food</option>
              {foods.map((food) => (
                <option key={food.id} value={food.id}>
                  {food.name}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Quantity (grams)"
              min="1"
              value={quantityG}
              onChange={(event) => setQuantityG(event.target.value)}
            />

            <button type="submit" disabled={addingMeal}>
              {addingMeal ? 'Adding...' : 'Add Meal'}
            </button>
          </form>

          <div className="meal-list">
            {loading ? (
              <p>Loading meals...</p>
            ) : meals.length === 0 ? (
              <p>No meals added today.</p>
            ) : (
              meals.map((meal) => (
                <div className="meal" key={meal.id}>
                  <div>
                    <h3>{meal.meal_type}</h3>
                    <p>
                      {meal.food_name} — {meal.quantity_g}g
                    </p>
                  </div>

                  <div className="meal-nutrition">
                    <strong>
                      {Math.round(Number(meal.total_calories))} kcal
                    </strong>
                    <p>
                      Protein: {Number(meal.total_protein).toFixed(1)}g
                      {' | '}
                      Carbs: {Number(meal.total_carbs).toFixed(1)}g
                      {' | '}
                      Fat: {Number(meal.total_fat).toFixed(1)}g
                    </p>

                    <button
                      className="delete-button"
                      onClick={() => deleteMeal(meal.id)}
                      disabled={deletingMeal === meal.id}
                    >
                      {deletingMeal === meal.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* ========== WORKOUTS ========== */}
        <section className="section">
          <div className="section-header">
            <h2>Today's Workout</h2>
            <button
              onClick={() => {
                document
                  .getElementById('workout-form')
                  ?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              + Add Exercise
            </button>
          </div>

          <div id="workout-form" className="meal-form">
            <select
              value={exerciseId}
              onChange={(event) => setExerciseId(event.target.value)}
            >
              <option value="">Select exercise</option>
              {exercises.map((exercise) => (
                <option key={exercise.id} value={exercise.id}>
                  {exercise.name}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Sets"
              value={sets}
              onChange={(event) => setSets(event.target.value)}
              min="1"
            />

            <input
              type="number"
              placeholder="Reps"
              value={reps}
              onChange={(event) => setReps(event.target.value)}
              min="1"
            />

            <input
              type="number"
              placeholder="Weight (kg)"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
              min="0"
              step="0.5"
            />

            <button onClick={addWorkout} disabled={addingWorkout}>
              {addingWorkout ? 'Adding...' : 'Add Workout'}
            </button>
          </div>

          <div className="workout-card">
            {workouts.length === 0 ? (
              <p>No workouts recorded for this date.</p>
            ) : (
              workouts.map((workout) => (
                <div className="exercise" key={workout.id}>
                  <span>{workout.exercise_name}</span>
                  <strong>
                    {workout.sets} × {workout.reps} @ {workout.weight} kg
                  </strong>
                  <button
                    className="delete-button"
                    onClick={() => deleteWorkout(workout.id)}
                    disabled={deletingWorkout === workout.id}
                  >
                    {deletingWorkout === workout.id
                      ? 'Deleting...'
                      : 'Delete'}
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App