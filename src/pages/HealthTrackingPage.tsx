import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { NavBar } from '../components/NavBar';
import {
  Activity, Heart, Moon, Droplets, Flame, TrendingUp, Award,
  Plus, Minus, CheckCircle, AlertCircle, Info,
} from 'lucide-react';

interface DailyMetrics {
  steps: number;
  heart_rate: number;
  sleep_hours: number;
  calories_burned: number;
  water_intake: number;
  exercise_minutes: number;
  mood: string;
}

const GOALS: Record<keyof Omit<DailyMetrics, 'mood'>, number> = {
  steps: 8000,
  heart_rate: 80,
  sleep_hours: 8,
  calories_burned: 500,
  water_intake: 2000,
  exercise_minutes: 30,
};

const MOOD_OPTIONS = [
  { value: 'bad', label: 'Bad', emoji: '😢', color: 'bg-red-100 text-red-700 border-red-200' },
  { value: 'ok', label: 'Okay', emoji: '😐', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { value: 'good', label: 'Good', emoji: '😊', color: 'bg-green-100 text-green-700 border-green-200' },
  { value: 'great', label: 'Great', emoji: '😄', color: 'bg-blue-100 text-blue-700 border-blue-200' },
];

interface MetricConfig {
  key: keyof Omit<DailyMetrics, 'mood'>;
  label: string;
  icon: React.ElementType;
  unit: string;
  color: string;
  bgColor: string;
  step: number;
  max: number;
  normalRange?: string;
  tip?: string;
}

const METRIC_CONFIGS: MetricConfig[] = [
  {
    key: 'steps',
    label: 'Steps',
    icon: Activity,
    unit: 'steps',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    step: 500,
    max: 30000,
    tip: 'Walking 8,000+ steps daily reduces risk of heart disease by 50%.',
  },
  {
    key: 'heart_rate',
    label: 'Heart Rate',
    icon: Heart,
    unit: 'bpm',
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    step: 1,
    max: 220,
    normalRange: '60–100 bpm',
    tip: 'A resting heart rate below 60 may indicate good fitness. Above 100 at rest needs evaluation.',
  },
  {
    key: 'sleep_hours',
    label: 'Sleep',
    icon: Moon,
    unit: 'hrs',
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-50',
    step: 0.5,
    max: 24,
    normalRange: '7–9 hours',
    tip: 'Adults need 7–9 hours of sleep per night for optimal health.',
  },
  {
    key: 'water_intake',
    label: 'Water Intake',
    icon: Droplets,
    unit: 'ml',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    step: 250,
    max: 5000,
    normalRange: '2000–3000 ml',
    tip: 'Drink at least 2 liters daily. More if you exercise or it\'s hot.',
  },
  {
    key: 'calories_burned',
    label: 'Calories Burned',
    icon: Flame,
    unit: 'kcal',
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    step: 50,
    max: 3000,
    tip: 'Burning 500+ kcal/day through exercise supports healthy weight management.',
  },
  {
    key: 'exercise_minutes',
    label: 'Exercise',
    icon: TrendingUp,
    unit: 'min',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    step: 5,
    max: 300,
    normalRange: '30–60 min/day',
    tip: 'WHO recommends 150 minutes of moderate exercise per week.',
  },
];

function getHealthScore(metrics: DailyMetrics): number {
  let score = 0;
  if (metrics.steps >= GOALS.steps) score += 20; else score += (metrics.steps / GOALS.steps) * 20;
  if (metrics.sleep_hours >= 7 && metrics.sleep_hours <= 9) score += 20;
  else if (metrics.sleep_hours > 0) score += Math.max(0, (1 - Math.abs(metrics.sleep_hours - 8) / 8)) * 20;
  if (metrics.water_intake >= GOALS.water_intake) score += 20; else score += (metrics.water_intake / GOALS.water_intake) * 20;
  if (metrics.exercise_minutes >= GOALS.exercise_minutes) score += 20; else score += (metrics.exercise_minutes / GOALS.exercise_minutes) * 20;
  if (metrics.heart_rate >= 60 && metrics.heart_rate <= 100) score += 20;
  else if (metrics.heart_rate === 0) score += 10;
  return Math.round(Math.min(score, 100));
}

function getScoreLabel(score: number) {
  if (score >= 85) return { label: 'Excellent', color: 'text-green-600' };
  if (score >= 70) return { label: 'Good', color: 'text-blue-600' };
  if (score >= 50) return { label: 'Fair', color: 'text-yellow-600' };
  return { label: 'Needs Work', color: 'text-red-500' };
}

function getProgressColor(pct: number) {
  if (pct >= 100) return 'bg-green-500';
  if (pct >= 60) return 'bg-blue-500';
  if (pct >= 30) return 'bg-yellow-500';
  return 'bg-red-400';
}

function getHeartRateStatus(bpm: number) {
  if (bpm === 0) return null;
  if (bpm < 60) return { label: 'Bradycardia', color: 'text-yellow-600', bg: 'bg-yellow-50' };
  if (bpm <= 100) return { label: 'Normal', color: 'text-green-600', bg: 'bg-green-50' };
  if (bpm <= 120) return { label: 'Elevated', color: 'text-orange-600', bg: 'bg-orange-50' };
  return { label: 'High', color: 'text-red-600', bg: 'bg-red-50' };
}

interface MetricCardProps {
  config: MetricConfig;
  value: number;
  onUpdate: (val: number) => void;
  saving: boolean;
}

function MetricCard({ config, value, onUpdate, saving }: MetricCardProps) {
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState('');
  const [showTip, setShowTip] = useState(false);

  const goal = GOALS[config.key];
  const pct = goal ? Math.min(Math.round((value / goal) * 100), 100) : 0;
  const progressColor = getProgressColor(pct);
  const hrStatus = config.key === 'heart_rate' ? getHeartRateStatus(value) : null;

  const handleSave = () => {
    const num = parseFloat(input);
    if (!isNaN(num) && num >= 0) onUpdate(Math.min(num, config.max));
    setEditing(false);
  };

  const handleIncrement = () => onUpdate(Math.min(value + config.step, config.max));
  const handleDecrement = () => onUpdate(Math.max(value - config.step, 0));

  return (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${config.bgColor} flex items-center justify-center`}>
            <config.icon className={`w-5 h-5 ${config.color}`} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-sm">{config.label}</h3>
            {config.normalRange && (
              <p className="text-xs text-gray-400">Normal: {config.normalRange}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {hrStatus && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${hrStatus.color} ${hrStatus.bg}`}>
              {hrStatus.label}
            </span>
          )}
          {config.tip && (
            <button
              onClick={() => setShowTip(!showTip)}
              className="p-1 text-gray-400 hover:text-blue-500 rounded-lg"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {showTip && (
        <div className="mb-3 text-xs text-blue-700 bg-blue-50 rounded-xl px-3 py-2 border border-blue-100">
          {config.tip}
        </div>
      )}

      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={handleDecrement}
          disabled={saving || value <= 0}
          className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 disabled:opacity-40 flex-shrink-0"
        >
          <Minus className="w-3.5 h-3.5 text-gray-600" />
        </button>

        {editing ? (
          <div className="flex-1 flex gap-1">
            <input
              type="number"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setEditing(false); }}
              autoFocus
              className="flex-1 px-3 py-1.5 border border-blue-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
              min={0}
              max={config.max}
            />
            <button
              onClick={handleSave}
              className="px-3 py-1.5 bg-blue-500 text-white rounded-xl text-sm hover:bg-blue-600"
            >
              OK
            </button>
          </div>
        ) : (
          <button
            onClick={() => { setInput(value.toString()); setEditing(true); }}
            className="flex-1 text-center group"
          >
            <span className="text-2xl font-bold text-gray-800 group-hover:text-blue-600">
              {config.key === 'sleep_hours' ? value.toFixed(1) : value.toLocaleString()}
            </span>
            <span className="text-xs text-gray-500 ml-1">{config.unit}</span>
          </button>
        )}

        <button
          onClick={handleIncrement}
          disabled={saving || value >= config.max}
          className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 disabled:opacity-40 flex-shrink-0"
        >
          <Plus className="w-3.5 h-3.5 text-gray-600" />
        </button>
      </div>

      {goal && config.key !== 'heart_rate' && (
        <div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1">
            <div
              className={`h-1.5 rounded-full ${progressColor} transition-all duration-500`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>{pct}% of goal</span>
            <span>Goal: {goal.toLocaleString()} {config.unit}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function getHealthInsights(metrics: DailyMetrics): { type: 'good' | 'warn' | 'info'; text: string }[] {
  const insights: { type: 'good' | 'warn' | 'info'; text: string }[] = [];

  if (metrics.steps >= 10000) insights.push({ type: 'good', text: 'Outstanding step count! You\'ve surpassed 10,000 steps.' });
  else if (metrics.steps >= 8000) insights.push({ type: 'good', text: 'Great job hitting your step goal!' });
  else if (metrics.steps > 0 && metrics.steps < 5000) insights.push({ type: 'warn', text: `You're ${(8000 - metrics.steps).toLocaleString()} steps short of your goal. Try a short walk!` });

  if (metrics.heart_rate > 0) {
    if (metrics.heart_rate >= 60 && metrics.heart_rate <= 100) insights.push({ type: 'good', text: 'Heart rate is in the healthy range.' });
    else if (metrics.heart_rate > 100) insights.push({ type: 'warn', text: 'Resting heart rate is elevated. Rest and consult a doctor if persistent.' });
  }

  if (metrics.sleep_hours > 0) {
    if (metrics.sleep_hours >= 7 && metrics.sleep_hours <= 9) insights.push({ type: 'good', text: 'You\'re getting the recommended 7–9 hours of sleep.' });
    else if (metrics.sleep_hours < 6) insights.push({ type: 'warn', text: 'Less than 6 hours of sleep increases health risks. Try to get more rest.' });
    else if (metrics.sleep_hours > 10) insights.push({ type: 'info', text: 'Sleeping over 10 hours may indicate fatigue or illness. Monitor how you feel.' });
  }

  if (metrics.water_intake >= 2000) insights.push({ type: 'good', text: 'Well hydrated! Keep it up.' });
  else if (metrics.water_intake > 0 && metrics.water_intake < 1500) insights.push({ type: 'warn', text: 'Increase water intake — aim for at least 2 liters daily.' });

  if (metrics.exercise_minutes >= 30) insights.push({ type: 'good', text: 'You\'ve met the daily exercise recommendation!' });
  else if (metrics.exercise_minutes > 0) insights.push({ type: 'info', text: `${30 - metrics.exercise_minutes} more minutes of exercise to hit today's goal.` });

  if (insights.length === 0) insights.push({ type: 'info', text: 'Start logging your metrics to get personalized health insights.' });

  return insights;
}

export function HealthTrackingPage() {
  const { session } = useAuth();
  const [metrics, setMetrics] = useState<DailyMetrics>({
    steps: 0, heart_rate: 0, sleep_hours: 0,
    calories_burned: 0, water_intake: 0, exercise_minutes: 0, mood: 'good',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedKey, setSavedKey] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user.id) loadMetrics(session.user.id);
  }, [session?.user.id]);

  const loadMetrics = async (userId: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('daily_health_metrics')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .maybeSingle();
      if (data) {
        setMetrics({
          steps: data.steps || 0,
          heart_rate: data.heart_rate || 0,
          sleep_hours: data.sleep_hours || 0,
          calories_burned: data.calories_burned || 0,
          water_intake: data.water_intake || 0,
          exercise_minutes: data.exercise_minutes || 0,
          mood: data.mood || 'good',
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateMetric = async (key: keyof DailyMetrics, value: number | string) => {
    if (!session?.user.id) return;
    const newMetrics = { ...metrics, [key]: value };
    setMetrics(newMetrics);
    setSaving(true);
    setSavedKey(key);
    try {
      const today = new Date().toISOString().split('T')[0];
      await supabase.from('daily_health_metrics').upsert({
        user_id: session.user.id,
        date: today,
        ...newMetrics,
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
      setTimeout(() => setSavedKey(null), 1500);
    }
  };

  const healthScore = getHealthScore(metrics);
  const scoreLabel = getScoreLabel(healthScore);
  const insights = getHealthInsights(metrics);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="h-16 bg-white border-b border-gray-100 shadow-sm"></div>
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="h-8 w-56 bg-gray-200 animate-pulse rounded-lg mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-44 bg-white rounded-2xl animate-pulse shadow-sm"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Health Tracking</h1>
            <p className="text-gray-500 text-sm mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          {savedKey && (
            <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-1.5 rounded-full text-sm border border-green-100">
              <CheckCircle className="w-4 h-4" />
              Saved
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {METRIC_CONFIGS.map(config => (
                <MetricCard
                  key={config.key}
                  config={config}
                  value={metrics[config.key] as number}
                  onUpdate={(val) => updateMetric(config.key, val)}
                  saving={saving}
                />
              ))}
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4">How are you feeling today?</h3>
              <div className="grid grid-cols-4 gap-3">
                {MOOD_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => updateMetric('mood', opt.value)}
                    className={`flex flex-col items-center gap-2 py-3 px-2 rounded-xl border-2 font-medium text-sm transition-all ${
                      metrics.mood === opt.value
                        ? `${opt.color} border-current scale-105 shadow-sm`
                        : 'border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-2xl">{opt.emoji}</span>
                    <span className="text-xs">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-yellow-500" />
                <h3 className="font-semibold text-gray-800">Health Score</h3>
              </div>

              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#f3f4f6" strokeWidth="12" />
                  <circle
                    cx="60" cy="60" r="50"
                    fill="none"
                    stroke={healthScore >= 70 ? '#22c55e' : healthScore >= 50 ? '#3b82f6' : '#f59e0b'}
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${(healthScore / 100) * 314} 314`}
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-gray-800">{healthScore}</span>
                  <span className="text-xs text-gray-400">/ 100</span>
                </div>
              </div>

              <p className={`text-center font-semibold ${scoreLabel.color}`}>{scoreLabel.label}</p>

              <div className="mt-4 space-y-2">
                {METRIC_CONFIGS.filter(c => c.key !== 'heart_rate').map(config => {
                  const val = metrics[config.key] as number;
                  const goal = GOALS[config.key];
                  const pct = Math.min(Math.round((val / goal) * 100), 100);
                  return (
                    <div key={config.key} className="flex items-center gap-2">
                      <config.icon className={`w-3.5 h-3.5 ${config.color} flex-shrink-0`} />
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${getProgressColor(pct)} transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 w-7 text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-3">Health Insights</h3>
              <div className="space-y-2">
                {insights.map((insight, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-2 p-2.5 rounded-xl text-xs ${
                      insight.type === 'good' ? 'bg-green-50 text-green-700' :
                      insight.type === 'warn' ? 'bg-yellow-50 text-yellow-700' :
                      'bg-blue-50 text-blue-700'
                    }`}
                  >
                    {insight.type === 'good' ? (
                      <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    ) : insight.type === 'warn' ? (
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    )}
                    <span className="leading-snug">{insight.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
