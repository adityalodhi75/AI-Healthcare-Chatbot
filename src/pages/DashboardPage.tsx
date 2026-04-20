import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { NavBar } from '../components/NavBar';
import {
  BarChart3, Heart, Calendar, AlertCircle, TrendingUp,
  Activity, Droplets, Moon, Flame, MessageSquare, ChevronRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ConsultationRecord {
  id: string;
  symptoms: string;
  diagnosis: string;
  severity_level: string;
  recommended_action: string;
  follow_up_required: boolean;
  created_at: string;
}

interface Analytics {
  total_consultations: number;
  health_score: number;
  last_consultation_date: string;
}

interface TodayMetrics {
  steps: number;
  heart_rate: number;
  sleep_hours: number;
  water_intake: number;
  calories_burned: number;
  exercise_minutes: number;
}

const SEVERITY_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  critical: { bg: 'bg-red-100', text: 'text-red-700', label: 'Critical' },
  severe: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Severe' },
  moderate: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Moderate' },
  mild: { bg: 'bg-green-100', text: 'text-green-700', label: 'Mild' },
};

export function DashboardPage() {
  const { user, session } = useAuth();
  const [consultations, setConsultations] = useState<ConsultationRecord[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [todayMetrics, setTodayMetrics] = useState<TodayMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (session?.user.id) loadData(session.user.id);
  }, [session?.user.id]);

  const loadData = async (userId: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const [consultRes, analyticsRes, metricsRes] = await Promise.all([
        supabase
          .from('consultation_records')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('user_analytics')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle(),
        supabase
          .from('daily_health_metrics')
          .select('steps,heart_rate,sleep_hours,water_intake,calories_burned,exercise_minutes')
          .eq('user_id', userId)
          .eq('date', today)
          .maybeSingle(),
      ]);

      if (consultRes.data) setConsultations(consultRes.data);
      if (analyticsRes.data) setAnalytics(analyticsRes.data);
      if (metricsRes.data) setTodayMetrics(metricsRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="h-16 bg-white border-b border-gray-100 shadow-sm"></div>
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="h-8 w-56 bg-gray-200 animate-pulse rounded-lg mb-6"></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 bg-white rounded-2xl animate-pulse shadow-sm"></div>
            ))}
          </div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-white rounded-2xl animate-pulse shadow-sm mb-4"></div>
          ))}
        </div>
      </div>
    );
  }

  const healthScore = analytics?.health_score || 0;

  const statCards = [
    {
      label: 'Total Consultations',
      value: analytics?.total_consultations || 0,
      icon: BarChart3,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      sub: 'AI assessments',
    },
    {
      label: 'Health Score',
      value: `${healthScore}/100`,
      icon: Heart,
      color: healthScore >= 70 ? 'text-green-600' : healthScore >= 50 ? 'text-yellow-600' : 'text-red-500',
      bg: healthScore >= 70 ? 'bg-green-50' : healthScore >= 50 ? 'bg-yellow-50' : 'bg-red-50',
      sub: healthScore >= 70 ? 'Good' : healthScore >= 50 ? 'Fair' : 'Needs attention',
    },
    {
      label: 'Last Consultation',
      value: analytics?.last_consultation_date
        ? new Date(analytics.last_consultation_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : 'Never',
      icon: Calendar,
      color: 'text-gray-600',
      bg: 'bg-gray-50',
      sub: 'Most recent',
    },
    {
      label: "Today's Steps",
      value: (todayMetrics?.steps || 0).toLocaleString(),
      icon: Activity,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
      sub: `Goal: 8,000`,
    },
  ];

  const todayStats = todayMetrics ? [
    { label: 'Heart Rate', value: todayMetrics.heart_rate || '—', unit: 'bpm', icon: Heart, color: 'text-red-500' },
    { label: 'Sleep', value: todayMetrics.sleep_hours || '—', unit: 'hrs', icon: Moon, color: 'text-indigo-500' },
    { label: 'Water', value: todayMetrics.water_intake || '—', unit: 'ml', icon: Droplets, color: 'text-cyan-500' },
    { label: 'Calories', value: todayMetrics.calories_burned || '—', unit: 'kcal', icon: Flame, color: 'text-orange-500' },
    { label: 'Exercise', value: todayMetrics.exercise_minutes || '—', unit: 'min', icon: TrendingUp, color: 'text-green-600' },
  ] : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Welcome back, {user?.full_name?.split(' ')[0] || 'there'}
            </h1>
            <p className="text-gray-500 text-sm mt-1">Here's your health overview for today</p>
          </div>
          <button
            onClick={() => navigate('/chat')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm"
          >
            <MessageSquare className="w-4 h-4" />
            Consult AI Advisor
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map((card) => (
            <div key={card.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center`}>
                  <card.icon className={`w-4.5 h-4.5 ${card.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-800">{card.value}</p>
              <p className="text-xs font-medium text-gray-500 mt-0.5">{card.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
            </div>
          ))}
        </div>

        {todayStats && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800">Today's Health Metrics</h2>
              <button
                onClick={() => navigate('/health-tracking')}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
              >
                Update <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {todayStats.map(stat => (
                <div key={stat.label} className="text-center">
                  <div className={`w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center mx-auto mb-2`}>
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                  <p className="text-sm font-bold text-gray-800">{stat.value}</p>
                  <p className="text-xs text-gray-400">{stat.unit}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-800">Recent Consultations</h2>
            <button
              onClick={() => navigate('/chat')}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              New consult <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {consultations.length === 0 ? (
            <div className="text-center py-14">
              <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-6 h-6 text-gray-400" />
              </div>
              <p className="font-medium text-gray-700">No consultations yet</p>
              <p className="text-sm text-gray-400 mt-1">Describe your symptoms to the AI Advisor to get started</p>
              <button
                onClick={() => navigate('/chat')}
                className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700"
              >
                Start Consultation
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {consultations.map(record => {
                const sev = SEVERITY_CONFIG[record.severity_level] || SEVERITY_CONFIG.mild;
                return (
                  <div key={record.id} className="px-5 py-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`inline-flex text-xs font-semibold px-2 py-0.5 rounded-full ${sev.bg} ${sev.text}`}>
                            {sev.label}
                          </span>
                          <h3 className="font-semibold text-gray-800 text-sm truncate">{record.diagnosis}</h3>
                        </div>
                        <p className="text-xs text-gray-500 truncate mb-1">{record.symptoms}</p>
                        {record.recommended_action && (
                          <p className="text-xs text-gray-400 line-clamp-2">{record.recommended_action.slice(0, 120)}...</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <p className="text-xs text-gray-400 whitespace-nowrap">
                          {new Date(record.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                        {record.follow_up_required && (
                          <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full font-medium">
                            Follow-up
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
