import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Utensils, Plus, TrendingUp, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NavBar } from '../components/NavBar';

interface NutritionLog {
  id: string;
  meal_type: string;
  food_items: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  logged_at: string;
}

interface CommonFood {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const COMMON_FOODS: CommonFood[] = [
  { name: 'Apple', calories: 95, protein: 0.5, carbs: 25, fat: 0.3 },
  { name: 'Banana', calories: 105, protein: 1.3, carbs: 27, fat: 0.3 },
  { name: 'Chicken Breast (100g)', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { name: 'Rice (1 cup cooked)', calories: 206, protein: 4.3, carbs: 45, fat: 0.2 },
  { name: 'Egg', calories: 72, protein: 6.3, carbs: 0.6, fat: 5.3 },
  { name: 'Broccoli (100g)', calories: 34, protein: 2.8, carbs: 7, fat: 0.4 },
  { name: 'Salmon (100g)', calories: 206, protein: 20, carbs: 0, fat: 13 },
  { name: 'Almonds (1oz)', calories: 164, protein: 6, carbs: 6, fat: 14 },
  { name: 'Yogurt (1 cup)', calories: 100, protein: 10, carbs: 7, fat: 2 },
  { name: 'Bread (1 slice)', calories: 80, protein: 4, carbs: 14, fat: 1 },
];

export function NutritionPage() {
  const { session } = useAuth();
  const [logs, setLogs] = useState<NutritionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeal, setSelectedMeal] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [selectedFoods, setSelectedFoods] = useState<CommonFood[]>([]);
  const [showFoodSelector, setShowFoodSelector] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (session?.user.id) {
      loadTodaysNutrition(session.user.id);
    }
  }, [session?.user.id]);

  const loadTodaysNutrition = async (userId: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('nutrition_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('logged_at', today)
        .order('logged_at', { ascending: false });

      setLogs(data || []);
    } catch (error) {
      console.error('Error loading nutrition logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const addFood = (food: CommonFood) => {
    setSelectedFoods([...selectedFoods, food]);
  };

  const removeFood = (index: number) => {
    setSelectedFoods(selectedFoods.filter((_, i) => i !== index));
  };

  const saveMeal = async () => {
    if (!session?.user.id || selectedFoods.length === 0) return;

    const totals = selectedFoods.reduce(
      (acc, food) => ({
        calories: acc.calories + food.calories,
        protein: acc.protein + food.protein,
        carbs: acc.carbs + food.carbs,
        fat: acc.fat + food.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    try {
      const { error } = await supabase.from('nutrition_logs').insert({
        user_id: session.user.id,
        meal_type: selectedMeal,
        food_items: selectedFoods.map(f => f.name),
        ...totals,
      });

      if (error) throw error;
      setSelectedFoods([]);
      setShowFoodSelector(false);
      if (session?.user.id) {
        loadTodaysNutrition(session.user.id);
      }
    } catch (error) {
      console.error('Error saving meal:', error);
    }
  };

  const calculateTotals = (mealType: string) => {
    return logs
      .filter(log => log.meal_type === mealType)
      .reduce(
        (acc, log) => ({
          calories: acc.calories + log.calories,
          protein: acc.protein + log.protein,
          carbs: acc.carbs + log.carbs,
          fat: acc.fat + log.fat,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );
  };

  const dailyTotals = {
    calories: logs.reduce((sum, log) => sum + log.calories, 0),
    protein: logs.reduce((sum, log) => sum + log.protein, 0),
    carbs: logs.reduce((sum, log) => sum + log.carbs, 0),
    fat: logs.reduce((sum, log) => sum + log.fat, 0),
  };

  const selectedFoodsTotals = selectedFoods.reduce(
    (acc, food) => ({
      calories: acc.calories + food.calories,
      protein: acc.protein + food.protein,
      carbs: acc.carbs + food.carbs,
      fat: acc.fat + food.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="h-16 bg-white border-b border-gray-100 shadow-sm"></div>
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="h-10 w-64 bg-gray-200 animate-pulse rounded-lg mb-4"></div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 bg-white rounded-xl animate-pulse shadow-sm"></div>
            ))}
          </div>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-white rounded-xl animate-pulse shadow-sm mb-4"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Nutrition Tracker</h1>
            <p className="text-gray-500 mt-2">Track your daily meals and nutrition</p>
          </div>
          <button
            onClick={() => navigate('/health-tracking')}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Health Metrics
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <NutritionBox title="Calories" value={dailyTotals.calories} unit="kcal" target={2000} color="orange" />
              <NutritionBox title="Protein" value={Math.round(dailyTotals.protein)} unit="g" target={50} color="red" />
              <NutritionBox title="Carbs" value={Math.round(dailyTotals.carbs)} unit="g" target={250} color="green" />
              <NutritionBox title="Fat" value={Math.round(dailyTotals.fat)} unit="g" target={65} color="yellow" />
            </div>

            <div className="space-y-4">
              {['breakfast', 'lunch', 'dinner', 'snack'].map(mealType => {
                const mealLogs = logs.filter(log => log.meal_type === mealType);
                const mealTotals = calculateTotals(mealType);

                return (
                  <div key={mealType} className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-gray-800 capitalize">{mealType}</h3>
                      <div className="text-sm text-gray-600">
                        {mealTotals.calories} kcal
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      {mealLogs.map(log => (
                        <div
                          key={log.id}
                          className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {log.food_items.join(', ')}
                            </p>
                            <p className="text-xs text-gray-500">
                              {log.protein}g protein • {log.carbs}g carbs • {log.fat}g fat
                            </p>
                          </div>
                          <p className="font-semibold text-gray-800">{log.calories} kcal</p>
                        </div>
                      ))}
                    </div>

                    {selectedMeal === mealType && selectedFoods.length > 0 && (
                      <div className="space-y-2 mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm font-semibold text-blue-900">Adding to {mealType}:</p>
                        {selectedFoods.map((food, idx) => (
                          <div key={idx} className="flex justify-between items-center">
                            <span className="text-sm text-blue-700">{food.name}</span>
                            <button
                              onClick={() => removeFood(idx)}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                        <div className="text-sm font-semibold text-blue-900 pt-2 border-t border-blue-200">
                          Total: {selectedFoodsTotals.calories} kcal
                        </div>
                      </div>
                    )}

                    {selectedMeal === mealType ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowFoodSelector(!showFoodSelector)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Add Food
                        </button>
                        {selectedFoods.length > 0 && (
                          <button
                            onClick={saveMeal}
                            className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                          >
                            Save Meal
                          </button>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedMeal(mealType as any);
                          setShowFoodSelector(true);
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Log Meal
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {showFoodSelector && (
            <div className="bg-white rounded-xl shadow-lg p-6 h-fit sticky top-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Common Foods</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {COMMON_FOODS.map(food => (
                  <button
                    key={food.name}
                    onClick={() => addFood(food)}
                    className="w-full text-left p-3 hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-all"
                  >
                    <div className="font-medium text-gray-800 text-sm">{food.name}</div>
                    <div className="text-xs text-gray-600">{food.calories} kcal</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface NutritionBoxProps {
  title: string;
  value: number;
  unit: string;
  target: number;
  color: string;
}

function NutritionBox({ title, value, unit, target, color }: NutritionBoxProps) {
  const progress = Math.min((value / target) * 100, 100);
  const colorClasses = {
    orange: 'from-orange-100 to-orange-50 border-orange-200',
    red: 'from-red-100 to-red-50 border-red-200',
    green: 'from-green-100 to-green-50 border-green-200',
    yellow: 'from-yellow-100 to-yellow-50 border-yellow-200',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} border rounded-lg p-4`}>
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-gray-800">{title}</h4>
        <span className="text-xs bg-white bg-opacity-60 px-2 py-1 rounded">{Math.round(progress)}%</span>
      </div>
      <div className="text-2xl font-bold text-gray-800 mb-2">
        {value}
        <span className="text-sm ml-1 text-gray-600">{unit}</span>
      </div>
      <div className="w-full bg-white bg-opacity-40 rounded-full h-2">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-green-400 transition-all"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-xs text-gray-600 mt-2">Goal: {target} {unit}</p>
    </div>
  );
}
