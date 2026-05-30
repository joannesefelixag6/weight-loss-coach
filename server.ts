/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Standard port is 3000 and is hardcoded by infrastructure
const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  // Initialize Gemini client lazily
  let aiClient: GoogleGenAI | null = null;
  function getGenAI() {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      aiClient = new GoogleGenAI({
        apiKey: apiKey || 'MOCK_KEY', // Avoid crash at load-time if key is empty
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return aiClient;
  }

  // API 1: Health status check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // API 2: Onboarding - Generate personalized nutrition and fitness plan
  app.post('/api/coach/generate-plan', async (req, res) => {
    const { userProfile } = req.body;

    if (!userProfile) {
      return res.status(400).json({ error: 'User profile is required to generate a plan.' });
    }

    // Step 1: Scientific local fallback calculations (Mifflin-St Jeor) so we always have perfect values
    const weight = Number(userProfile.currentWeight) || 70;
    const height = Number(userProfile.height) || 170;
    const age = Number(userProfile.age) || 30;
    const isMale = userProfile.gender === 'male';

    let bmr = 10 * weight + 6.25 * height - 5 * age;
    if (isMale) {
      bmr += 5;
    } else {
      bmr -= 161;
    }

    // Activity multiplier
    let multiplier = 1.22;
    if (userProfile.activityLevel === 'lightly_active') multiplier = 1.375;
    if (userProfile.activityLevel === 'moderately_active') multiplier = 1.55;
    if (userProfile.activityLevel === 'very_active') multiplier = 1.725;

    const maintenanceCalories = Math.round(bmr * multiplier);
    // Standard fat loss deficit (300-500 kcal)
    let dailyCalories = Math.round(maintenanceCalories - 500);
    if (dailyCalories < 1200) dailyCalories = 1200; // Safe metabolic floor

    // Step 2: Dynamically construct highly-customized local fallback plan based on user diet restrictions, availability, and fitness experience
    const dietRestrictions = userProfile.dietRestrictions || [];
    const foodPreferences = userProfile.foodPreferences || '';
    const fitnessExperience = userProfile.fitnessExperience || 'beginner';
    const workoutAvailability = userProfile.workoutAvailability || '3-4';
    const activityLevel = userProfile.activityLevel || 'moderately_active';

    const isVegan = dietRestrictions.includes('Vegan');
    const isVegetarian = dietRestrictions.includes('Vegetarian') || isVegan;
    const isGlutenFree = dietRestrictions.includes('Gluten-Free');
    const isDairyFree = dietRestrictions.includes('Dairy-Free') || dietRestrictions.includes('Lactose-Free') || isVegan;
    const isKeto = dietRestrictions.includes('Keto');
    const isLowCarb = dietRestrictions.includes('Low-Carb') || isKeto;
    const isNutFree = dietRestrictions.includes('Nut-Free');

    // Dynamic Macro Splits (Percentages)
    let pPct = 30;
    let cPct = 40;
    let fPct = 30;

    if (isKeto) {
      pPct = 25;
      cPct = 5;
      fPct = 70;
    } else if (isLowCarb) {
      pPct = 35;
      cPct = 20;
      fPct = 45;
    } else if (fitnessExperience === 'advanced') {
      pPct = 35;
      cPct = 35;
      fPct = 30;
    } else if (fitnessExperience === 'intermediate') {
      pPct = 32;
      cPct = 38;
      fPct = 30;
    }

    const macroSplit = { protein: pPct, carbs: cPct, fats: fPct };

    // Function to calculate exact grams based on caloric volume and macro split percentage
    const calcG = (cf: number, pct: number, divisor: number) => Math.round((cf * (pct / 100)) / divisor);

    // Build dynamic meals
    const meals = [];
    
    // MEAL 1: Breakfast (30% of calories)
    const breakfastCal = Math.round(dailyCalories * 0.3);
    const bfP = calcG(breakfastCal, pPct, 4);
    const bfC = calcG(breakfastCal, cPct, 4);
    const bfF = calcG(breakfastCal, fPct, 9);
    
    let bfName = isMale ? 'Power Protein Scramble' : 'Berry Protein Oat Bowl';
    let bfRecipe = 'Scramble 3 large pasture eggs with 100g of baby spinach, 50g of sliced mushrooms, and 20g of low-fat Feta cheese. Serve alongside a slice of organic toasted sourdough bread with 1/4 sliced avocado. Sprinkle with hemp seeds for cellular lipid supply.';

    if (isVegan) {
      if (isKeto) {
        bfName = 'Avocado & Flaxseed Tofu Scramble';
        bfRecipe = 'Scramble 180g of premium organic firm tofu in olive oil with turmeric, black pepper, baby spinach, and 120g of sliced mushrooms. Top with 1 whole sliced fresh Hass avocado and drizzle with 1 tbsp of cold-pressed flaxseed oil.';
      } else {
        bfName = 'High-Protein Chia & Berry Oat Bowl';
        bfRecipe = `Simmer 50g of certified gluten-free steel-cut oats with 1.5 scoops of plant protein isolate, 200ml of organic unsweetened almond milk, and 1 tbsp of raw chia seeds. Top with 80g of fresh wild blueberries and ${isNutFree ? 'raw pumpkin seeds' : '15g of sliced almonds'}.`;
      }
    } else if (isVegetarian) {
      if (isKeto) {
        bfName = 'Triple-Egg & Cheddar Butter Scramble';
        bfRecipe = 'Scramble 3 fresh pasture eggs in 1.5 tbsp of organic pasture butter. Mix in 100g organic baby spinach leaves and fold in 30g of vintage cheddar. Serve with a split plate of sliced cucumbers and olives.';
      } else {
        bfName = 'Supercharged Greek Yogurt Parfait';
        bfRecipe = `Layer 200g of plain high-protein Greek fat-free yogurt under 60g of raspberries, a splash of organic liquid honey, 1 tbsp organic chia seeds, and ${isNutFree ? '15g organic sunflower seeds' : '15g walnuts'} for long-term satiety baseline.`;
      }
    } else if (isKeto) {
      bfName = 'Smoky Bacon, Eggs & Mushroom Skillet';
      bfRecipe = 'Crisp 3 thick slices of organic smoked bacon. In the residual fat, scramble 3 organic jumbo pasture eggs with baby spinach and mushrooms. Serve with 30g of Danish Feta chunks and fresh chive sprinkles.';
    } else if (isGlutenFree) {
      bfName = 'Power Salmon & Spinach Fritters';
      bfRecipe = 'Whisk 3 organic eggs and folded-in seared wild smoked salmon flakes (60g). Fry with 100g spinach in organic coconut oil. Serve with hot sweet potato cubes mashed with herbed sea salt.';
    } else if (isDairyFree) {
      bfName = 'Free-Range Eggs Scramble with Avocado & Toast';
      bfRecipe = 'Scramble 3 premium pasture eggs with baby spinach in olive oil. Serve with a single slice of toasted organic sourdough bread layered with 1/2 mashed avocado and sea salt.';
    }

    meals.push({
      id: 'meal-d1',
      name: bfName,
      calories: breakfastCal,
      protein: bfP,
      carbs: bfC,
      fats: bfF,
      recipeText: bfRecipe,
      mealType: 'Breakfast' as const
    });

    // MEAL 2: Lunch (35% of calories)
    const lunchCal = Math.round(dailyCalories * 0.35);
    const luP = calcG(lunchCal, pPct, 4);
    const luC = calcG(lunchCal, cPct, 4);
    const luF = calcG(lunchCal, fPct, 9);
    
    let luName = 'Zesty Citrus Grilled Chicken Salad';
    let luRecipe = 'Marinate 150g of raw chicken breast in fresh lemon juice, garlic cloves, and culinary oregano. Grill for 6 minutes per side. Toss with 150g mixed organic greens, thin cucumber rings, black olives, and 1 tbsp olive oil.';

    if (isVegan) {
      if (isKeto) {
        luName = 'Sesame Sautéed Tempeh & Avocado Ribbon Salad';
        luRecipe = `Sauté 150g of organic cubed tempeh in 1.5 tbsp of toasted sesame oil with low-sodium tamari. Toss in mixed baby greens, cucumbers, zucchini ribbons, and one whole sliced avocado, dressed with raw sesame seeds${isNutFree ? '' : ' and cashews'}.`;
      } else {
        luName = 'Mediterranean Herb Chickpea & Quinoa Platter';
        luRecipe = 'Combine 150g of organic rinsed chickpeas, 100g of cooked organic quinoa, 150g mixed salad herbs, cucumbers, dilled cherry tomatoes, and kalamata olives. Drizzle with a dynamic organic lemon tahini garlic dressing.';
      }
    } else if (isVegetarian) {
      if (isKeto) {
        luName = 'Grilled Halloumi & Avocado Green Bowl';
        luRecipe = 'Pan-sear 120g of Cypriot Halloumi cheese. Place over a substantial base of baby kale, spinach, cucumbers, and 1 whole sliced avocado. Drizzle with cold-pressed extra virgin olive oil and oregano dust.';
      } else {
        luName = 'Spiced Tempeh & Sweet Potato Quinoa Bowl';
        luRecipe = 'Sauté 130g of organic light-smoked tempeh. Pair with 100g baked organic sweet potato wedges, 80g cooked quinoa, steamed spinach greens, and dress with fresh lime juice, sea salt, and a splash of olive oil.';
      }
    } else if (isKeto) {
      luName = 'Wagyu Beef Salad with Feta & Avocado';
      luRecipe = 'Sear 150g of premium Wagyu ground beef (85/15) in avocado oil with taco spices. Assemble on mixed greens with cubed cucumber, 1 Hass sliced avocado, and 40g crumbled Danish Feta cheese. Drizzle with olive oil.';
    } else if (isGlutenFree) {
      luName = 'Zesty Citrus Grilled Chicken & Quinoa Salad';
      luRecipe = 'Marinate 155g of raw chicken breast with fresh lemon juice, garlic, and wild thyme. Grill and slice. Toss with 80g of cooked organic quinoa, mixed garden greens, sliced radishes, cucumbers, and dress with 1 tbsp olive oil.';
    }

    meals.push({
      id: 'meal-d2',
      name: luName,
      calories: lunchCal,
      protein: luP,
      carbs: luC,
      fats: luF,
      recipeText: luRecipe,
      mealType: 'Lunch' as const
    });

    // MEAL 3: Dinner (25% of calories)
    const dinnerCal = Math.round(dailyCalories * 0.25);
    const diP = calcG(dinnerCal, pPct, 4);
    const diC = calcG(dinnerCal, cPct, 4);
    const diF = calcG(dinnerCal, fPct, 9);
    
    let diName = 'Sesame Ginger Wild Salmon & Broccoli';
    let diRecipe = 'Bake 130g of wild-caught Alaskan salmon fillet seasoned with warm ginger powder and toasted sesame oil. Roast 200g of broccoli florets and serve with 80g of premium brown jasmine rice, garnished with chives.';

    if (isVegan) {
      if (isKeto) {
        diName = 'Baked Herb-Stuffed Tofu Steaks with Asparagus';
        diRecipe = 'Cut 200g of extra-firm organic tofu into thick planks. Bake with rosemary, crushed garlic, and olive oil. Serve with a side of 150g blistered asparagus spears and 50g of sliced avocado seasoned with chilli flakes.';
      } else {
        diName = 'Aromatic Smoked Tempeh, Sweet Potato & Asparagus';
        diRecipe = 'Bake 150g of sliced organic tempeh strips alongside 120g of sweet potato wedges and 150g asparagus rods in coconut oil, rosemary, and smoked sweet paprika. Garnish with a squeeze of fresh lemon juice.';
      }
    } else if (isVegetarian) {
      if (isKeto) {
        diName = 'Double-Portobello Baked Feta & Spinach Melt';
        diRecipe = 'De-stem 2 large portobello caps. Stuff with a warm mixture of sautéed baby spinach (150g), 80g of crumbled Greek sheep Feta, garlic cloves, and bake at 200C. Side with sliced cucumbers.';
      } else {
        diName = 'Crispy Organic Tofu, Rice & Broccoli Stir-Fry';
        diRecipe = 'Cube and press 160g of organic extra-firm tofu. Stir-fry with 200g organic broccoli, mushrooms, peppers, in toasted sesame oil and tamari. Serve with 80g of roasted brown jasmin rice base.';
      }
    } else if (isKeto) {
      diName = 'Pan-Seared Grass-Fed Ribeye with Garlic Asparagus';
      diRecipe = 'Pan-sear 180g of grass-fed ribeye steak in olive oil to medium-rare. Baste with herbed garlic-butter. Serve alongside 150g oven-blistered asparagus rods and sautéed buttered mushrooms.';
    } else if (isGlutenFree) {
      diName = 'Sesame Ginger Wild-Caught Cod & Brown Rice';
      diRecipe = 'Bake 150g wild-caught cod seasoned with warm ginger and sesame oil. Roast 200g organic broccoli florets and steam 80g of premium organic brown rice with fresh parsley and crushed sea salts.';
    }

    meals.push({
      id: 'meal-d3',
      name: diName,
      calories: dinnerCal,
      protein: diP,
      carbs: diC,
      fats: diF,
      recipeText: diRecipe,
      mealType: 'Dinner' as const
    });

    // MEAL 4: Snack (10% of calories)
    const snackCal = Math.round(dailyCalories * 0.1);
    const snP = calcG(snackCal, pPct, 4) || 12;
    const snC = calcG(snackCal, cPct, 4) || 10;
    const snF = calcG(snackCal, fPct, 9) || 4;
    
    let snName = 'Protein Yogurt Parfait';
    let snRecipe = 'Layer 150g of plain Icelandic Skyr or ultra-strained Greek yogurt with 50g of high-antioxidant blue berries and 15g of raw organic pumpkin seeds for crunch and mineral diversity.';

    if (isVegan) {
      if (isKeto) {
        snName = `Crunchy Sea Salt Pecans & Walnuts Boost`;
        snRecipe = `Satisfy immediate satiety signals with 35g of raw pecans and organic walnut halves seasoned with healthy pink Himalayan sea salts. No sugars added.`;
      } else {
        snName = `Clean Organic Almond Butter & Apple Circles`;
        snRecipe = 'Slice 1 crisp organic Gala apple. Dip into 1.5 tablespoons of organic single-ingredient stone-ground almond butter for stable nutrient distribution.';
      }
    } else if (isKeto) {
      snName = 'Prosciutto-Wrapped Mozzarella Pearls';
      snRecipe = 'Wrap 40g of fresh baby mozzarella cheese balls with 3 thin slices of premium dry-cured Italian prosciutto di Parma. High protein and lipid fuel.';
    } else if (isDairyFree || isVegan) {
      snName = 'Organic Blue-Berry Chia Pudding';
      snRecipe = 'Soak 20g organic chia seeds in 120ml unsweetened coconut milk overnight. Stir in stevia drops and top with 40g fresh antioxidant-rich wild blueberries.';
    }

    meals.push({
      id: 'meal-d4',
      name: snName,
      calories: snackCal,
      protein: snP,
      carbs: snC,
      fats: snF,
      recipeText: snRecipe,
      mealType: 'Snack' as const
    });

    // Build dynamic workouts based on availability and fitness experience
    const workouts = [];
    const trainingDays = workoutAvailability === '1-2' ? [1] : workoutAvailability === '3-4' ? [1, 2] : [1, 2, 3];

    // Build exercise sets based on experience level
    const getExercises = (type: 'upper' | 'lower' | 'core') => {
      if (fitnessExperience === 'beginner') {
        if (type === 'upper') {
          return [
            'Incline Bench Push-ups to protect shoulder socket (3 sets x 10 reps)',
            'Dumbbell Neutral-Grip Bent Rows (3 sets x 12 reps, light)',
            'Light Seated Dumbbell Shoulder Press (3 sets x 10 reps)',
            'Assisted Band Lat Pulldowns (3 sets x 12 reps)',
            'Forearm Plank hold core alignment (3 sets x 30 secs hold)'
          ];
        } else if (type === 'lower') {
          return [
            'Bodyweight Air Squats focusing on depth tempo (3 sets x 15 reps)',
            'Assisted Dumbbell Romanian Deadlifts (3 sets x 12 reps)',
            'Bilateral Glute Bridges on mat (3 sets x 15 reps with squeeze)',
            'Alternating Reverse Lunges (3 sets x 10 reps per leg, no weights)',
            'Standing Calf Raises flat floor (3 sets x 15 reps)'
          ];
        } else {
          return [
            'Superman Lumbar Stretch (3 sets x 12 reps)',
            'Alternating Bird-Dog Core Alignment (3 sets x 10 reps each side)',
            'Bicycle Crunches (3 sets x 12 total reps)',
            'Standing High Knees in place (3 sets x 30 secs of light cardio)'
          ];
        }
      } else if (fitnessExperience === 'intermediate') {
        if (type === 'upper') {
          return [
            'Dumbbell Flat Chest Press on bench (3 sets x 12 reps)',
            'Dumbbell Bent-Over Row with neutral grasp (3 sets x 10 reps)',
            'Standing Dumbbell Arnold Shoulder Press (3 sets x 10 reps)',
            'Lat Pulldowns or Chin-Up alternatives (3 sets x 8 reps)',
            'Forearm Plank hold with leg lifts (3 sets x 45 secs hold)'
          ];
        } else if (type === 'lower') {
          return [
            'Dumbbell Goblet Squats with 2sec pause (4 sets x 10 reps)',
            'Dumbbell Romanian Deadlifts for hamstrings (3 sets x 12 reps)',
            'Weighted Walking Lunges (3 sets x 12 steps total reps)',
            'Elevated Calf Raises on edge (3 sets x 15 reps)',
            'Kettlebell Swings for energetic cardiovascular burn (3 sets x 15 reps)'
          ];
        } else {
          return [
            'Mountain Climbers tempo (4 sets x 30 secs)',
            'Russian Twists holding light dumbbell (3 sets x 15 per side)',
            'High Knee running in place (4 sets x 40 secs of raw intensity)',
            'Prone Plank Core Compression (3 sets x 60 secs hold)'
          ];
        }
      } else { // advanced
        if (type === 'upper') {
          return [
            'Barbell Flat Bench Chest Press (4 sets x 6 reps, heavy)',
            'Barbell Bent-Over Row with medium grasp (4 sets x 8 reps)',
            'Military Overhead Barbell Press (3 sets x 8 reps)',
            'Weighted Pull-Ups or Lat Pulldowns (4 sets x 6 reps to failure)',
            'Hanging Leg Raises on bar (3 sets x 12 reps to failure)'
          ];
        } else if (type === 'lower') {
          return [
            'Barbell Back Squats with progressive loads (4 sets x 6 reps)',
            'Barbell Romanian Deadlifts targeting posterior chain (4 sets x 8 reps)',
            'Weighted Bulgarian Split Squats (3 sets x 8 reps each leg)',
            'Weighted Heel raises on platform (3 sets x 15 reps)',
            'Medicine Ball Slams to failure (3 sets x 15 reps)'
          ];
        } else {
          return [
            'Full Hanging Toes-To-Bar (4 sets x 10 reps)',
            'Weighted Core Russian Twists (3 sets x 20 reps)',
            'Burpees with active pushup (4 sets x 12 reps to max)',
            'Dual Dumbbell Renegade Rows in plank (3 sets x 12 reps)'
          ];
        }
      }
    };

    if (trainingDays.includes(1)) {
      workouts.push({
        id: 'work-d1',
        day: 'Day 1: Upper Body Energy & Recomposition',
        workoutName: fitnessExperience === 'advanced' ? 'Advanced Upper Compound Force' : 'Upper Recomposition Focus',
        duration: fitnessExperience === 'advanced' ? 55 : fitnessExperience === 'intermediate' ? 45 : 35,
        exercises: getExercises('upper')
      });
    }

    if (trainingDays.includes(2)) {
      workouts.push({
        id: 'work-d2',
        day: 'Day 2: Lower Body Kinetic & Hamstring Focus',
        workoutName: fitnessExperience === 'advanced' ? 'Advanced Lower Structural overload' : 'Quad & Glute Kinetic Core',
        duration: fitnessExperience === 'advanced' ? 60 : fitnessExperience === 'intermediate' ? 50 : 35,
        exercises: getExercises('lower')
      });
    }

    if (trainingDays.includes(3)) {
      workouts.push({
        id: 'work-d3',
        day: 'Day 3: Core Compression, Alignment, & HIIT Workout',
        workoutName: fitnessExperience === 'advanced' ? 'Advanced Athletic Fat-Oxidation Conditioning' : 'Cardiovascular Fat-oxidation',
        duration: fitnessExperience === 'advanced' ? 45 : fitnessExperience === 'intermediate' ? 35 : 30,
        exercises: getExercises('core')
      });
    }

    // Build unique Grocery list dynamically
    const grocerySet = new Set<string>();
    meals.forEach(m => {
      if (m.name.includes('Eggs') || m.name.includes('Scramble') || m.name.includes('Omelet')) {
        grocerySet.add('Free-range organic pasture eggs');
      }
      if (m.name.includes('Chicken')) {
        grocerySet.add('Lean chicken breast (organic, boneless)');
      }
      if (m.name.includes('Salmon')) {
        grocerySet.add('Wild-caught Alaskan salmon fillet');
      }
      if (m.name.includes('Cod')) {
        grocerySet.add('Wild-caught fresh cod fillet');
      }
      if (m.name.includes('Beef') || m.name.includes('Wagyu')) {
        grocerySet.add('Grass-fed organic ground beef');
      }
      if (m.name.includes('Tofu')) {
        grocerySet.add('Organic extra-firm tofu');
      }
      if (m.name.includes('Tempeh')) {
        grocerySet.add('Organic smoked plant-based tempeh');
      }
      if (m.name.includes('Yogurt') || m.name.includes('Parfait')) {
        grocerySet.add('Plain fat-free Greek yogurt or Icelandic Skyr');
      }
      if (isKeto) {
        grocerySet.add('Extra virgin fresh cold-pressed olive oil & butter');
        grocerySet.add('Fresh whole avocados');
        grocerySet.add('Danish goat Feta chunks & Cheddar cheese');
      } else {
        grocerySet.add('Raw coconut or sesame seed oil');
        grocerySet.add('High-fiber raspberries or organic blueberries');
      }
      if (m.recipeText.includes('spinach') || m.recipeText.includes('greens') || m.recipeText.includes('cucumbers')) {
        grocerySet.add('Organic baby spinach & fresh complex salad greens');
      }
      if (m.recipeText.includes('broccoli')) {
        grocerySet.add('Organic green broccoli florets');
      }
      if (m.recipeText.includes('asparagus')) {
        grocerySet.add('Fresh garden green asparagus spears');
      }
      if (m.recipeText.includes('quinoa')) {
        grocerySet.add('Organic premium white quinoa seeds');
      }
      if (isGlutenFree) {
        grocerySet.add('Gluten-free seed bread loaf or sweet potatoes');
      } else if (m.recipeText.includes('sourdough')) {
        grocerySet.add('Organic sourdough bread loaf');
      }
      if (m.recipeText.includes('walnuts') || m.recipeText.includes('pecans') || m.recipeText.includes('almonds')) {
        if (!isNutFree) {
          grocerySet.add('Raw organic walnuts, pecans or almonds');
        } else {
          grocerySet.add('Raw sunflower & pumpkin seeds');
        }
      }
      if (m.recipeText.includes('pumpkin seeds') || m.recipeText.includes('chia seeds')) {
        grocerySet.add('Raw organic pumpkin & chia seeds');
      }
    });

    const groceryList = Array.from(grocerySet);

    // Dynamic Habits
    const habits = [
      { id: 'hab-1', name: 'Consume high-protein source with every main meal', frequency: 'Daily' },
      { id: 'hab-2', name: `Complete ${activityLevel === 'sedentary' ? '6,500' : '8,500'} active NEAT steps`, frequency: 'Daily' },
      { id: 'hab-3', name: 'Standardize morning weight tracking log', frequency: 'Daily' }
    ];

    if (isGlutenFree) {
      habits.push({ id: 'hab-4', name: 'Verify labels for certified gluten-free seals', frequency: 'Daily' });
    } else {
      habits.push({ id: 'hab-4', name: 'Drink liquid water 15 minutes before meals', frequency: 'Daily' });
    }

    // Dynamic coaching message
    const diffKg = Number(userProfile.currentWeight) - Number(userProfile.goalWeight);
    const weeksToGoal = diffKg > 0 ? Math.round(diffKg / 0.5) : 0;
    
    let coachingGuideline = `Welcome to LeanAI Coach, ${userProfile.name || 'Champion'}! Your dynamic client metabolic plan has calculated a safe fat loss intake of **${dailyCalories} kcal** daily. `;
    if (weeksToGoal > 0) {
      coachingGuideline += `At a healthy rate of 0.5 kg pure fat loss weekly, your timeline to reach your exact goal weight destination of **${userProfile.goalWeight} kg** is approximately **${weeksToGoal} weeks**. `;
    } else {
      coachingGuideline += `Your current weight matches your targeted destination. We calculated a clean recomp intake to preserve absolute muscle density! `;
    }
    coachingGuideline += `Due to your ${dietRestrictions.join(', ') || 'General diet'} lifestyle and ${fitnessExperience} experience level, we personalized your macronutrient ratio to **${pPct}% Protein, ${cPct}% Carbs, and ${fPct}% Fat**. Protein triggers GLP-1 peptide satiety and protects resting metabolism lines, while healthy active fats balance endocrine wellness. Follow the detailed step-by-step recipes below, log your activity metrics inside the dashboard tab, and communicate with your AI Coach daily to troubleshoot metabolic adaptation plateaus! Let’s crush this together.`;

    const localFallbackPlan = {
      dailyCalories,
      macroSplit,
      meals,
      workouts,
      groceryList,
      habits,
      coachingGuideline,
      waterGoalML: Math.round(weight * 35)
    };

    // Check if real Gemini key is available. If not, return the scientific calculations
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      console.log('No realistic GEMINI_API_KEY set. Serving premium calculated scientific fallback plan.');
      return res.json(localFallbackPlan);
    }

    try {
      const ai = getGenAI();

      // Request structured output from Gemini model
      const model = 'gemini-3.5-flash';
      const prompt = `Generate a customized weight loss, nutrition, and exercise plan based on this user profile:
Age: ${userProfile.age}
Gender: ${userProfile.gender}
Height: ${userProfile.height} cm
Current Weight: ${userProfile.currentWeight} kg
Goal Weight: ${userProfile.goalWeight} kg
Activity Level: ${userProfile.activityLevel}
Fitness Experience Level: ${userProfile.fitnessExperience}
Workout Availability: ${userProfile.workoutAvailability} days/week
Food Preferences: ${userProfile.foodPreferences || 'None'}
Dietary Restrictions: ${userProfile.dietRestrictions?.join(', ') || 'None'}
Target Date: ${userProfile.targetDate}

Return the response in the specified JSON schema structure. MUST BE WRITTEN EXCLUSIVELY IN STANDARD ENGLISH (all recipes, names, coachingGuidelines, workout exercise instructions, habit tasks, and grocery list items). Make the calculations accurate (BMR: Mifflin-St Jeor), recipes highly detailed and appetizing, and the coaching guidelines scientific and incredibly encouraging.`;

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction: `You are LeanAI, the head metabology and kinesiology expert at LeanAI Coach. Calculate and structure a 100% personalized weight loss, nutrition, and workout program. ALL text and content inside the returned schema MUST be written exclusively in standard English. Use Mifflin-St Jeor for calculating a safe carbohydrate/fat/protein caloric structure.`,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              dailyCalories: { type: Type.INTEGER, description: 'Scientific daily calorie target' },
              macroSplit: {
                type: Type.OBJECT,
                properties: {
                  protein: { type: Type.INTEGER, description: 'Percentage target of protein' },
                  carbs: { type: Type.INTEGER, description: 'Percentage target of carbohydrates' },
                  fats: { type: Type.INTEGER, description: 'Percentage target of fats' },
                },
                required: ['protein', 'carbs', 'fats'],
              },
              meals: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    name: { type: Type.STRING },
                    calories: { type: Type.INTEGER },
                    protein: { type: Type.INTEGER, description: 'grams' },
                    carbs: { type: Type.INTEGER, description: 'grams' },
                    fats: { type: Type.INTEGER, description: 'grams' },
                    recipeText: { type: Type.STRING, description: 'Detailed ingredients list and step by step guide' },
                    mealType: { type: Type.STRING, description: 'Breakfast, Lunch, Dinner, or Snack' },
                  },
                  required: ['id', 'name', 'calories', 'protein', 'carbs', 'fats', 'recipeText', 'mealType'],
                },
              },
              workouts: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    day: { type: Type.STRING, description: 'e.g. Day 1: Upper Body Focus' },
                    workoutName: { type: Type.STRING },
                    duration: { type: Type.INTEGER, description: 'minutes' },
                    exercises: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: 'Exercises, sets, and reps information',
                    },
                  },
                  required: ['id', 'day', 'workoutName', 'duration', 'exercises'],
                },
              },
              groceryList: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              habits: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    name: { type: Type.STRING, description: 'Specific daily/weekly habit' },
                    frequency: { type: Type.STRING, description: 'e.g. Daily or Weekly' },
                  },
                  required: ['id', 'name', 'frequency'],
                },
              },
              coachingGuideline: { type: Type.STRING, description: 'Deep motivating breakdown of the biological logic' },
              waterGoalML: { type: Type.INTEGER, description: 'Daily target in mL' },
            },
            required: ['dailyCalories', 'macroSplit', 'meals', 'workouts', 'groceryList', 'habits', 'coachingGuideline', 'waterGoalML'],
          },
        },
      });

      const responseText = response.text || '';
      const parsedPlan = JSON.parse(responseText.trim());
      return res.json(parsedPlan);
    } catch (err: any) {
      console.error('Gemini call errored. Falling back to scientific calculation:', err.message);
      return res.json(localFallbackPlan);
    }
  });

  // API 3: Premium AI Coaching Chat bot
  app.post('/api/coach/chat', async (req, res) => {
    const { messages, userProfile } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Conversational messages array is required.' });
    }

    // Build context-aware smart fallback responses
    const userName = userProfile?.name || 'Champion';
    const userWeight = userProfile?.currentWeight || 80;
    const userGoal = userProfile?.goalWeight || 70;
    const dietStr = userProfile?.dietRestrictions?.join(', ') || 'personal healthy';
    const fitnessLvl = userProfile?.fitnessExperience || 'beginner';
    const exercisesPerWeek = userProfile?.workoutAvailability || '3-4';
    const waterGoal = userWeight ? Math.round(userWeight * 35) : 2800;

    // Get the last user message text to check keywords
    const lastUserMsgObj = [...messages].reverse().find(m => m.sender === 'user');
    const userTextRaw = lastUserMsgObj ? lastUserMsgObj.text.toLowerCase() : '';

    let fallbackResponseText = `Hi **${userName}**! Sustainable lifestyle changes are all about daily momentum. As your personal LeanAI Coach, I suggest keeping our eye on the target to safely progress from ${userWeight}kg to our goal of ${userGoal}kg. Feel free to ask me any specific questions about workouts, recipe adjustments, water targets, or fat-burning science!`;
    let fallbackSuggestions = [
      'How many calories should I eat?',
      'Create a 12-week fat loss plan.',
      'How much protein do I need?',
      'Why am I not losing weight?',
    ];

    if (userTextRaw.includes('weight') || userTextRaw.includes('stuck') || userTextRaw.includes('scale') || userTextRaw.includes('fat') || userTextRaw.includes('lose') || userTextRaw.includes('plateau')) {
      fallbackResponseText = `### Fat Loss Non-Linearity Check 📊\n\nHello **${userName}**, scale weight is just one data proxy. Our bodies regularly retain fluid weight due to cellular tissue repairs (usually after standard weight lifts), elevated salt intakes, or stress hormones.\n\n*   **Weekly Decisive Focus**: Ignore daily ticks; look at your 7-day rolling weight average.\n*   **Check NEAT Steps**: Keep your active daily motion high (striving for 8,500 steps base).\n*   **Macro Consistency**: Verify that you are keeping your targeted caloric deficits constant. Consistency is the ultimate metabolic stabilizer!`;
      fallbackSuggestions = [
        'How to overcome a plateau?',
        'Tell me about water weight.',
        'Why does weight spike after workouts?',
        'How to track weekly averages?'
      ];
    } else if (userTextRaw.includes('protein') || userTextRaw.includes('food') || userTextRaw.includes('eat') || userTextRaw.includes('carb') || userTextRaw.includes('diet') || userTextRaw.includes('hunger') || userTextRaw.includes('snack') || userTextRaw.includes('meal') || userTextRaw.includes('recipe')) {
      fallbackResponseText = `### Nutritional Satiety Leverage 🥗\n\nHello **${userName}**! Let's refine your **${dietStr}** strategy. Protein provides the highest thermal effect of feeding (TEF) and signals amino-acid satiety to your gut receptors.\n\n1.  **30g Morning Anchor**: Try to eat some clean protein within 60 minutes of rising.\n2.  **Fiber-Enriched Volume**: Add green cruciferous greens (like organic broccoli or spinach) to add physical stomach stretch signals without caloric overflow.\n3.  **Audit Cravings**: Cravings are often simple hydration triggers. Keep water targets at **${waterGoal} mL** steady!`;
      fallbackSuggestions = [
        'High protein vegan snack options',
        'How to log my meals today?',
        'Why does protein suppress hunger?',
        'What is a safe carb limit?'
      ];
    } else if (userTextRaw.includes('workout') || userTextRaw.includes('gym') || userTextRaw.includes('train') || userTextRaw.includes('exercise') || userTextRaw.includes('strength') || userTextRaw.includes('lift') || userTextRaw.includes('run') || userTextRaw.includes('cardio')) {
      fallbackResponseText = `### Kinesiologic Stimulation Guide 🏋️‍♀️\n\nExcellent stamina, **${userName}**! For your **${fitnessLvl}** capability level, training a structural **${exercisesPerWeek} days/week** is ideal to drive clean lean tissue preservation.\n\n*   **Progressive Mechanical Stress**: Always write down your raw weights/reps. Try to slightly increase load or reps over time.\n*   **Recovery Phase**: Muscle growth does not take place in the gym—it takes place during systemic deep sleep cycles. Sleep 7.5+ hours to fully recharge endocrine health.\n*   **Post-Workout Fueling**: Ensure you have a high-protein dish (approx. 25-35g) following exercise.`;
      fallbackSuggestions = [
        'Custom workout plan breakdown',
        'Should I do cardio or lift weights?',
        'What is progressive overload?',
        'Show lower body exercises'
      ];
    } else if (userTextRaw.includes('water') || userTextRaw.includes('drink') || userTextRaw.includes('hydrate')) {
      fallbackResponseText = `### Dynamic Cellular Hydration 💧\n\nWater is the chemical medium for mitochondrial lipolysis (fat-burning). For your body structure, your target volume is **${waterGoal} mL** daily.\n\n*   **Hydration Staging**: Drink a glass immediately upon waking up to trigger metabolic wakefulness.\n*   **Electrolyte Balance**: Add tiny pinches of unrefined pink sea salt to your morning fluids if you experience high perspiration rates during workouts.`;
      fallbackSuggestions = [
        'How does water improve metabolism?',
        'Is sparkling water fine?',
        'Tips to hit 2.5 liters daily',
        'Why am I retaining water?'
      ];
    } else if (userTextRaw.includes('hello') || userTextRaw.includes('hi ') || userTextRaw.includes('hey')) {
      fallbackResponseText = `### Welcome to LeanAI Coach! 👋\n\nHello **${userName}**! It's great to connect. As your support coach, I have analyzed your **${fitnessLvl}** setup.\n\n*   Would you like tips on adjusting your **${dietStr}** meal parameters?\n*   Want me to break down your customized exercises recommendations?\n*   Or are you seeking strategies to stay motivated to hit your targeted destination of **${userGoal} kg**? Let's keep driving progress!`;
      fallbackSuggestions = [
        'How many calories should I eat?',
        'Show my customized exercise recommendation',
        'Adjust food preferences',
        'How to stay motivated?'
      ];
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      console.log('No realistic GEMINI_API_KEY. Returning premium expert simulated response.');
      return res.json({ text: fallbackResponseText, suggestions: fallbackSuggestions });
    }

    try {
      const ai = getGenAI();

      // Construct a clean, unified meta context prompt to preserve memory and context safety.
      const systemInstruction = `You are LeanAI Coach, a supportive, scientific, and highly motivational expert personal health coach.
Your mission is to help people lose weight sustainably, increase metabolic agility, and form outstanding habits.
CRITICAL MANDATE: YOU MUST EXCLUSIVELY COMMUNICATE AND RESPOND IN STANDARD ENGLISH text format. Never respond in other languages, dialects, or localized formats under any circumstances, even if the client tries to use another language.
Format your responses beautifully in markdown headers, bullet points, and bold text. Keep it concise, practical, and action-oriented. Keep the tone friendly, informative, and professional.

${userProfile ? `Active Client Profile information you MUST personalize responses to:
- Name: ${userProfile.name || 'User'}
- Age: ${userProfile.age} years old
- Current Weight: ${userProfile.currentWeight} kg
- Goal Weight: ${userProfile.goalWeight} kg
- Diet: ${userProfile.dietRestrictions?.join(', ') || 'No restrictions'}, preference: ${userProfile.foodPreferences || 'General list'}
- Fitness level: ${userProfile.fitnessExperience} experience, training ${userProfile.workoutAvailability} days/week.` : ''}`;

      // Package current message thread.
      // Build prompt from history
      let promptBuilder = 'Below is the current dialogue log between you (LeanAI Coach) and the client:\n\n';
      // Limit to last 12 messages to keep in bounding blocks
      const slicedMessages = messages.slice(-12);
      for (const msg of slicedMessages) {
        promptBuilder += `${msg.sender === 'user' ? 'Client' : 'LeanAI Coach'}: ${msg.text}\n\n`;
      }
      promptBuilder += 'LeanAI Coach: (Write the next response below with expert insight immediately in English, addressing the user directly)';

      const genResult = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: promptBuilder,
        config: {
          systemInstruction,
          temperature: 0.7,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              text: {
                type: Type.STRING,
                description: 'The supportive, actionable coaching markdown response to the client. MUST BE ENTIRELY IN ENGLISH text. Use bullet points and headers.'
              },
              suggestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'An array of 3-4 short, punchy follow-up user buttons/suggestions related to this point. ALL SUGGESTIONS MUST BE ENTIRELY IN ENGLISH.'
              }
            },
            required: ['text', 'suggestions']
          }
        },
      });

      const responseText = genResult.text || '';
      const parsed = JSON.parse(responseText.trim());
      return res.json({
        text: parsed.text || fallbackResponseText,
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : fallbackSuggestions
      });
    } catch (err: any) {
      console.error('Error in coach chat API:', err.message);
      return res.json({ text: fallbackResponseText, suggestions: fallbackSuggestions });
    }
  });

  // Vite middleware setup (development)
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LeanAI Coach server running on port ${PORT}`);
  });
}

startServer();
