/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Utensils, 
  Apple, 
  Flame, 
  Scale, 
  Plus, 
  Trash2, 
  Sparkles, 
  GlassWater, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Award, 
  Activity, 
  PlusCircle, 
  Coffee, 
  Settings, 
  RefreshCw, 
  Info,
  Check,
  AlertCircle
} from 'lucide-react';
import { getLocalDateString } from '../utils/dateUtils';
import { customConfirm, customAlert } from '../utils/customAlerts';

// Types for food logging
export interface FoodLogItem {
  id: string;
  name: string;
  mealType: 'Desayuno' | 'Almuerzo' | 'Merienda' | 'Cena' | 'Colación';
  weightGrams: number;
  calories: number; // calculated based on weight
  protein: number;
  carbs: number;
  fat: number;
  date: string; // YYYY-MM-DD
}

export interface CustomPresetFood {
  id: string;
  name: string;
  caloriesPer150g?: number; // helper or per 100g
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  category: string;
}

export interface NutritionGoals {
  presetName: 'definition' | 'bulking' | 'maintenance' | 'custom';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  waterLiters: number;
  targetWeightKg: number;
  currentWeightKg: number;
  heightCm?: number;
  ageYears?: number;
  gender?: 'male' | 'female';
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active';
}

export interface RecommendedQuickAction {
  id: string;
  name: string;
  weightGrams: number;
  mealType: FoodLogItem['mealType'];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  reason: string;
}

// Preset healthy food templates (Common foods)
const PRESET_FOOD_TEMPLATES: CustomPresetFood[] = [
  { id: 'p1', name: 'Pechuga de Pollo cocida', caloriesPer100g: 165, proteinPer100g: 31, carbsPer100g: 0, fatPer100g: 3.6, category: 'Proteínas' },
  { id: 'p2', name: 'Carne de Vacuno magra cocida', caloriesPer100g: 250, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 15, category: 'Proteínas' },
  { id: 'p3', name: 'Huevo entero cocido (1 u ~50g)', caloriesPer100g: 155, proteinPer100g: 13, carbsPer100g: 1.1, fatPer100g: 11, category: 'Proteínas' },
  { id: 'p4', name: 'Clara de Huevo (1 u ~30g)', caloriesPer100g: 52, proteinPer100g: 11, carbsPer100g: 0.7, fatPer100g: 0.2, category: 'Proteínas' },
  { id: 'p5', name: 'Arroz Blanco hervido', caloriesPer100g: 130, proteinPer100g: 2.7, carbsPer100g: 28, fatPer100g: 0.3, category: 'Carbohidratos' },
  { id: 'p6', name: 'Arroz Integral hervido', caloriesPer100g: 111, proteinPer100g: 2.6, carbsPer100g: 23, fatPer100g: 0.9, category: 'Carbohidratos' },
  { id: 'p7', name: 'Avena en hojuelas', caloriesPer100g: 389, proteinPer100g: 16.9, carbsPer100g: 66, fatPer100g: 6.9, category: 'Carbohidratos' },
  { id: 'p8', name: 'Batata / Camote hervido', caloriesPer100g: 86, proteinPer100g: 1.6, carbsPer100g: 20, fatPer100g: 0.1, category: 'Carbohidratos' },
  { id: 'p9', name: 'Pan Lactal Integral (1 rebanada ~25g)', caloriesPer100g: 250, proteinPer100g: 10, carbsPer100g: 45, fatPer100g: 3.5, category: 'Carbohidratos' },
  { id: 'p10', name: 'Banana (1 u mediana ~120g)', caloriesPer100g: 89, proteinPer100g: 1.1, carbsPer100g: 23, fatPer100g: 0.3, category: 'Frutas' },
  { id: 'p11', name: 'Manzana (1 u mediana ~150g)', caloriesPer100g: 52, proteinPer100g: 0.3, carbsPer100g: 14, fatPer100g: 0.2, category: 'Frutas' },
  { id: 'p12', name: 'Palta / Aguacate', caloriesPer100g: 160, proteinPer100g: 2, carbsPer100g: 9, fatPer100g: 15, category: 'Grasas' },
  { id: 'p13', name: 'Mantequilla de Maní', caloriesPer100g: 588, proteinPer100g: 25, carbsPer100g: 20, fatPer100g: 50, category: 'Grasas' },
  { id: 'p14', name: 'Suplemento de Proteína Whey (1 scoop ~30g)', caloriesPer100g: 390, proteinPer100g: 80, carbsPer100g: 6, fatPer100g: 5, category: 'Proteínas' },
  { id: 'p15', name: 'Queso Crema descremado', caloriesPer100g: 95, proteinPer100g: 7.5, carbsPer100g: 4.2, fatPer100g: 5, category: 'Proteínas' },
  { id: 'p16', name: 'Atún al agua escurrido', caloriesPer100g: 116, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 1, category: 'Proteínas' }
];

interface NutritionModuleProps {
  accentColor: 'indigo' | 'emerald' | 'amber' | 'rose';
}

export default function NutritionModule({ accentColor }: NutritionModuleProps) {
  // Navigation for days inside Nutrition Tab
  const [selectedDate, setSelectedDate] = useState<string>(getLocalDateString());

  // Logged foods state
  const [foodLogs, setFoodLogs] = useState<FoodLogItem[]>(() => {
    const saved = localStorage.getItem('control_personal_food_logs');
    return saved ? JSON.parse(saved) : [];
  });

  // Daily Water logs (key is date string, value is mL of water consumed)
  const [waterLogs, setWaterLogs] = useState<{ [date: string]: number }>(() => {
    const saved = localStorage.getItem('control_personal_water_logs');
    return saved ? JSON.parse(saved) : {};
  });

  // Target Goals
  const [goals, setGoals] = useState<NutritionGoals>(() => {
    const saved = localStorage.getItem('control_personal_nutrition_goals');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          presetName: parsed.presetName || 'maintenance',
          calories: parsed.calories ?? 2200,
          protein: parsed.protein ?? 140,
          carbs: parsed.carbs ?? 220,
          fat: parsed.fat ?? 65,
          waterLiters: parsed.waterLiters ?? 2.5,
          currentWeightKg: parsed.currentWeightKg ?? 75,
          targetWeightKg: parsed.targetWeightKg ?? 75,
          heightCm: parsed.heightCm ?? 175,
          ageYears: parsed.ageYears ?? 25,
          gender: parsed.gender ?? 'male',
          activityLevel: parsed.activityLevel ?? 'moderate'
        };
      } catch (e) {
        // fall through
      }
    }
    // Default goals (Maintenance-leaning)
    return {
      presetName: 'maintenance',
      calories: 2200,
      protein: 140,
      carbs: 220,
      fat: 65,
      waterLiters: 2.5,
      currentWeightKg: 75,
      targetWeightKg: 75,
      heightCm: 175,
      ageYears: 25,
      gender: 'male',
      activityLevel: 'moderate'
    };
  });

  // Form states for custom/templated food creation
  const [mealType, setMealType] = useState<FoodLogItem['mealType']>('Almuerzo');
  const [foodName, setFoodName] = useState('');
  const [weightGrams, setWeightGrams] = useState<number>(100);
  const [calPer100, setCalPer100] = useState<number>(150);
  const [protPer100, setProtPer100] = useState<number>(12);
  const [carbPer100, setCarbPer100] = useState<number>(15);
  const [fatPer100, setFatPer100] = useState<number>(5);

  // Search filter and selected preset helper
  const [searchPreset, setSearchPreset] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  // Editing goals states
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [goalPreset, setGoalPreset] = useState<NutritionGoals['presetName']>(goals.presetName);
  const [goalCalories, setGoalCalories] = useState(goals.calories);
  const [goalProtein, setGoalProtein] = useState(goals.protein);
  const [goalCarbs, setGoalCarbs] = useState(goals.carbs);
  const [goalFat, setGoalFat] = useState(goals.fat);
  const [goalWater, setGoalWater] = useState(goals.waterLiters);
  const [goalCurrentWeight, setGoalCurrentWeight] = useState(goals.currentWeightKg);
  const [goalTargetWeight, setGoalTargetWeight] = useState(goals.targetWeightKg);
  const [goalHeight, setGoalHeight] = useState<number>(goals.heightCm ?? 175);
  const [goalAge, setGoalAge] = useState<number>(goals.ageYears ?? 25);
  const [goalGender, setGoalGender] = useState<'male' | 'female'>(goals.gender ?? 'male');
  const [goalActivity, setGoalActivity] = useState<'sedentary' | 'light' | 'moderate' | 'active'>(goals.activityLevel ?? 'moderate');

  // Sync state to localstorage
  useEffect(() => {
    localStorage.setItem('control_personal_food_logs', JSON.stringify(foodLogs));
  }, [foodLogs]);

  useEffect(() => {
    localStorage.setItem('control_personal_water_logs', JSON.stringify(waterLogs));
  }, [waterLogs]);

  useEffect(() => {
    localStorage.setItem('control_personal_nutrition_goals', JSON.stringify(goals));
  }, [goals]);

  // Apply default settings to the input form when a preset template is selected
  const handleSelectTemplate = (id: string) => {
    const found = PRESET_FOOD_TEMPLATES.find(p => p.id === id);
    if (found) {
      setSelectedTemplateId(found.id);
      setFoodName(found.name);
      setCalPer100(found.caloriesPer100g);
      setProtPer100(found.proteinPer100g);
      setCarbPer100(found.carbsPer100g);
      setFatPer100(found.fatPer100g);
    }
  };

  const handleLoggedFoodSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim() || weightGrams <= 0) {
      customAlert('Por favor, ingresa el nombre de la comida y un peso adecuado.', 'warning');
      return;
    }

    // Math conversions based on input weight and properties per 100g
    const factor = weightGrams / 100;
    const itemCalories = Math.round(calPer100 * factor);
    const itemProtein = Math.round(protPer100 * factor * 10) / 10;
    const itemCarbs = Math.round(carbPer100 * factor * 10) / 10;
    const itemFat = Math.round(fatPer100 * factor * 10) / 10;

    const newLogItem: FoodLogItem = {
      id: 'food_log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      name: foodName,
      mealType,
      weightGrams,
      calories: itemCalories,
      protein: itemProtein,
      carbs: itemCarbs,
      fat: itemFat,
      date: selectedDate
    };

    setFoodLogs(prev => [newLogItem, ...prev]);
    
    // Reset form selectively to make entering multiple items easy
    setFoodName('');
    setWeightGrams(100);
    setSearchPreset('');
    setSelectedTemplateId('');
    customAlert(`Registrado: ${newLogItem.name} (${weightGrams}g) en ${mealType}.`, 'success');
  };

  const handleDeleteLogItem = (id: string, name: string) => {
    customConfirm(
      `¿Deseas eliminar la porción de "${name}" registrada?`,
      () => {
        setFoodLogs(prev => prev.filter(item => item.id !== id));
        customAlert('Registro eliminado correctamente.', 'success');
      }
    );
  };

  const handleWaterAdd = (amountMl: number) => {
    const current = waterLogs[selectedDate] || 0;
    const updated = Math.max(0, current + amountMl);
    setWaterLogs(prev => ({
      ...prev,
      [selectedDate]: updated
    }));
  };

  const handleWaterReset = () => {
    setWaterLogs(prev => ({
      ...prev,
      [selectedDate]: 0
    }));
  };

  // Automated calculator function using Mifflin-St Jeor
  const recalculateMacros = (
    preset: NutritionGoals['presetName'],
    weight: number,
    height: number,
    age: number,
    gender: 'male' | 'female',
    activity: 'sedentary' | 'light' | 'moderate' | 'active'
  ) => {
    if (preset === 'custom') return;

    // 1. BMR (Mifflin-St Jeor)
    let bmr = 10 * weight + 6.25 * height - 5 * age;
    if (gender === 'male') {
      bmr += 5;
    } else {
      bmr -= 161;
    }

    // 2. TDEE (activity multiplier)
    let factor = 1.2;
    if (activity === 'light') factor = 1.375;
    else if (activity === 'moderate') factor = 1.55;
    else if (activity === 'active') factor = 1.725;

    const tdee = bmr * factor;

    // 3. Goal adjustment
    let targetCals = tdee;
    let targetProt = weight * 1.8;
    let targetFat = weight * 0.9;
    let targetWater = 2.5;

    if (preset === 'bulking') {
      targetCals = tdee + 400;
      targetProt = weight * 2.0;
      targetFat = weight * 1.0;
      targetWater = 3.2;
    } else if (preset === 'definition') {
      targetCals = tdee - 500;
      targetProt = weight * 2.2;
      targetFat = weight * 0.8;
      targetWater = 3.0;
    }

    // Calculate Carbs from remainder
    const protCal = targetProt * 4;
    const fatCal = targetFat * 9;
    let targetCarbs = (targetCals - protCal - fatCal) / 4;
    if (targetCarbs < 80) targetCarbs = 80;

    setGoalCalories(Math.round(targetCals));
    setGoalProtein(Math.round(targetProt));
    setGoalFat(Math.round(targetFat));
    setGoalCarbs(Math.round(targetCarbs));
    setGoalWater(targetWater);
  };

  const updatePreset = (val: NutritionGoals['presetName']) => {
    setGoalPreset(val);
    recalculateMacros(val, goalCurrentWeight, goalHeight, goalAge, goalGender, goalActivity);
  };

  const updateCurrentWeight = (val: number) => {
    setGoalCurrentWeight(val);
    recalculateMacros(goalPreset, val, goalHeight, goalAge, goalGender, goalActivity);
  };

  const updateHeight = (val: number) => {
    setGoalHeight(val);
    recalculateMacros(goalPreset, goalCurrentWeight, val, goalAge, goalGender, goalActivity);
  };

  const updateAge = (val: number) => {
    setGoalAge(val);
    recalculateMacros(goalPreset, goalCurrentWeight, goalHeight, val, goalGender, goalActivity);
  };

  const updateGender = (val: 'male' | 'female') => {
    setGoalGender(val);
    recalculateMacros(goalPreset, goalCurrentWeight, goalHeight, goalAge, val, goalActivity);
  };

  const updateActivity = (val: 'sedentary' | 'light' | 'moderate' | 'active') => {
    setGoalActivity(val);
    recalculateMacros(goalPreset, goalCurrentWeight, goalHeight, goalAge, goalGender, val);
  };

  const handleManualCalorieEdit = (val: number) => {
    setGoalCalories(val);
    setGoalPreset('custom');
  };
  const handleManualProteinEdit = (val: number) => {
    setGoalProtein(val);
    setGoalPreset('custom');
  };
  const handleManualCarbEdit = (val: number) => {
    setGoalCarbs(val);
    setGoalPreset('custom');
  };
  const handleManualFatEdit = (val: number) => {
    setGoalFat(val);
    setGoalPreset('custom');
  };
  const handleManualWaterEdit = (val: number) => {
    setGoalWater(val);
    setGoalPreset('custom');
  };

  const handleSaveGoals = (e: React.FormEvent) => {
    e.preventDefault();
    setGoals({
      presetName: goalPreset,
      calories: goalCalories,
      protein: goalProtein,
      carbs: goalCarbs,
      fat: goalFat,
      waterLiters: goalWater,
      currentWeightKg: goalCurrentWeight,
      targetWeightKg: goalTargetWeight,
      heightCm: goalHeight,
      ageYears: goalAge,
      gender: goalGender,
      activityLevel: goalActivity
    });
    setIsEditingGoals(false);
    customAlert('Objetivos actualizados y recalculados con éxito.', 'success');
  };

  // One-click quick log recommend handler
  const handleQuickActionClick = (action: RecommendedQuickAction) => {
    if (action.id === 'qa_w1') {
      // It is water
      setWaterLogs(prev => {
        const current = prev[selectedDate] || 0;
        return {
          ...prev,
          [selectedDate]: current + 250
        };
      });
      customAlert('¡Hidratación: +250ml de agua añadidos!', 'success');
      return;
    }

    const newLogItem: FoodLogItem = {
      id: 'food_log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      name: action.name,
      mealType: action.mealType,
      weightGrams: action.weightGrams,
      calories: action.calories,
      protein: action.protein,
      carbs: action.carbs,
      fat: action.fat,
      date: selectedDate
    };

    setFoodLogs(prev => [newLogItem, ...prev]);
    customAlert(`Registrado correctamente: ${action.name} (${action.weightGrams}g) en ${action.mealType}`, 'success');
  };

  // Filter templates list based on search bar
  const filteredTemplates = PRESET_FOOD_TEMPLATES.filter(item => 
    item.name.toLowerCase().includes(searchPreset.toLowerCase()) ||
    item.category.toLowerCase().includes(searchPreset.toLowerCase())
  );

  // Group current day's logs
  const todaysLogs = foodLogs.filter(log => log.date === selectedDate);
  const todaysWaterMl = waterLogs[selectedDate] || 0;

  // Calculators
  const totals = todaysLogs.reduce((acc, curr) => {
    acc.calories += curr.calories;
    acc.protein += curr.protein;
    acc.carbs += curr.carbs;
    acc.fat += curr.fat;
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

  totals.protein = Math.round(totals.protein * 10) / 10;
  totals.carbs = Math.round(totals.carbs * 10) / 10;
  totals.fat = Math.round(totals.fat * 10) / 10;

  // Color classes helper based on core themes
  const getThemeTextClass = () => {
    if (accentColor === 'emerald') return 'text-emerald-400';
    if (accentColor === 'amber') return 'text-amber-400';
    if (accentColor === 'rose') return 'text-rose-400';
    return 'text-indigo-400';
  };

  const getThemeBgClass = () => {
    if (accentColor === 'emerald') return 'bg-emerald-600 hover:bg-emerald-500';
    if (accentColor === 'amber') return 'bg-amber-600 hover:bg-amber-500';
    if (accentColor === 'rose') return 'bg-rose-600 hover:bg-rose-500';
    return 'bg-indigo-600 hover:bg-indigo-500';
  };

  const getThemeBorderClass = () => {
    if (accentColor === 'emerald') return 'border-emerald-500/30 focus:border-emerald-500';
    if (accentColor === 'amber') return 'border-amber-500/30 focus:border-amber-500';
    if (accentColor === 'rose') return 'border-rose-500/30 focus:border-rose-500';
    return 'border-indigo-500/30 focus:border-indigo-500';
  };

  const getPercentageColor = (pct: number) => {
    if (pct < 85) return 'text-indigo-400';
    if (pct <= 105) return 'text-emerald-400';
    return 'text-rose-400';
  };

  // Smart Heuristic Recommendation Algorithm based on logged calories & macros
  const caloriesPct = goals.calories > 0 ? (totals.calories / goals.calories) * 100 : 0;
  const proteinPct = goals.protein > 0 ? (totals.protein / goals.protein) * 100 : 0;
  const carbsPct = goals.carbs > 0 ? (totals.carbs / goals.carbs) * 100 : 0;
  const fatPct = goals.fat > 0 ? (totals.fat / goals.fat) * 100 : 0;
  const waterPct = goals.waterLiters > 0 ? ((todaysWaterMl / 1000) / goals.waterLiters) * 100 : 0;

  // Generate Recommendation Details
  const getNutritionRecommendation = () => {
    const recs: string[] = [];
    const foodsTip: string[] = [];
    
    // Core weight delta target info
    const weightDiff = goals.targetWeightKg - goals.currentWeightKg;
    let weightAdvice = '';
    
    if (goals.presetName === 'bulking') {
      if (weightDiff > 0) {
        weightAdvice = `🎯 Te encuentras en fase activa de Volumen Limpio para aumentar masa magra de forma controlada. Tu prioridad es alcanzar tu peso objetivo de ${goals.targetWeightKg} kg (te faltan ${weightDiff.toFixed(1)} kg, peso actual: ${goals.currentWeightKg} kg). ¡Prioriza un superávit inteligente!`;
      } else {
        weightAdvice = `🎯 Te encuentras en fase de Volumen Limpio. Ya alcanzaste tu peso objetivo de volumen de ${goals.targetWeightKg} kg (actual: ${goals.currentWeightKg} kg). ¡Consolida y enfócate en ganar fuerza!`;
      }
    } else if (goals.presetName === 'definition') {
      const rest = goals.currentWeightKg - goals.targetWeightKg;
      if (rest > 0) {
        weightAdvice = `🔥 Te encuentras en fase de Definición con déficit calórico controlado para oxidar grasa y sostener músculo. Tu peso meta es de ${goals.targetWeightKg} kg (faltan ${rest.toFixed(1)} kg por reducir, actual: ${goals.currentWeightKg} kg).`;
      } else {
        weightAdvice = `🔥 Te encuentras en fase de Definición con un peso actual de ${goals.currentWeightKg} kg y un objetivo de ${goals.targetWeightKg} kg. ¡Mantén buenos hábitos de definición!`;
      }
    } else {
      weightAdvice = `⚡ Te encuentras en una fase excelente de Mantenimiento Saludable y recomposición corporal óptima para sostener tus ${goals.currentWeightKg} kg actuales de forma fuerte y saludable.`;
    }

    // Heuristics on proteins
    if (proteinPct < 85) {
      const remainingProtein = Math.max(0, goals.protein - totals.protein).toFixed(1);
      recs.push(`Estás abajo por ${remainingProtein}g de proteína. Esto es crucial para proteger tu masa muscular.`);
      foodsTip.push(`Para hoy, añade: 150g de pechuga de pollo, 4 claras de huevo o 1 scoop de Whey Protein.`);
    } else if (proteinPct > 115) {
      recs.push('Has completado y superado tu meta proteica diaria. ¡Excelente nivel de retención nitrogenada!');
    } else {
      recs.push('Tu nivel de ingesta proteica hoy es ideal y se encuentra bien balanceado.');
    }

    // Heuristics on fats
    if (fatPct > 105) {
      const excessFat = (totals.fat - goals.fat).toFixed(1);
      recs.push(`Has superado tu meta de grasas saludables por ${excessFat}g.`);
      foodsTip.push('Te sugerimos reducir fuentes densas por el resto del día, como manteca, aceites extra o frutos secos.');
    } else if (fatPct < 75) {
      recs.push('Llevas niveles bajos de grasa. La grasa saludable regula tu sistema hormonal.');
      foodsTip.push('Sugerencia: incorpora unas rebanadas de palta, 15g de nueces o una cucharita de mantequilla de maní.');
    }

    // Heuristics on carbs and calories matching the goal
    if (goals.presetName === 'bulking') {
      if (carbsPct < 80) {
        const remainingCarbs = Math.max(0, goals.carbs - totals.carbs).toFixed(1);
        recs.push(`Para un volumen limpio óptimo, necesitas sumar ${remainingCarbs}g de carbohidratos.`);
        foodsTip.push('Come fuentes limpias de energía constante: Arroz blanco/integral, avena o papas al horno.');
      }
    } else if (goals.presetName === 'definition') {
      if (caloriesPct > 100) {
        recs.push('Atención: Has superado tu límite de déficit calórico para definición hoy.');
        foodsTip.push('Saciate el resto del día con vegetales de hoja verde (alta fibra) y abundante agua para calmar la ansiedad.');
      } else if (caloriesPct < 85 && caloriesPct > 30) {
        recs.push('Buen déficit calórico sostenido para hoy, enfócate en mantener el ritmo regular.');
      }
    }

    // Hydration check
    if (waterPct < 80) {
      const remainingWater = Math.max(0, goals.waterLiters - (todaysWaterMl / 1000)).toFixed(1);
      recs.push(`Te falta registrar ${remainingWater}L de agua.`);
      foodsTip.push('Bebe 1 o 2 vasos de agua ahora para optimizar tu metabolismo basal y reponer nutrientes.');
    }

    const quickActions: RecommendedQuickAction[] = [];

    // Let's populate quickActions dynamically depending on current day's progress (totals) and goal preset
    if (goals.presetName === 'bulking') {
      // In bulking, if protein is low (< 95%) or generally we want to reach target
      if (proteinPct < 95) {
        quickActions.push({
          id: 'qa_p1',
          name: 'Pechuga de Pollo cocida',
          weightGrams: 150,
          mealType: 'Almuerzo',
          calories: Math.round(165 * 1.5),
          protein: Math.round(31 * 1.5),
          carbs: 0,
          fat: Math.round(3.6 * 1.5),
          reason: 'Aporte limpio de 46g de proteína de altísima calidad para incentivar la ganancia magra.'
        });
      }
      if (carbsPct < 90) {
        quickActions.push({
          id: 'qa_c1',
          name: 'Avena en hojuelas',
          weightGrams: 80,
          mealType: 'Desayuno',
          calories: Math.round(389 * 0.8),
          protein: Math.round(16.9 * 0.8),
          carbs: Math.round(66 * 0.8),
          fat: Math.round(6.9 * 0.8),
          reason: 'Aporte de glucógeno complejo y fibra soluble para energía prolongada.'
        });
        quickActions.push({
          id: 'qa_c2',
          name: 'Arroz Integral hervido',
          weightGrams: 150,
          mealType: 'Almuerzo',
          calories: Math.round(111 * 1.5),
          protein: Math.round(2.6 * 1.5),
          carbs: Math.round(23 * 1.5),
          fat: Math.round(0.9 * 1.5),
          reason: 'Combustible premium sostenido para entrenamientos pesados de hipertrofia.'
        });
      }
      // If fat is low
      if (fatPct < 85) {
        quickActions.push({
          id: 'qa_f1',
          name: 'Nueces peladas',
          weightGrams: 30,
          mealType: 'Colación',
          calories: Math.round(654 * 0.3),
          protein: Math.round(15 * 0.3),
          carbs: Math.round(14 * 0.3),
          fat: Math.round(65 * 0.3),
          reason: 'Grasas omega-3 e hipercaloría limpia para sostener el superávit.'
        });
      }
    } else if (goals.presetName === 'definition') {
      // In definition, we want ultra lean proteins & low carbs
      if (proteinPct < 95) {
        quickActions.push({
          id: 'qa_p2',
          name: 'Atún al agua escurrido',
          weightGrams: 120,
          mealType: 'Cena',
          calories: Math.round(116 * 1.2),
          protein: Math.round(26 * 1.2),
          carbs: 0,
          fat: Math.round(1 * 1.2),
          reason: 'Proteína pura magra (31g) con grasas mínimas para proteger tu músculo.'
        });
        quickActions.push({
          id: 'qa_p3',
          name: 'Clara de Huevo cocida',
          weightGrams: 150,
          mealType: 'Desayuno',
          calories: Math.round(52 * 1.5),
          protein: Math.round(11 * 1.5),
          carbs: Math.round(0.7 * 1.5),
          fat: Math.round(0.2 * 1.5),
          reason: 'Saciante proteico con densidad calórica bajísima para el control del apetito.'
        });
      }
      if (carbsPct < 85 && caloriesPct < 90) {
        quickActions.push({
          id: 'qa_c3',
          name: 'Manzana verde mediana (1 u ~150g)',
          weightGrams: 150,
          mealType: 'Colación',
          calories: 78,
          protein: 0.5,
          carbs: 20,
          fat: 0.3,
          reason: 'Carbohidratos de bajo índice glucémico y pectina para aplacar la ansiedad.'
        });
      }
    } else {
      // Maintenance and custom - balanced healthy options
      if (proteinPct < 90) {
        quickActions.push({
          id: 'qa_p4',
          name: 'Batido de Whey Protein (1 scoop ~30g)',
          weightGrams: 30,
          mealType: 'Merienda',
          calories: Math.round(390 * 0.3),
          protein: Math.round(80 * 0.3),
          carbs: Math.round(6 * 0.3),
          fat: Math.round(5 * 0.3),
          reason: 'Excelente recuperación proteica rápida post-entrenamiento o merienda veloz.'
        });
        quickActions.push({
          id: 'qa_p5',
          name: 'Huevo entero cocido (1 u ~50g)',
          weightGrams: 100,
          mealType: 'Desayuno',
          calories: 155,
          protein: 13,
          carbs: 1.1,
          fat: 11,
          reason: 'Aporte graso saludable excelente con alta colina y saciedad duradera.'
        });
      }
      if (carbsPct < 88) {
        quickActions.push({
          id: 'qa_c4',
          name: 'Banana mediana (1 u ~120g)',
          weightGrams: 120,
          mealType: 'Merienda',
          calories: 105,
          protein: 1.3,
          carbs: 27,
          fat: 0.4,
          reason: 'Carga de potasio y energía limpia instantánea previa al entrenamiento.'
        });
      }
    }

    // Water quick suggestion action
    if (waterPct < 95) {
      quickActions.push({
        id: 'qa_w1',
        name: 'Vaso de Agua Puro',
        weightGrams: 250, // will add water ml in hydration check
        mealType: 'Colación',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        reason: 'Suma 250ml de agua limpia para elevar tu hidratación celular y digestión.'
      });
    }

    if (quickActions.length === 0) {
      quickActions.push({
        id: 'qa_ok',
        name: 'Yogur Griego Natural',
        weightGrams: 125,
        mealType: 'Merienda',
        calories: 90,
        protein: 11,
        carbs: 4.5,
        fat: 2.5,
        reason: 'Gran snack probiótico ligero para consolidar un día excelente de nutrición.'
      });
    }

    return {
      weightAdvice,
      recs,
      foodsTip: foodsTip.length > 0 ? foodsTip : ['¡Sigue así, estás cumpliendo perfectamente tus registros hoy!'],
      quickActions
    };
  };

  const adviceObj = getNutritionRecommendation();

  // Helper template meal type grouping
  const mealTypes: FoodLogItem['mealType'][] = ['Desayuno', 'Almuerzo', 'Merienda', 'Cena', 'Colación'];

  return (
    <div className="space-y-6" id="nutrition-module">
      {/* Dynamic Sub-header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0a0f1d] border border-slate-800/60 p-4 rounded-2xl">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
            <Utensils className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Ingestas & Nutrición de Precisión</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Control inteligente por peso, macronutrientes y objetivos calóricos</p>
          </div>
        </div>

        {/* Date Selector Navigation */}
        <div className="flex items-center space-x-1 bg-[#0d1527] border border-slate-700/40 p-1 rounded-xl shadow-lg">
          <button 
            type="button" 
            onClick={() => {
              const parts = selectedDate.split('-');
              if (parts.length === 3) {
                const year = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1;
                const day = parseInt(parts[2], 10);
                const d = new Date(year, month, day);
                d.setDate(d.getDate() - 1);
                setSelectedDate(getLocalDateString(d));
              } else {
                const d = new Date(selectedDate);
                d.setDate(d.getDate() - 1);
                setSelectedDate(getLocalDateString(d));
              }
            }}
            className="text-xs text-slate-200 hover:text-white px-3 py-1.5 rounded-lg hover:bg-[#1a2942]/60 transition-all cursor-pointer font-extrabold"
          >
            Ayer
          </button>
          <span className={`text-[11px] font-mono font-black text-white px-3.5 py-1.5 rounded-lg shadow-md border ${
            accentColor === 'emerald' ? 'bg-emerald-600 border-emerald-500/30' :
            accentColor === 'amber' ? 'bg-amber-600 border-amber-500/30' :
            accentColor === 'rose' ? 'bg-rose-600 border-rose-500/30' :
            'bg-indigo-600 border-indigo-500/30'
          }`}>
            📆 {selectedDate === getLocalDateString() ? 'Hoy' : selectedDate}
          </span>
          <button 
            type="button" 
            onClick={() => {
              const parts = selectedDate.split('-');
              if (parts.length === 3) {
                const year = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1;
                const day = parseInt(parts[2], 10);
                const d = new Date(year, month, day);
                d.setDate(d.getDate() + 1);
                setSelectedDate(getLocalDateString(d));
              } else {
                const d = new Date(selectedDate);
                d.setDate(d.getDate() + 1);
                setSelectedDate(getLocalDateString(d));
              }
            }}
            className="text-xs text-slate-200 hover:text-white px-3 py-1.5 rounded-lg hover:bg-[#1a2942]/60 transition-all cursor-pointer font-extrabold"
          >
            Mañana
          </button>
        </div>
      </div>

      {/* Grid: 3 core visual sections - Progress Rings, Form Logger, Advice Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT COLUMN: Nutrition status & objectives (Span 4) */}
        <div className="lg:col-span-4 space-y-5 flex flex-col">
          
          {/* Card: Current Goal Summary & Stats */}
          <div className="bg-[#0b1323] border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden flex-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-indigo-400" />
                <h4 className="text-xs font-black uppercase text-white">Metas Actuales ({goals.presetName === 'bulking' ? 'Volumen Limpio' : goals.presetName === 'definition' ? 'Definición Fuerte' : goals.presetName === 'maintenance' ? 'Mantenimiento' : 'Persona.'})</h4>
              </div>
              <button 
                onClick={() => {
                  // Prepare editing fields
                  setGoalPreset(goals.presetName);
                  setGoalCalories(goals.calories);
                  setGoalProtein(goals.protein);
                  setGoalCarbs(goals.carbs);
                  setGoalFat(goals.fat);
                  setGoalWater(goals.waterLiters);
                  setGoalCurrentWeight(goals.currentWeightKg);
                  setGoalTargetWeight(goals.targetWeightKg);
                  setGoalHeight(goals.heightCm ?? 175);
                  setGoalAge(goals.ageYears ?? 25);
                  setGoalGender(goals.gender ?? 'male');
                  setGoalActivity(goals.activityLevel ?? 'moderate');
                  setIsEditingGoals(!isEditingGoals);
                }}
                className="text-[9.5px] font-extrabold uppercase text-indigo-400 bg-indigo-500/5 hover:bg-indigo-505/15 border border-indigo-500/20 px-2 py-1 rounded-lg transition-all cursor-pointer"
              >
                Configurar
              </button>
            </div>
  
            {isEditingGoals ? (
              /* Goals Form Editor Popup-style inline with professional calculator */
              <form onSubmit={handleSaveGoals} className="space-y-4 bg-[#0a0f1d] p-4.5 rounded-xl border border-slate-800 shadow-xl">
                
                {/* Section 1: Biometrics */}
                <div className="space-y-2.5">
                  <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider block border-l-2 border-indigo-500 pl-1.5 mb-1">
                    1. Datos Físicos y Biométricos
                  </span>
                  
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[9px] uppercase font-black text-slate-400 block mb-1">Género</label>
                      <select
                        value={goalGender}
                        onChange={(e) => updateGender(e.target.value as any)}
                        className="w-full bg-[#060a14] border border-slate-800/80 text-white rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      >
                        <option value="male">Masculino</option>
                        <option value="female">Femenino</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[9px] uppercase font-black text-slate-400 block mb-1">Edad (Años)</label>
                      <input 
                        type="number" 
                        min="1" 
                        max="120"
                        value={goalAge}
                        onChange={(e) => updateAge(parseInt(e.target.value) || 25)}
                        className="w-full bg-[#060a14] border border-slate-800/80 text-white rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] uppercase font-black text-slate-400 block mb-1">Altura (cm)</label>
                      <input 
                        type="number" 
                        min="50" 
                        max="250"
                        value={goalHeight}
                        onChange={(e) => updateHeight(parseInt(e.target.value) || 175)}
                        className="w-full bg-[#060a14] border border-slate-800/80 text-white rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] uppercase font-black text-slate-400 block mb-1">Peso Actual (kg)</label>
                      <input 
                        type="number" 
                        step="0.1"
                        value={goalCurrentWeight}
                        onChange={(e) => updateCurrentWeight(parseFloat(e.target.value) || 75)}
                        className="w-full bg-[#060a14] border border-slate-800/80 text-white rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] uppercase font-black text-slate-400 block mb-1">Actividad Física Diaria</label>
                    <select
                      value={goalActivity}
                      onChange={(e) => updateActivity(e.target.value as any)}
                      className="w-full bg-[#060a14] border border-slate-800/80 text-white rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="sedentary">Sedentario (Poco o ningún ejercicio)</option>
                      <option value="light">Ligera (Entrenamiento ligero 1-3 días/sem)</option>
                      <option value="moderate">Moderada (Entrenamiento fuerte 3-5 días/sem)</option>
                      <option value="active">Muy Activa (Doble turno o atletas de alto nivel)</option>
                    </select>
                  </div>
                </div>

                {/* Section 2: Strategy */}
                <div className="space-y-2.5 pt-1.5">
                  <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider block border-l-2 border-indigo-500 pl-1.5 mb-1">
                    2. Estrategia y Objetivos Mentales
                  </span>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[9px] uppercase font-black text-slate-400 block mb-1">Estrategia</label>
                      <select 
                        value={goalPreset}
                        onChange={(e) => updatePreset(e.target.value as any)}
                        className="w-full bg-[#060a14] border border-slate-800/80 text-white rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      >
                        <option value="maintenance">Mantenimiento Saludable</option>
                        <option value="bulking">Volumen Limpio (+ Superávit)</option>
                        <option value="definition">Déficit calórico (Definición)</option>
                        <option value="custom">Personalizado libre (Tus propias reglas)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[9px] uppercase font-black text-slate-400 block mb-1">Peso Objetivo (kg)</label>
                      <input 
                        type="number" 
                        step="0.1"
                        value={goalTargetWeight}
                        onChange={(e) => setGoalTargetWeight(parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#060a14] border border-slate-800/80 text-white rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Automation feedback alert banner */}
                <div className="p-3 bg-indigo-950/20 border border-indigo-500/15 rounded-xl">
                  <p className="text-[10.5px] text-slate-300 font-medium leading-relaxed">
                    ⚙️ <span className="text-indigo-300 font-bold">Mifflin-St Jeor Activo:</span> El plan de macros se calcula automáticamente según tus datos físicos actuales. Si deseas saltarte estas pautas y seguir tus propias reglas, edita libremente los valores nutricionales abajo y se guardarán en modo <span className="text-indigo-400 font-black">Personalizado</span>.
                  </p>
                </div>

                {/* Section 3: Calorie & Macro Target Overwrite Inputs */}
                <div className="space-y-2.5 pt-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider block border-l-2 border-indigo-500 pl-1.5">
                      3. Objetivos Nutricionales Diarios
                    </span>
                    {goalPreset === 'custom' ? (
                      <span className="text-[9px] font-black bg-purple-950 text-purple-300 border border-purple-500/10 px-2 py-0.5 rounded uppercase">Reglas Propias</span>
                    ) : (
                      <span className="text-[9px] font-black bg-emerald-950 text-emerald-300 border border-emerald-500/10 px-2 py-0.5 rounded uppercase">Calculado Auto</span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="text-[9px] uppercase font-black text-slate-400 block mb-1">Calorías (kcal)</label>
                      <input 
                        type="number" 
                        value={goalCalories}
                        onChange={(e) => handleManualCalorieEdit(parseInt(e.target.value) || 0)}
                        className="w-full bg-[#060a14] border border-slate-800/80 text-white rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] uppercase font-black text-slate-400 block mb-1">Proteínas (g)</label>
                      <input 
                        type="number" 
                        value={goalProtein}
                        onChange={(e) => handleManualProteinEdit(parseInt(e.target.value) || 0)}
                        className="w-full bg-[#060a14] border border-slate-800/80 text-white rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] uppercase font-black text-slate-400 block mb-1">Carbohidratos (g)</label>
                      <input 
                        type="number" 
                        value={goalCarbs}
                        onChange={(e) => handleManualCarbEdit(parseInt(e.target.value) || 0)}
                        className="w-full bg-[#060a14] border border-slate-800/80 text-white rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] uppercase font-black text-slate-400 block mb-1">Grasas (g)</label>
                      <input 
                        type="number" 
                        value={goalFat}
                        onChange={(e) => handleManualFatEdit(parseInt(e.target.value) || 0)}
                        className="w-full bg-[#060a14] border border-slate-800/80 text-white rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono font-bold"
                      />
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <label className="text-[9px] uppercase font-black text-slate-400 block mb-1">Agua (Litros)</label>
                      <input 
                        type="number" 
                        step="0.1"
                        value={goalWater}
                        onChange={(e) => handleManualWaterEdit(parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#060a14] border border-slate-800/80 text-white rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* Save and Cancel buttons */}
                <div className="flex space-x-2 pt-3 border-t border-slate-800/60">
                  <button 
                    type="submit"
                    className={`flex-1 text-[10.5px] font-black uppercase py-2.5 rounded-lg text-white shadow-lg shadow-indigo-650/10 cursor-pointer active:scale-[0.98] transition-all ${getThemeBgClass()}`}
                  >
                    Guardar Cambios
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsEditingGoals(false)}
                    className="text-[10.5px] bg-[#111625] hover:bg-[#182033] border border-slate-800/80 hover:border-slate-700 text-white px-4 py-2.5 rounded-lg font-bold transition-all cursor-pointer active:scale-95"
                  >
                    Cerrar
                  </button>
                </div>
              </form>
            ) : (
              /* Stat Metrics Rings & Progress Details */
              <div className="space-y-4">
                
                {/* Calories Block */}
                <div className="bg-[#0e1726]/40 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Calorías Totales</span>
                    <span className="text-xl font-black font-mono text-white mt-1 block">
                      {totals.calories} <span className="text-xs text-slate-400 font-medium font-sans">/ {goals.calories} kcal</span>
                    </span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">
                      {totals.calories > goals.calories 
                        ? `Superado por +${totals.calories - goals.calories} kcal` 
                        : `Quedan ${goals.calories - totals.calories} kcal por consumir`}
                    </span>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className={`text-base font-black font-mono ${getPercentageColor(caloriesPct)}`}>
                      {Math.round(caloriesPct)}%
                    </span>
                    {/* Tiny micro progress indicator */}
                    <div className="w-16 bg-slate-900 h-1 rounded-full mt-1.5 overflow-hidden">
                      <div 
                        className={`h-full ${accentColor === 'rose' ? 'bg-rose-500' : 'bg-indigo-500'}`}
                        style={{ width: `${Math.min(100, caloriesPct)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Macro Progression Bars */}
                <div className="space-y-2.5">
                  <span className="text-[9px] font-extrabold uppercase text-slate-400 block tracking-wider">Distribución de Macronutrientes</span>
                  
                  {/* Protein */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono font-bold">
                      <span className="text-indigo-300">🍗 Proteínas: {totals.protein}g</span>
                      <span className="text-slate-400">{goals.protein}g</span>
                    </div>
                    <div className="w-full bg-slate-900/80 h-2 rounded-lg overflow-hidden border border-slate-800/40 relative">
                      <div 
                        className="bg-indigo-500 h-full rounded-lg transition-all duration-300"
                        style={{ width: `${Math.min(100, proteinPct)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-400">
                      <span>Rendimiento del músculo</span>
                      <span>{Math.round(proteinPct)}% completado</span>
                    </div>
                  </div>

                  {/* Carbs */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono font-bold">
                      <span className="text-amber-400">🌾 Carbohidratos: {totals.carbs}g</span>
                      <span className="text-slate-400">{goals.carbs}g</span>
                    </div>
                    <div className="w-full bg-slate-900/80 h-2 rounded-lg overflow-hidden border border-slate-800/40 relative">
                      <div 
                        className="bg-amber-500 h-full rounded-lg transition-all duration-300"
                        style={{ width: `${Math.min(100, carbsPct)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-400">
                      <span>Energía muscular de precisión</span>
                      <span>{Math.round(carbsPct)}% completado</span>
                    </div>
                  </div>

                  {/* Fats */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono font-bold">
                      <span className="text-rose-400">🥑 Grasas Saludables: {totals.fat}g</span>
                      <span className="text-slate-400">{goals.fat}g</span>
                    </div>
                    <div className="w-full bg-slate-900/80 h-2 rounded-lg overflow-hidden border border-slate-800/40 relative">
                      <div 
                        className="bg-rose-500 h-full rounded-lg transition-all duration-300"
                        style={{ width: `${Math.min(100, fatPct)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-400">
                      <span>Soporte hormonal y articular</span>
                      <span>{Math.round(fatPct)}% completado</span>
                    </div>
                  </div>

                </div>

              </div>
            )}
          </div>

          {/* Card: Hydration Control Tracker (Water) */}
          <div className="bg-[#0b1323] border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <GlassWater className="w-4 h-4 text-blue-400" />
                <h4 className="text-xs font-black uppercase text-white">Control Hidratación Diaria</h4>
              </div>
              <span className="text-[9.5px] font-extrabold uppercase font-mono text-blue-400 tracking-wider bg-blue-500/5 border border-blue-500/20 px-2 py-0.5 rounded">
                Meta: {goals.waterLiters}L
              </span>
            </div>

            <div className="text-center py-2 flex flex-col items-center">
              <span className="text-3xl font-black font-mono text-white tracking-tight">
                {(todaysWaterMl / 1000).toFixed(2)} <span className="text-xs text-slate-400 font-sans font-medium">Liters</span>
              </span>
              
              {/* Dynamic Animated beaker simulation container */}
              <div className="w-full bg-[#0a0e1c] h-5 rounded-xl border border-slate-800/80 mt-3 p-0.5 overflow-hidden relative">
                <div 
                  className="bg-blue-600/60 h-full rounded-lg transition-all duration-500 flex items-center justify-center"
                  style={{ width: `${Math.min(100, (todaysWaterMl / 1000) / goals.waterLiters * 100)}%` }}
                />
              </div>

              {/* Water Controls */}
              <div className="grid grid-cols-3 gap-2 mt-4 w-full">
                <button
                  type="button"
                  onClick={() => handleWaterAdd(250)}
                  className="text-[10.5px] font-black py-2 bg-[#121c30] border border-slate-700/60 hover:border-blue-500/60 hover:bg-slate-900 text-white rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1 shadow-sm active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5 text-blue-300 stroke-[3]" />
                  <span className="text-white font-extrabold">+250 ml</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleWaterAdd(500)}
                  className="text-[10.5px] font-black py-2 bg-[#121c30] border border-slate-700/60 hover:border-blue-500/60 hover:bg-slate-900 text-white rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1 shadow-sm active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5 text-blue-300 stroke-[3]" />
                  <span className="text-white font-extrabold">+500 ml</span>
                </button>

                <button
                  type="button"
                  onClick={handleWaterReset}
                  className="text-[10px] font-bold py-2 bg-slate-950/60 hover:bg-slate-900 border border-slate-800/60 hover:border-rose-900/30 text-rose-400 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1"
                >
                  <RefreshCw className="w-2.5 h-2.5 text-rose-400" />
                  <span>Vaciar</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE COLUMN: Food Logger & Preset Food Lists (Span 5) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Card: Register food interactive manager */}
          <div className="bg-[#0b1323] border border-slate-800/80 rounded-2xl p-5" id="nutrition-food-entry-box">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <Scale className="w-4 h-4 text-amber-500" />
                <h4 className="text-xs font-black uppercase text-white">Balanza de Porción & Registro</h4>
              </div>
              <span className="text-[10.5px] font-extrabold uppercase font-mono text-emerald-400 tracking-wider">Regula tu peso</span>
            </div>

            {/* Quick Preset Selector tool */}
            <div className="mb-4 bg-[#0a0e1a] p-3 rounded-xl border border-slate-800/60">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-indigo-400 font-extrabold uppercase block tracking-wider">Mis Alimentos Preconfigurados</span>
                <span className="text-[9px] text-slate-500">{PRESET_FOOD_TEMPLATES.length} disponibles</span>
              </div>
              <input 
                type="text" 
                value={searchPreset}
                onChange={(e) => setSearchPreset(e.target.value)}
                placeholder="Buscar (ej: Pollo, Arroz, Avena, Manzana)..."
                className="w-full bg-[#070b14] border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none mb-2 font-medium"
              />
              <div className="max-h-24 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800/50 space-y-1 pr-1" id="presets-list">
                {filteredTemplates.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectTemplate(item.id)}
                    className={`w-full text-left p-1.5 rounded text-[11px] font-bold transition-all cursor-pointer flex items-center justify-between ${
                      selectedTemplateId === item.id 
                        ? 'bg-indigo-950/40 border-l-2 border-indigo-500 text-white' 
                        : 'bg-[#0e1726]/30 hover:bg-slate-900 border-l border-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <span>{item.name}</span>
                    <span className="text-[9.5px] font-mono text-slate-400">
                      ({item.caloriesPer100g} kcal/100g)
                    </span>
                  </button>
                ))}
                {filteredTemplates.length === 0 && (
                  <p className="text-[10px] text-slate-500 py-1 text-center font-medium">Ningún alimento coincide con tu filtro.</p>
                )}
              </div>
            </div>

            {/* Main Log Food Form */}
            <form onSubmit={handleLoggedFoodSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold block mb-1">Nombre del Alimento</label>
                  <input 
                    type="text"
                    required
                    value={foodName}
                    onChange={(e) => {
                      setFoodName(e.target.value);
                      setSelectedTemplateId(''); // reset selection if customized name
                    }}
                    placeholder="Ej: Plato de fideos magro, etc."
                    className="w-full bg-[#070c18] border border-slate-800 text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-bold"
                  />
                </div>

                <div>
                  <label className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold block mb-1 font-mono">Momento de Ingesta</label>
                  <select 
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value as any)}
                    className="w-full bg-[#070c18] border border-slate-800 text-slate-200 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-bold"
                  >
                    <option value="Desayuno">Desayuno</option>
                    <option value="Almuerzo">Almuerzo</option>
                    <option value="Merienda">Merienda</option>
                    <option value="Cena">Cena</option>
                    <option value="Colación">Colación</option>
                  </select>
                </div>

                <div>
                  <label className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold block mb-1">Peso Consumido (g)</label>
                  <input 
                    type="number"
                    required
                    min="1"
                    step="1"
                    value={weightGrams}
                    onChange={(e) => setWeightGrams(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full bg-[#070c18] border border-slate-800 text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-bold"
                  />
                </div>
              </div>

              {/* Advanced Nutrients fields collapsing setup */}
              <div className="border border-slate-800/40 rounded-xl p-3 bg-slate-950/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9.5px] uppercase font-bold tracking-wider text-indigo-400">Composición Nutricional (por 100g)</span>
                  <span className="text-[8px] uppercase tracking-widest text-[#8e9cb3] font-mono px-1.5 py-0.2 rounded border border-slate-800">Calibrable</span>
                </div>
                
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="text-[8px] uppercase text-slate-400 font-bold block mb-0.5">Kcal</label>
                    <input 
                      type="number" 
                      min="0"
                      value={calPer100}
                      onChange={(e) => setCalPer100(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full bg-[#070c18] border border-slate-800/50 text-slate-100 rounded-lg p-1.5 text-[11px] text-center font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] uppercase text-emerald-400 font-bold block mb-0.5">Pro (g)</label>
                    <input 
                      type="number" 
                      min="0"
                      step="0.1"
                      value={protPer100}
                      onChange={(e) => setProtPer100(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full bg-[#070c18] border border-slate-800/50 text-slate-100 rounded-lg p-1.5 text-[11px] text-center font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] uppercase text-amber-400 font-bold block mb-0.5">Car (g)</label>
                    <input 
                      type="number" 
                      min="0"
                      step="0.1"
                      value={carbPer100}
                      onChange={(e) => setCarbPer100(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full bg-[#070c18] border border-slate-800/50 text-slate-100 rounded-lg p-1.5 text-[11px] text-center font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] uppercase text-rose-400 font-bold block mb-0.5">Gra (g)</label>
                    <input 
                      type="number" 
                      min="0"
                      step="0.1"
                      value={fatPer100}
                      onChange={(e) => setFatPer100(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full bg-[#070c18] border border-slate-800/50 text-slate-100 rounded-lg p-1.5 text-[11px] text-center font-mono focus:outline-none"
                    />
                  </div>
                </div>
                
                {/* Dynamically calculated output previews so the user knows calculations are accurate before submit */}
                <div className="flex items-center justify-between border-t border-slate-800/40 mt-2.5 pt-2 text-[10px] text-slate-400 font-bold">
                  <span>Equivalente para {weightGrams}g:</span>
                  <span className="text-[#8e9cb3] font-mono">
                    {Math.round(calPer100 * (weightGrams / 100))} Kcal • {Math.round(protPer100 * (weightGrams / 100))}g PRO • {Math.round(carbPer100 * (weightGrams / 100))}g CAR • {Math.round(fatPer100 * (weightGrams / 100))}g GRA
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className={`w-full font-black uppercase tracking-wider text-[10px] py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-2 border shadow-lg text-white ${getThemeBgClass()}`}
              >
                <span>Registrar Alimento</span>
                <PlusCircle className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Quick tips dynamic card */}
          <div className="bg-[#0b1323] border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center space-x-2.5 mb-2 border-b border-slate-800/60 pb-2">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              <span className="text-xs font-black uppercase text-white tracking-wide">Fórmulas de Rendimiento {goals.presetName === 'bulking' ? 'Volumen' : 'Definición'}</span>
            </div>
            <p className="text-[11.5px] text-slate-300 leading-relaxed font-bold">
              {goals.presetName === 'bulking' 
                ? 'Consejo: Recuerda comer carbohidratos complejos de 1 a 2 horas antes de tu sesión en el gimnasio para maximizar tus depósitos de glucógeno muscular y tener más fuerza.' 
                : goals.presetName === 'definition'
                ? 'Consejo: Maximiza tu ingesta de fibra pre-comida y prioriza proteínas sólidas (pechuga, pescados) que incrementan el efecto térmico y te mantienen lleno por más horas.'
                : 'Consejo: Consume un balance 40/30/30 en tus comidas regulares para optimizar tu recomposición y permitir una reparación celular excelente.'}
            </p>
          </div>

        </div>

        {/* RIGHT COLUMN: Daily Registries & Intelligent Recommendations (Span 3) */}
        <div className="lg:col-span-3 space-y-5">
          
          {/* Card: Registries of the Day breakdown */}
          <div className="bg-[#0b1323] border border-slate-800/80 rounded-2xl p-5 flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <Coffee className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-black uppercase text-white">Diario de Comidas ({todaysLogs.length})</h4>
              </div>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/10 px-1.5 py-0.5 rounded font-black font-mono">
                {totals.calories} Kcal
              </span>
            </div>

            <div className="space-y-4 max-h-[290px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800/50 pr-1 flex-1" id="comidas-diarias-list">
              {mealTypes.map((type) => {
                const groupItems = todaysLogs.filter(item => item.mealType === type);
                if (groupItems.length === 0) return null;
                return (
                  <div key={type} className="border-b border-slate-800/40 pb-2.5 last:border-0 last:pb-0">
                    <span className="text-[9px] font-black uppercase tracking-wider text-indigo-400 block mb-1.5">{type}</span>
                    <div className="space-y-1.5">
                      {groupItems.map((item) => (
                        <div 
                          key={item.id} 
                          className="flex items-center justify-between text-xs bg-[#0a0e1c] p-2 rounded-xl border border-slate-800/65 group hover:border-indigo-500/20 transition-all"
                        >
                          <div className="text-left max-w-[70%]">
                            <span className="text-white font-extrabold block text-[11px] truncate">{item.name}</span>
                            <span className="text-[9.5px] text-slate-300 font-semibold block font-mono">
                              {item.weightGrams}g • {item.calories} Kcal (P:{item.protein}g)
                            </span>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => handleDeleteLogItem(item.id, item.name)}
                            className="p-1.5 bg-[#170e11] border border-rose-955/20 text-rose-500 hover:text-rose-450 hover:bg-[#251015]/90 hover:border-rose-500/30 rounded-lg transition-all cursor-pointer shadow-sm active:scale-95"
                            title="Eliminar comida"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {todaysLogs.length === 0 && (
                <div className="text-center py-10 flex flex-col items-center justify-center">
                  <Apple className="w-8 h-8 text-slate-600 mb-2.5 stroke-[1.5]" />
                  <p className="text-xs text-slate-450 font-bold">Sin comidas registradas</p>
                  <p className="text-[10px] text-slate-500 mt-1">Busca un alimento preconfigurado o introduce uno personalizado a la izquierda.</p>
                </div>
              )}
            </div>
            
            {todaysLogs.length > 0 && (
              <div className="border-t border-slate-800 pt-3 mt-4 flex justify-between text-[11px] font-bold text-slate-400">
                <span>Acumulado:</span>
                <span className="font-mono text-white">P:{totals.protein}g C:{totals.carbs}g G:{totals.fat}g</span>
              </div>
            )}
          </div>

          {/* Card: Intelligent recommendations of optimized nutrition */}
          <div className="bg-gradient-to-br from-[#0c142c] to-[#080d1a] border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center space-x-2 border-b border-indigo-500/10 pb-3 mb-3.5">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
              <h4 className="text-xs font-black uppercase text-white">Recomendaciones del Asesor</h4>
            </div>

            <div className="space-y-3">
              {/* Objective text info */}
              <div className={`border rounded-xl p-3.5 flex items-start space-x-2.5 shadow-md ${
                goals.presetName === 'bulking' ? 'bg-amber-500/10 border-amber-500/20 text-amber-200' :
                goals.presetName === 'definition' ? 'bg-rose-500/10 border-rose-500/20 text-rose-200' :
                'bg-emerald-500/15 border-emerald-500/25 text-emerald-200'
              }`}>
                <Activity className={`w-4 h-4 shrink-0 mt-0.5 ${
                  goals.presetName === 'bulking' ? 'text-amber-400' :
                  goals.presetName === 'definition' ? 'text-rose-400' :
                  'text-emerald-400'
                }`} />
                <p className="text-xs font-bold leading-relaxed text-white">
                  {adviceObj.weightAdvice}
                </p>
              </div>

              {/* Specific logs analysis */}
              <div className="space-y-2">
                <span className="text-[9.5px] uppercase font-black text-slate-400 block tracking-wider">Plan de Acción Hoy:</span>
                
                {adviceObj.recs.map((rec, i) => (
                  <div key={i} className="flex space-x-1.5 items-start">
                    <span className="text-indigo-400 text-xs shrink-0 font-bold">•</span>
                    <p className="text-[10.5px] text-slate-300 leading-normal font-medium">{rec}</p>
                  </div>
                ))}

                {adviceObj.recs.length === 0 && (
                  <div className="flex space-x-1.5 items-start">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <p className="text-[10.5px] text-emerald-300 leading-normal font-bold">Tus macronutrientes coinciden perfectamente en el rango de tolerancia hoy.</p>
                  </div>
                )}
              </div>

              {/* Actionable food options suggestions with interactive dynamic quick buttons */}
              <div className="border-t border-slate-800/60 pt-3 mt-2 bg-[#060a14] p-3 rounded-xl border border-slate-800/80">
                <span className="text-[10px] uppercase font-black text-amber-400 tracking-wider block mb-2">Opciones Rápidas Recomendadas para Hoy:</span>
                
                <div className="space-y-2">
                  {adviceObj.quickActions.map((action) => (
                    <div 
                      key={action.id} 
                      className="group flex flex-col sm:flex-row sm:items-center justify-between p-2.5 bg-[#0b1021] border border-slate-800 hover:border-indigo-500/30 rounded-lg transition-all"
                    >
                      <div className="mb-2 sm:mb-0">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[11px] font-extrabold text-white">
                            {action.name} {action.weightGrams > 0 ? `(${action.weightGrams}g)` : ''}
                          </span>
                          <span className="text-[9px] font-black uppercase tracking-wider bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-indigo-400">
                            {action.mealType}
                          </span>
                        </div>
                        <p className="text-[10.5px] text-slate-300 font-semibold mt-0.5 leading-snug">
                          {action.reason}
                        </p>
                        {action.calories > 0 && (
                          <div className="text-[9px] font-mono text-slate-550 mt-0.5 font-bold">
                            {action.calories} Kcal • P:{action.protein}g C:{action.carbs}g G:{action.fat}g
                          </div>
                        )}
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => handleQuickActionClick(action)}
                        className={`py-1 px-2.5 text-white font-extrabold text-[10px] rounded-md transition-all flex items-center space-x-1 self-end sm:self-auto shadow cursor-pointer active:scale-95 shrink-0 ${getThemeBgClass()}`}
                      >
                        <Plus className="w-3 h-3" />
                        <span>Añadir</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
