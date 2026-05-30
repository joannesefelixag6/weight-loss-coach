/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Activity, Flame, PieChart, Droplet, Percent, Compass, Info, CheckCircle2 } from 'lucide-react';

interface InteractiveToolsProps {
  activeTab?: 'bmi' | 'calorie' | 'macro' | 'water' | 'fat' | 'goal';
  onChangeTab?: (tab: 'bmi' | 'calorie' | 'macro' | 'water' | 'fat' | 'goal') => void;
}

export default function InteractiveTools({ activeTab: propActiveTab, onChangeTab }: InteractiveToolsProps = {}) {
  const [localActiveTab, setLocalActiveTab] = useState<'bmi' | 'calorie' | 'macro' | 'water' | 'fat' | 'goal'>('bmi');
  
  const activeTab = propActiveTab !== undefined ? propActiveTab : localActiveTab;
  
  const setActiveTab = (tab: 'bmi' | 'calorie' | 'macro' | 'water' | 'fat' | 'goal') => {
    if (onChangeTab) {
      onChangeTab(tab);
    } else {
      setLocalActiveTab(tab);
    }
  };

  // BMI States
  const [bmiHeight, setBmiHeight] = useState(175);
  const [bmiWeight, setBmiWeight] = useState(78);

  // Calorie States
  const [calAge, setCalAge] = useState(30);
  const [calGender, setCalGender] = useState<'male' | 'female'>('male');
  const [calHeight, setCalHeight] = useState(175);
  const [calWeight, setCalWeight] = useState(80);
  const [calActivity, setCalActivity] = useState('moderately_active');

  // Macro States
  const [macroTargetCal, setMacroTargetCal] = useState(2000);
  const [macroDietGoal, setMacroDietGoal] = useState<'lean' | 'keto' | 'balanced'>('balanced');

  // Water States
  const [waterWeight, setWaterWeight] = useState(75);
  const [waterExerciseMin, setWaterExerciseMin] = useState(45);

  // Body Fat States (YMCA metric method)
  const [fatGender, setFatGender] = useState<'male' | 'female'>('male');
  const [fatWaist, setFatWaist] = useState(88); // cm
  const [fatWeight, setFatWeight] = useState(80); // kg
  const [fatNeck, setFatNeck] = useState(38); // cm (male)
  const [fatForearm, setFatForearm] = useState(28); // cm (female)

  // Goal Planner States
  const [goalCurrent, setGoalCurrent] = useState(85);
  const [goalTarget, setGoalTarget] = useState(75);
  const [goalPace, setGoalPace] = useState(0.5); // kg per week

  // Calculated Results
  const computeBmi = () => {
    const hM = bmiHeight / 100;
    const val = Number((bmiWeight / (hM * hM)).toFixed(1));
    let status = 'Healthy Weight';
    let color = 'text-green-500 bg-green-50 border-green-100';
    let desc = 'You have a healthy body weight. Maintain exercise and a high protein diet!';

    if (val < 18.5) {
      status = 'Underweight';
      color = 'text-blue-500 bg-blue-50 border-blue-100';
      desc = 'Consider speaking to LeanAI about a structured clean caloric surplus.';
    } else if (val >= 25 && val < 29.9) {
      status = 'Overweight';
      color = 'text-amber-500 bg-amber-50 border-amber-100';
      desc = 'A slight calorie deficit (e.g. 300 kcal) and strength load training is advised.';
    } else if (val >= 30) {
      status = 'Obese';
      color = 'text-red-500 bg-red-50 border-red-100';
      desc = 'Our AI coach recommends a structured, fiber-dense diet limit combined with light cardio.';
    }
    return { val, status, color, desc };
  };

  const computeCalories = () => {
    let bmr = 10 * calWeight + 6.25 * calHeight - 5 * calAge;
    if (calGender === 'male') {
      bmr += 5;
    } else {
      bmr -= 161;
    }

    let multiplier = 1.2;
    if (calActivity === 'sedentary') multiplier = 1.2;
    if (calActivity === 'lightly_active') multiplier = 1.375;
    if (calActivity === 'moderately_active') multiplier = 1.55;
    if (calActivity === 'very_active') multiplier = 1.725;

    const maintenance = Math.round(bmr * multiplier);
    return {
      bmr: Math.round(bmr),
      maintenance,
      loseWeightFast: Math.round(maintenance - 700 < 1200 ? 1200 : maintenance - 700),
      loseWeightRecommended: Math.round(maintenance - 400 < 1200 ? 1200 : maintenance - 400),
    };
  };

  const computeMacros = () => {
    let pPct = 30;
    let cPct = 40;
    let fPct = 30;

    if (macroDietGoal === 'lean') {
      pPct = 40;
      cPct = 30;
      fPct = 30;
    } else if (macroDietGoal === 'keto') {
      pPct = 25;
      cPct = 5;
      fPct = 70;
    }

    const pG = Math.round((macroTargetCal * (pPct / 100)) / 4);
    const cG = Math.round((macroTargetCal * (cPct / 100)) / 4);
    const fG = Math.round((macroTargetCal * (fPct / 100)) / 9);

    return { pPct, cPct, fPct, pG, cG, fG };
  };

  const computeWater = () => {
    // 35ml water per kg + 250ml for every 30 min of training
    const baseline = waterWeight * 35;
    const activeBonus = (waterExerciseMin / 30) * 250;
    const totalMl = Math.round(baseline + activeBonus);
    return {
      liters: (totalMl / 1000).toFixed(2),
      glasses: Math.round(totalMl / 250),
    };
  };

  const computeBodyFat = () => {
    // Standard waist-weight correlation formula for high level applet mock estimate
    let bf = 0;
    if (fatGender === 'male') {
      // YMCA Formula
      const waistInches = fatWaist / 2.54;
      const weightLbs = fatWeight * 2.20462;
      const term1 = 4.15 * waistInches;
      const term2 = 0.082 * weightLbs;
      const factor = term1 - term2 - 98.42;
      bf = Math.round((factor / weightLbs) * 100);
    } else {
      const waistInches = fatWaist / 2.54;
      const weightLbs = fatWeight * 2.20462;
      const term1 = 4.15 * waistInches;
      const term2 = 0.082 * weightLbs;
      const factor = term1 - term2 - 76.76;
      bf = Math.round((factor / weightLbs) * 100);
    }

    if (bf < 4) bf = 7;
    if (bf > 45) bf = 38;

    let status = 'Optimal Fitness';
    let col = 'text-green-500 bg-green-50 border-green-100';
    if (fatGender === 'male') {
      if (bf > 25) {
        status = 'High Adiposity';
        col = 'text-red-500 bg-red-50 border-red-100';
      } else if (bf > 18) {
        status = 'Normal';
        col = 'text-amber-500 bg-amber-50 border-amber-100';
      }
    } else {
      if (bf > 32) {
        status = 'High Adiposity';
        col = 'text-red-500 bg-red-50 border-red-100';
      } else if (bf > 25) {
        status = 'Normal';
        col = 'text-amber-500 bg-amber-50 border-amber-100';
      }
    }

    return { bf, status, color: col };
  };

  const computeGoalWeeks = () => {
    const diff = goalCurrent - goalTarget;
    if (diff <= 0) return { weeks: 0, requiredDeficit: 0, targetDateText: 'Goal met!' };
    const weeks = Math.round(diff / goalPace);
    const requiredDeficit = Math.round(goalPace * 1100); // (~7700 kcal per kg)
    return { weeks, requiredDeficit };
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
      {/* Tab Navigation */}
      <div className="grid grid-cols-3 sm:grid-cols-6 border-b border-slate-100 bg-slate-50/50 p-2 gap-1">
        <button
          onClick={() => setActiveTab('bmi')}
          className={`flex items-center justify-center space-x-1.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'bmi'
              ? 'bg-white text-emerald-600 shadow-sm border border-slate-100'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>BMI</span>
        </button>
        <button
          onClick={() => setActiveTab('calorie')}
          className={`flex items-center justify-center space-x-1.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'calorie'
              ? 'bg-white text-emerald-600 shadow-sm border border-slate-100'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Calories</span>
        </button>
        <button
          onClick={() => setActiveTab('macro')}
          className={`flex items-center justify-center space-x-1.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'macro'
              ? 'bg-white text-emerald-600 shadow-sm border border-slate-100'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>Macros</span>
        </button>
        <button
          onClick={() => setActiveTab('water')}
          className={`flex items-center justify-center space-x-1.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'water'
              ? 'bg-white text-emerald-600 shadow-sm border border-slate-100'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
          }`}
        >
          <Droplet className="w-4 h-4" />
          <span>Water</span>
        </button>
        <button
          onClick={() => setActiveTab('fat')}
          className={`flex items-center justify-center space-x-1.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'fat'
              ? 'bg-white text-emerald-600 shadow-sm border border-slate-100'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
          }`}
        >
          <Percent className="w-4 h-4" />
          <span>Body Fat</span>
        </button>
        <button
          onClick={() => setActiveTab('goal')}
          className={`flex items-center justify-center space-x-1.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'goal'
              ? 'bg-white text-emerald-600 shadow-sm border border-slate-100'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Goals</span>
        </button>
      </div>

      <div className="p-6 sm:p-8">
        {/* BMI CALCULATOR */}
        {activeTab === 'bmi' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="font-sans font-bold text-lg text-slate-800">BMI Body Mass Index</h3>
                <p className="text-slate-500 text-sm mt-1">
                  Assess body shape correlation instantly based on raw static dimensions.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-600 text-sm font-semibold font-sans">Height (cm)</span>
                    <span className="text-slate-800 font-mono text-sm font-bold bg-slate-50 px-2.5 py-1 rounded-lg">{bmiHeight} cm</span>
                  </div>
                  <input
                    type="range"
                    min={120}
                    max={220}
                    value={bmiHeight}
                    onChange={(e) => setBmiHeight(Number(e.target.value))}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-600 text-sm font-semibold font-sans">Weight (kg)</span>
                    <span className="text-slate-800 font-mono text-sm font-bold bg-slate-50 px-2.5 py-1 rounded-lg">{bmiWeight} kg</span>
                  </div>
                  <input
                    type="range"
                    min={40}
                    max={150}
                    value={bmiWeight}
                    onChange={(e) => setBmiWeight(Number(e.target.value))}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 flex flex-col justify-between border border-slate-100">
              <div className="space-y-4">
                <span className="text-slate-500 text-xs tracking-wider uppercase font-bold font-sans">Index Score Result</span>
                <div className="flex items-baseline space-x-3">
                  <span className="text-5xl font-mono font-bold text-slate-800">{computeBmi().val}</span>
                  <span className={`px-3 py-1 border rounded-lg text-xs font-semibold ${computeBmi().color}`}>
                    {computeBmi().status}
                  </span>
                </div>
                <p className="text-slate-600 text-sm font-medium">{computeBmi().desc}</p>
              </div>

              {/* Graphical Scale */}
              <div className="mt-6 pt-4 border-t border-slate-200/60">
                <div className="flex justify-between text-[10px] text-slate-400 font-bold mb-1.5">
                  <span>18.5 UNDER</span>
                  <span>25.0 NORM</span>
                  <span>30.0 OVER</span>
                </div>
                <div className="h-2 bg-gradient-to-r from-blue-300 via-green-300 to-red-300 rounded-full relative">
                  <div
                    className="absolute w-4 h-4 bg-slate-800 rounded-full border-2 border-white -top-1"
                    style={{
                      left: `${Math.min(
                        Math.max(((computeBmi().val - 15) / 20) * 100, 2),
                        95
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CALORIE CALCULATOR */}
        {activeTab === 'calorie' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4 select-none">
              <div>
                <h3 className="font-sans font-bold text-lg text-slate-800">Calorie Energy Forecaster</h3>
                <p className="text-slate-500 text-sm mt-1">Calculate your scientific Basal Metabolic Rate and daily maintenance.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Gender</label>
                  <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl">
                    <button
                      onClick={() => setCalGender('male')}
                      className={`flex-1 text-center py-1.5 text-xs font-semibold rounded-lg ${
                        calGender === 'male' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
                      }`}
                    >
                      Male
                    </button>
                    <button
                      onClick={() => setCalGender('female')}
                      className={`flex-1 text-center py-1.5 text-xs font-semibold rounded-lg ${
                        calGender === 'female' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
                      }`}
                    >
                      Female
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Age (Yrs)</label>
                  <input
                    type="number"
                    value={calAge}
                    onChange={(e) => setCalAge(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-sm font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Height (cm)</label>
                  <input
                    type="number"
                    value={calHeight}
                    onChange={(e) => setCalHeight(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-sm font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={calWeight}
                    onChange={(e) => setCalWeight(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-sm font-bold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Activity Level</label>
                <select
                  value={calActivity}
                  onChange={(e) => setCalActivity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 outline-none"
                >
                  <option value="sedentary">Sedentary (Little/no training)</option>
                  <option value="lightly_active">Light Active (1-3 days/wk)</option>
                  <option value="moderately_active">Moderately Active (3-5 days/wk)</option>
                  <option value="very_active">Very Active (6-7 days/wk)</option>
                </select>
              </div>
            </div>

            <div className="bg-slate-900 text-white rounded-2xl p-6 justify-between flex flex-col shadow-lg">
              <span className="text-emerald-400 text-xs font-semibold tracking-wider uppercase font-sans">
                Energy Balance Breakdown
              </span>

              <div className="grid grid-cols-3 gap-3 my-4">
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <span className="block text-[10px] text-slate-400 uppercase font-bold">BMR Target</span>
                  <span className="text-xl font-mono font-bold text-slate-200">{computeCalories().bmr}</span>
                  <span className="block text-[8px] text-slate-400">kcal/day</span>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <span className="block text-[10px] text-slate-400 uppercase font-bold">Maintenance</span>
                  <span className="text-xl font-mono font-bold text-emerald-400">{computeCalories().maintenance}</span>
                  <span className="block text-[8px] text-slate-400">kcal/day</span>
                </div>
                <div className="p-3 bg-white/10 rounded-xl border border-emerald-500/20">
                  <span className="block text-[10px] text-emerald-300 uppercase font-bold">Lose Weight</span>
                  <span className="text-xl font-mono font-bold text-white">{computeCalories().loseWeightRecommended}</span>
                  <span className="block text-[8px] text-slate-400">kcal/day</span>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 space-y-2 text-xs">
                <p className="text-slate-300 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Deficit of 400 kcal per day will burn 0.4kg pure fat weekly.</span>
                </p>
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/5 flex items-start space-x-2">
                  <Info className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-[11px] leading-relaxed text-slate-300">
                    LeanAI Coach tracks active metabolic adaptation and automatically re-indexes these values as parameters adjust.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MACRO CALCULATOR */}
        {activeTab === 'macro' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="font-sans font-bold text-lg text-slate-800">Custom Macromolecule Split</h3>
                <p className="text-slate-500 text-sm mt-1">Verify nutrient distributions to feed metabolic muscle mass.</p>
              </div>

              <div>
                <label className="block text-slate-600 text-sm font-semibold mb-2">Daily Caloric Volume Target</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="range"
                    min={1200}
                    max={3500}
                    step={50}
                    value={macroTargetCal}
                    onChange={(e) => setMacroTargetCal(Number(e.target.value))}
                    className="flex-1 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <span className="font-mono font-bold text-slate-800 text-sm bg-slate-100 px-3 py-1.5 rounded-lg">
                    {macroTargetCal} kcal
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Diet Protocol Style</label>
                <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setMacroDietGoal('balanced')}
                    className={`text-center py-2 text-xs font-semibold rounded-lg ${
                      macroDietGoal === 'balanced'
                        ? 'bg-white text-slate-800 shadow-sm'
                        : 'text-slate-500 hover:text-slate-850'
                    }`}
                  >
                    Balanced
                  </button>
                  <button
                    onClick={() => setMacroDietGoal('lean')}
                    className={`text-center py-2 text-xs font-semibold rounded-lg ${
                      macroDietGoal === 'lean'
                        ? 'bg-white text-emerald-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-850'
                    }`}
                  >
                    High Protein
                  </button>
                  <button
                    onClick={() => setMacroDietGoal('keto')}
                    className={`text-center py-2 text-xs font-semibold rounded-lg ${
                      macroDietGoal === 'keto'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-850'
                    }`}
                  >
                    Keto / Low Carb
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6 flex flex-col justify-between">
              <div>
                <span className="text-xs uppercase font-bold text-slate-400">Calculated Daily Grams split</span>
                <div className="space-y-4 mt-4">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-650 mb-1">
                      <span>Protein (Leverage)</span>
                      <span className="font-mono text-slate-800">{computeMacros().pG}g ({computeMacros().pPct}%)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${computeMacros().pPct}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-650 mb-1">
                      <span>Carbohydrates (Energy)</span>
                      <span className="font-mono text-slate-800">{computeMacros().cG}g ({computeMacros().cPct}%)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${computeMacros().cPct}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-650 mb-1">
                      <span>Fats (Hormonal Balance)</span>
                      <span className="font-mono text-slate-800">{computeMacros().fG}g ({computeMacros().fPct}%)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500" style={{ width: `${computeMacros().fPct}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-[11px] leading-relaxed text-slate-500 mt-6 pt-3 border-t border-slate-200">
                Scientific proteins scale directly to prevent lipolytic metabolic adaptation and maximize safe lipid fat burning.
              </p>
            </div>
          </div>
        )}

        {/* WATER INTAKE CALCULATOR */}
        {activeTab === 'water' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="font-sans font-bold text-lg text-slate-800">Hydration Sizing Target</h3>
                <p className="text-slate-500 text-sm mt-1">Liquid baseline is essential to optimize metabolic rates.</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-600 text-sm font-semibold">Your Weight (kg)</span>
                  <span className="text-emerald-600 font-mono text-sm font-bold bg-emerald-50/50 px-2.5 py-1 rounded-lg">{waterWeight} kg</span>
                </div>
                <input
                  type="range"
                  min={40}
                  max={150}
                  value={waterWeight}
                  onChange={(e) => setWaterWeight(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-600 text-sm font-semibold">Exercise length (Minutes)</span>
                  <span className="text-emerald-600 font-mono text-sm font-bold bg-emerald-50/50 px-2.5 py-1 rounded-lg">{waterExerciseMin} mins</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={120}
                  step={10}
                  value={waterExerciseMin}
                  onChange={(e) => setWaterExerciseMin(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            </div>

            <div className="bg-sky-50 text-sky-900 border border-sky-100 rounded-2xl p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-sky-500 text-xs tracking-wider uppercase font-bold font-sans">Ideal Liquid Hydration Target</span>
                <div className="flex items-baseline space-x-2">
                  <span className="text-5xl font-mono font-bold text-sky-800">{computeWater().liters}</span>
                  <span className="text-xl font-semibold">Liters / day</span>
                </div>
                <p className="text-sky-700 text-sm leading-relaxed">
                  Which parses to approximately <strong className="font-extrabold">{computeWater().glasses} glasses</strong> of 250ml water daily.
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-sky-200/55 flex items-start space-x-2 text-xs text-sky-700">
                <Info className="w-4 h-4 text-sky-500 mt-0.5 flex-shrink-0" />
                <span>Drinking 1 tall glass of water before meals naturally decreases gut hunger triggers and enhances gastric digestion.</span>
              </div>
            </div>
          </div>
        )}

        {/* BODY FAT CALCULATOR */}
        {activeTab === 'fat' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <h3 className="font-sans font-bold text-lg text-slate-800">YMCA Lipid body density check</h3>
                <p className="text-slate-500 text-sm mt-1">Estimate total adipose cellular correlation without expensive scanners.</p>
              </div>

              <div className="flex space-x-1 bg-slate-150 p-1 rounded-xl">
                <button
                  onClick={() => setFatGender('male')}
                  className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg ${
                    fatGender === 'male' ? 'bg-white text-slate-850 shadow-sm font-bold' : 'text-slate-500'
                  }`}
                >
                  Male Criteria
                </button>
                <button
                  onClick={() => setFatGender('female')}
                  className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg ${
                    fatGender === 'female' ? 'bg-white text-slate-850 shadow-sm font-bold' : 'text-slate-500'
                  }`}
                >
                  Female Criteria
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Waist size (cm)</label>
                  <input
                    type="number"
                    value={fatWaist}
                    onChange={(e) => setFatWaist(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-sm font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={fatWeight}
                    onChange={(e) => setFatWeight(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-sm font-bold text-slate-800"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-xs uppercase font-bold text-slate-400">Estimated Body Fat Density</span>
                <div className="flex items-baseline space-x-3">
                  <span className="text-5xl font-mono font-bold text-slate-800">{computeBodyFat().bf}%</span>
                  <span className={`px-2.5 py-1 border rounded-lg text-xs font-semibold ${computeBodyFat().color}`}>
                    {computeBodyFat().status}
                  </span>
                </div>
                <div className="text-slate-500 text-xs">
                  Estimated adipose weight is <span className="font-bold text-slate-700 font-mono">{Math.round((fatWeight * computeBodyFat().bf) / 100)} kg</span> fat, and <span className="font-bold text-slate-700 font-mono">{Math.round(fatWeight - (fatWeight * computeBodyFat().bf) / 100)} kg</span> lean tissues.
                </div>
              </div>

              <p className="text-[10px] text-slate-400 leading-relaxed border-t border-slate-250/50 mt-4 pt-3">
                Disclaimer: Circumference estimations can fluctuate based on visceral water retention. Speak to LeanAI inside the dashboard to run deep customized analysis logs.
              </p>
            </div>
          </div>
        )}

        {/* GOAL PLANNING TOOL */}
        {activeTab === 'goal' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <h3 className="font-sans font-bold text-lg text-slate-800">Dynamic Lipid Timeline Planner</h3>
                <p className="text-slate-500 text-sm mt-1">Calculate the healthy, realistic timeframe required to crash goal targets.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Current weight (kg)</label>
                  <input
                    type="number"
                    value={goalCurrent}
                    onChange={(e) => setGoalCurrent(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-sm font-bold text-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Goal weight (kg)</label>
                  <input
                    type="number"
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-sm font-bold text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Intended Weekly Weight Loss Pace: {goalPace} kg/wk</label>
                <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setGoalPace(0.25)}
                    className={`text-center py-1.5 text-xs font-semibold rounded-lg ${
                      goalPace === 0.25 ? 'bg-white text-slate-850 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    Steady (0.25kg)
                  </button>
                  <button
                    onClick={() => setGoalPace(0.5)}
                    className={`text-center py-1.5 text-xs font-semibold rounded-lg ${
                      goalPace === 0.5 ? 'bg-white text-slate-850 shadow-xs font-bold' : 'text-slate-500'
                    }`}
                  >
                    Recommend (0.5kg)
                  </button>
                  <button
                    onClick={() => setGoalPace(0.85)}
                    className={`text-center py-1.5 text-xs font-semibold rounded-lg ${
                      goalPace === 0.85 ? 'bg-white text-slate-850 shadow-xs' : 'text-slate-550'
                    }`}
                  >
                    Fast (0.85kg)
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-emerald-950 text-emerald-200 rounded-2xl p-6 flex flex-col justify-between">
              <span className="text-emerald-400 text-xs font-semibold tracking-wider uppercase font-sans">
                Target Timeline Results
              </span>

              <div className="my-4 space-y-3">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-slate-300 text-xs">Weeks to target:</span>
                  <span className="text-2xl font-mono font-bold text-white">{computeGoalWeeks().weeks} Weeks</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 text-xs">Daily deficits required:</span>
                  <span className="text-lg font-mono font-bold text-emerald-400">-{computeGoalWeeks().requiredDeficit} kcal</span>
                </div>
              </div>

              <p className="text-[11px] leading-relaxed text-slate-300">
                Achieving lipid homeostasis at a controlled pace ensures your hormone receptors (thyroid, leptin) preserve full metabolic balance.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
