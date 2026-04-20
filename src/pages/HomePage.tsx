import { useNavigate } from 'react-router-dom';
import { Activity, Zap, Shield, Clock, Users, TrendingUp, Heart, Utensils, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function HomePage() {
  const navigate = useNavigate();
  const { session } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800">HealthAI</span>
          </div>
          <div className="flex gap-4">
            {session ? (
              <>
                <button
                  onClick={() => navigate('/chat')}
                  className="px-6 py-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-medium"
                >
                  Go to Chat
                </button>
                <button
                  onClick={() => navigate('/health-tracking')}
                  className="px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors font-medium text-sm"
                >
                  Health Tracking
                </button>
                <button
                  onClick={() => navigate('/nutrition')}
                  className="px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors font-medium text-sm"
                >
                  Nutrition
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                >
                  Dashboard
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="px-6 py-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-medium"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      <main>
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
              Your AI Healthcare<br />
              <span className="bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
                Assistant
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Get instant medical insights, symptom analysis, and personalized health recommendations powered by advanced AI. Available 24/7 for your health needs.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <button
                onClick={() => navigate(session ? '/chat' : '/signup')}
                className="px-8 py-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-medium text-lg shadow-lg"
              >
                Start Consultation
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium text-lg"
              >
                Sign In
              </button>
            </div>
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-4xl font-bold text-gray-800 text-center mb-16">Why Choose HealthAI?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Instant Analysis</h3>
                <p className="text-gray-600">Get immediate symptom analysis and health insights within seconds, not days.</p>
              </div>

              <div className="p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Secure & Private</h3>
                <p className="text-gray-600">Your health data is encrypted and protected with enterprise-grade security.</p>
              </div>

              <div className="p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">24/7 Available</h3>
                <p className="text-gray-600">Access health consultation anytime, anywhere. No waiting rooms, no appointments.</p>
              </div>

              <div className="p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Health Tracking</h3>
                <p className="text-gray-600">Monitor your health patterns and get personalized recommendations over time.</p>
              </div>

              <div className="p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center mb-4">
                  <Activity className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Expert Database</h3>
                <p className="text-gray-600">Powered by comprehensive medical knowledge and symptom databases.</p>
              </div>

              <div className="p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Smart Recommendations</h3>
                <p className="text-gray-600">Get specialist recommendations and follow-up advice tailored to your needs.</p>
              </div>

              <div className="p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Health Metrics</h3>
                <p className="text-gray-600">Track steps, heart rate, sleep, calories, water intake, and exercise daily.</p>
              </div>

              <div className="p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4">
                  <Utensils className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Nutrition Tracking</h3>
                <p className="text-gray-600">Log meals, track calories, protein, carbs, and fat. Get nutritional insights.</p>
              </div>

              <div className="p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center mb-4">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Real-time Alerts</h3>
                <p className="text-gray-600">Get instant notifications about disease outbreaks and health warnings.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-12 text-white text-center">
            <h2 className="text-4xl font-bold mb-4">Ready to Take Control of Your Health?</h2>
            <p className="text-lg mb-8 opacity-90">Join thousands of users who trust HealthAI for their health insights</p>
            <button
              onClick={() => navigate(session ? '/chat' : '/signup')}
              className="px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-medium text-lg shadow-lg"
            >
              Get Started Now
            </button>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-gray-400 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p>HealthAI - AI Healthcare Assistant | Disclaimer: This is for informational purposes only. Always consult with healthcare professionals for medical advice.</p>
          <p className="mt-2 text-sm">2024 - Final Year Project - Computer Science Department</p>
        </div>
      </footer>
    </div>
  );
}
