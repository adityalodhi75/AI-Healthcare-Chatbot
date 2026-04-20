import { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, MapPin, Activity } from 'lucide-react';
import { NavBar } from '../components/NavBar';

interface HealthAlert {
  id: string;
  disease_name: string;
  alert_message: string;
  severity: string;
  regions_affected: string[];
  created_at: string;
}

interface EpidemicData {
  id: string;
  disease_name: string;
  region: string;
  confirmed_cases: number;
  trend: string;
  date_reported: string;
}

export function AlertsPage() {
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  const [epidemicData, setEpidemicData] = useState<EpidemicData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('');

  useEffect(() => {
    loadAlerts();
  }, [selectedSeverity]);

  const loadAlerts = async () => {
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/alerts`;
      const params = new URLSearchParams();
      if (selectedSeverity) params.append('severity', selectedSeverity);

      const response = await fetch(`${apiUrl}?${params}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedSeverity ? { severity: selectedSeverity } : {}),
      });

      const data = await response.json();
      setAlerts(data.alerts || []);
      setEpidemicData(data.epidemicData || []);
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-300';
    }
  };

  const getTrendIcon = (trend: string) => {
    return trend === 'increasing' ? '📈' : trend === 'decreasing' ? '📉' : '→';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Health Alerts & Epidemiology</h1>
            <p className="text-gray-500 mt-1 text-sm">Real-time disease outbreak information and alerts</p>
          </div>
        </div>

        <div className="mb-6 flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedSeverity('')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedSeverity === ''
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            All Alerts
          </button>
          {['critical', 'high', 'medium', 'low'].map(sev => (
            <button
              key={sev}
              onClick={() => setSelectedSeverity(sev)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                selectedSeverity === sev
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Active Health Alerts</h2>
            {loading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 rounded-full bg-blue-500 animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading alerts...</p>
              </div>
            ) : alerts.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No active alerts for selected severity</p>
              </div>
            ) : (
              <div className="space-y-4">
                {alerts.map(alert => (
                  <div
                    key={alert.id}
                    className={`border-l-4 rounded-lg p-6 bg-white shadow-md ${getSeverityColor(alert.severity)}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-6 h-6" />
                        <div>
                          <h3 className="font-bold text-lg">{alert.disease_name}</h3>
                          <p className="text-sm opacity-75">
                            {new Date(alert.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize`}>
                        {alert.severity}
                      </span>
                    </div>
                    <p className="mb-3 leading-relaxed">{alert.alert_message}</p>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4" />
                      <span>{alert.regions_affected.join(', ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Epidemic Trends</h2>
            <div className="space-y-3">
              {epidemicData.slice(0, 6).map(epi => (
                <div key={epi.id} className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-800">{epi.disease_name}</h4>
                    <span className="text-2xl">{getTrendIcon(epi.trend)}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{epi.region}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-blue-600">{epi.confirmed_cases.toLocaleString()}</span>
                    <span className="text-xs text-gray-500 capitalize">{epi.trend}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(epi.date_reported).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Alert Guidelines</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="border-l-4 border-red-500 pl-4">
              <h4 className="font-bold text-red-700 mb-2">Critical</h4>
              <p className="text-sm text-gray-700">Immediate action required. Seek medical attention urgently.</p>
            </div>
            <div className="border-l-4 border-orange-500 pl-4">
              <h4 className="font-bold text-orange-700 mb-2">High</h4>
              <p className="text-sm text-gray-700">Significant health risk. Take preventive measures immediately.</p>
            </div>
            <div className="border-l-4 border-yellow-500 pl-4">
              <h4 className="font-bold text-yellow-700 mb-2">Medium</h4>
              <p className="text-sm text-gray-700">Moderate concern. Stay informed and practice precautions.</p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-bold text-blue-700 mb-2">Low</h4>
              <p className="text-sm text-gray-700">Minor risk. General awareness and preventive care recommended.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
