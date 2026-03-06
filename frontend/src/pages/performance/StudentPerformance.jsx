import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar,
} from 'recharts';
import { User, TrendingUp, Award, BookOpen, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: 'easeOut' },
  }),
};

export default function StudentPerformance() {
  const { studentId: paramId } = useParams();
  const { user } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [academicYear] = useState('2025-2026');

  // If no studentId in URL, use the logged-in user's linked student ID
  // For students viewing their own performance, the backend resolves via auth
  const studentId = paramId || user?.studentId;

  const fetchPerformance = useCallback(async () => {
    if (!studentId) {
      setError('No student selected');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/analytics/student/${studentId}?academicYear=${academicYear}`);
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load performance data');
    } finally {
      setLoading(false);
    }
  }, [studentId, academicYear]);

  useEffect(() => { fetchPerformance(); }, [fetchPerformance]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-primary-600 animate-spin" />
        <span className="ml-3 text-gray-600">Loading performance...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={fetchPerformance} className="btn-primary">Retry</button>
      </div>
    );
  }

  if (!data) return null;

  const scoreCards = [
    { label: 'Composite Score', value: data.compositeScore?.toFixed(4) ?? '—', icon: TrendingUp, color: 'bg-purple-50 text-purple-600' },
    { label: 'Academic Z-Score', value: data.academicZScore?.toFixed(4) ?? '—', icon: BookOpen, color: 'bg-blue-50 text-blue-600' },
    { label: 'Attendance Z-Score', value: data.attendanceZScore?.toFixed(4) ?? '—', icon: User, color: 'bg-green-50 text-green-600' },
    { label: 'School Rank', value: data.rankSchool ?? '—', icon: Award, color: 'bg-amber-50 text-amber-600' },
  ];

  const subjectData = data.subjectBreakdown || [];
  const historyData = data.scoreHistory || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
        <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary-100 text-primary-600">
          <User className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{data.studentName}</h1>
          <p className="text-gray-500">
            {data.enrollmentNumber} &middot; Grade {data.grade} &middot; {data.institutionName}
          </p>
        </div>
      </motion.div>

      {/* Score Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {scoreCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} custom={i} initial="hidden" animate="visible" variants={cardVariants} className="card">
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Row: Subject Radar + Subject Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Performance Radar */}
        <motion.div custom={4} initial="hidden" animate="visible" variants={cardVariants} className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject Radar</h3>
          {subjectData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={subjectData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" fontSize={12} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="Avg %" dataKey="avgPercentage" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.35} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-12">No subject data</p>
          )}
        </motion.div>

        {/* Subject Bar Chart */}
        <motion.div custom={5} initial="hidden" animate="visible" variants={cardVariants} className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject Breakdown</h3>
          {subjectData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={subjectData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" fontSize={12} />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="avgPercentage" name="Avg %" fill="#4f46e5" radius={[4,4,0,0]} />
                <Bar dataKey="maxPercentage" name="Max %" fill="#10b981" radius={[4,4,0,0]} />
                <Bar dataKey="minPercentage" name="Min %" fill="#ef4444" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-12">No subject data</p>
          )}
        </motion.div>
      </div>

      {/* Score History */}
      {historyData.length > 0 && (
        <motion.div custom={6} initial="hidden" animate="visible" variants={cardVariants} className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Score History</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={historyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="academicYear" fontSize={12} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="compositeScore" name="Composite" stroke="#4f46e5" strokeWidth={2} dot={{ r: 5 }} />
              <Line type="monotone" dataKey="academicZScore" name="Academic Z" stroke="#0ea5e9" strokeWidth={1.5} />
              <Line type="monotone" dataKey="attendanceZScore" name="Attendance Z" stroke="#10b981" strokeWidth={1.5} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Additional Z-Score Details */}
      <motion.div custom={7} initial="hidden" animate="visible" variants={cardVariants} className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Z-Scores</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Academic', value: data.academicZScore, color: 'text-blue-600' },
            { label: 'Attendance', value: data.attendanceZScore, color: 'text-green-600' },
            { label: 'Activity', value: data.activityZScore, color: 'text-amber-600' },
            { label: 'Certificate', value: data.certificateZScore, color: 'text-purple-600' },
          ].map(z => (
            <div key={z.label} className="text-center p-4 rounded-lg bg-gray-50">
              <p className="text-sm text-gray-500 mb-1">{z.label}</p>
              <p className={`text-2xl font-bold ${z.color}`}>{z.value?.toFixed(4) ?? '—'}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
