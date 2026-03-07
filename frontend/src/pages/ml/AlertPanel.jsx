import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Bell, AlertTriangle, ShieldAlert, CheckCircle, Filter, Search,
  ChevronDown, ChevronUp, TrendingDown, User, BarChart3,
} from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const severityConfig = {
  CRITICAL: { color: 'bg-red-100 text-red-800 border-red-200', icon: ShieldAlert, barColor: 'bg-red-500' },
  HIGH: { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: AlertTriangle, barColor: 'bg-orange-500' },
  MEDIUM: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Bell, barColor: 'bg-yellow-500' },
  LOW: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle, barColor: 'bg-green-500' },
};

const typeLabels = {
  DROPOUT_RISK: 'Dropout Risk',
  DECLINING_PERFORMANCE: 'Declining Performance',
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04 } }),
};

export default function AlertPanel() {
  const { user } = useAuthStore();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [severityFilter, setSeverityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [unackCount, setUnackCount] = useState(0);

  const isAdmin = ['SCHOOL_ADMIN', 'SYSTEM_ADMIN'].includes(user?.role);
  const isStudent = user?.role === 'STUDENT';

  useEffect(() => { fetchAlerts(); }, [page, severityFilter, typeFilter]);
  useEffect(() => { fetchUnacknowledgedCount(); }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const params = { page, size: 20 };
      if (severityFilter) params.severity = severityFilter;
      if (typeFilter) params.type = typeFilter;

      let endpoint;
      if (isStudent) {
        endpoint = `/alerts/student/${user.id}`;
      } else if (user?.institutionId) {
        endpoint = `/alerts/institution/${user.institutionId}`;
      } else {
        setLoading(false);
        return;
      }

      const { data } = await api.get(endpoint, { params });
      setAlerts(data.data?.content || []);
      setTotalPages(data.data?.totalPages || 0);
    } catch {
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnacknowledgedCount = async () => {
    try {
      let endpoint;
      if (isStudent) {
        endpoint = `/alerts/count/student/${user.id}`;
      } else {
        endpoint = `/alerts/count/institution/${user?.institutionId}`;
      }
      if (!endpoint) return;
      const { data } = await api.get(endpoint);
      setUnackCount(data.data || 0);
    } catch { /* ignore */ }
  };

  const handleAcknowledge = async (alertId) => {
    try {
      await api.put(`/alerts/${alertId}/acknowledge?userId=${user.id}`);
      toast.success('Alert acknowledged');
      fetchAlerts();
      fetchUnacknowledgedCount();
    } catch {
      toast.error('Failed to acknowledge alert');
    }
  };

  const handleGenerateAlerts = async () => {
    try {
      const institutionId = user?.institutionId;
      if (!institutionId) {
        toast.error('No institution linked to your account');
        return;
      }
      const { data } = await api.post(`/alerts/generate/${institutionId}`);
      toast.success(`Generated ${data.data} new alerts`);
      fetchAlerts();
      fetchUnacknowledgedCount();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate alerts. Is the ML service running?');
    }
  };

  const topImportances = (importances) => {
    if (!importances) return [];
    return Object.entries(importances)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Early Warning Alerts</h1>
          <p className="text-gray-500 mt-1">
            ML-powered dropout risk predictions and performance alerts
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unackCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-sm font-medium">
              <Bell className="w-4 h-4" />
              {unackCount} unacknowledged
            </span>
          )}
          {isAdmin && (
            <button
              onClick={handleGenerateAlerts}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              <TrendingDown className="w-4 h-4" />
              Generate Alerts
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={severityFilter}
              onChange={(e) => { setSeverityFilter(e.target.value); setPage(0); }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(0); }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Types</option>
              <option value="DROPOUT_RISK">Dropout Risk</option>
              <option value="DECLINING_PERFORMANCE">Declining Performance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alert List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : alerts.length === 0 ? (
        <div className="card text-center py-12">
          <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No alerts found</h3>
          <p className="text-gray-500 mt-1">All students are on track. No early warnings detected.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert, i) => {
            const sev = severityConfig[alert.severity] || severityConfig.LOW;
            const SevIcon = sev.icon;
            const expanded = expandedId === alert.id;

            return (
              <motion.div
                key={alert.id}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={cardVariants}
                className={`card border-l-4 ${sev.color.split(' ').find(c => c.startsWith('border-'))}`}
              >
                <div
                  className="flex items-start gap-4 cursor-pointer"
                  onClick={() => setExpandedId(expanded ? null : alert.id)}
                >
                  <div className={`p-2 rounded-lg ${sev.color}`}>
                    <SevIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900">{alert.studentName}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sev.color}`}>
                            {alert.severity}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            {typeLabels[alert.alertType] || alert.alertType}
                          </span>
                          {alert.acknowledged && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                              Acknowledged
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {alert.enrollmentNumber} &middot; Grade {alert.grade}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {/* Risk Score Badge */}
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Risk Score</p>
                          <p className="text-lg font-bold text-gray-900">
                            {(alert.riskScore * 100).toFixed(1)}%
                          </p>
                        </div>
                        {expanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{alert.message}</p>

                    {/* Risk Score Bar */}
                    <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                      <div className={`h-2 rounded-full ${sev.barColor}`} style={{ width: `${Math.min(alert.riskScore * 100, 100)}%` }} />
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 pt-4 border-t border-gray-100"
                  >
                    {/* Feature Importances */}
                    {alert.featureImportances && Object.keys(alert.featureImportances).length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                          <BarChart3 className="w-4 h-4" /> Key Risk Factors
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {topImportances(alert.featureImportances).map(([feature, value]) => (
                            <div key={feature} className="flex items-center gap-2">
                              <span className="text-xs text-gray-500 w-36 truncate">{feature.replace(/_/g, ' ')}</span>
                              <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                                <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${Math.min(value * 100 * 5, 100)}%` }} />
                              </div>
                              <span className="text-xs font-mono text-gray-600">{(value * 100).toFixed(1)}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500 space-y-0.5">
                        <p>Model Version: v{alert.modelVersion}</p>
                        <p>Created: {new Date(alert.createdAt).toLocaleString('en-IN')}</p>
                        {alert.acknowledgedByName && (
                          <p>Acknowledged by: {alert.acknowledgedByName} at {new Date(alert.acknowledgedAt).toLocaleString('en-IN')}</p>
                        )}
                      </div>
                      {!alert.acknowledged && isAdmin && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleAcknowledge(alert.id); }}
                          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Acknowledge
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">Page {page + 1} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            Next
          </button>
        </div>
      )}
    </div>
  );
}
