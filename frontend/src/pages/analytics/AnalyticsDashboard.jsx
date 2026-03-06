import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import {
  BarChart3, Users, Award, TrendingUp, BookOpen, RefreshCw, Building2,
} from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const COLORS = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' },
  }),
};

export default function AnalyticsDashboard() {
  const { user } = useAuthStore();
  const [overview, setOverview] = useState(null);
  const [gradeDistribution, setGradeDistribution] = useState([]);
  const [subjectPerformance, setSubjectPerformance] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [attendanceTrends, setAttendanceTrends] = useState([]);
  const [scoreHistogram, setScoreHistogram] = useState([]);
  const [institutionComparison, setInstitutionComparison] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [academicYear] = useState('2025-2026');

  const isGovOrAdmin = ['SYSTEM_ADMIN', 'GOV_AUTHORITY'].includes(user?.role);
  const isSchoolLevel = ['SCHOOL_ADMIN', 'DATA_VERIFIER'].includes(user?.role);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewRes, gradeRes, topRes, histRes] = await Promise.all([
        api.get('/analytics/overview'),
        api.get('/analytics/grade-distribution'),
        api.get('/analytics/top-performers?limit=10'),
        api.get('/analytics/score-histogram'),
      ]);

      setOverview(overviewRes.data.data);
      setGradeDistribution(gradeRes.data.data || []);
      setTopPerformers(topRes.data.data || []);
      setScoreHistogram(histRes.data.data || []);

      // Additional fetches based on role
      const extras = [];
      extras.push(
        api.get(`/analytics/subjects?academicYear=${academicYear}`).then(r => setSubjectPerformance(r.data.data || [])).catch(() => {}),
        api.get(`/analytics/attendance-trends?academicYear=${academicYear}`).then(r => setAttendanceTrends(r.data.data || [])).catch(() => {}),
      );

      if (isGovOrAdmin) {
        extras.push(
          api.get('/analytics/institution-comparison').then(r => setInstitutionComparison(r.data.data || [])).catch(() => {}),
        );
      }

      await Promise.all(extras);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [academicYear, isGovOrAdmin]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-primary-600 animate-spin" />
        <span className="ml-3 text-gray-600">Loading analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={fetchAll} className="btn-primary">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary-100 text-primary-600">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isGovOrAdmin ? 'Platform Analytics' : 'School Analytics'}
            </h1>
            <p className="text-gray-500">
              {isGovOrAdmin ? 'Cross-institution performance insights' : 'Your institution performance overview'}
            </p>
          </div>
        </div>
        <button onClick={fetchAll} className="btn-secondary flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </motion.div>

      {/* Overview Cards */}
      {overview && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Students', value: overview.totalStudents, icon: Users, color: 'bg-blue-50 text-blue-600' },
            { label: 'Approved', value: overview.approvedStudents, icon: Award, color: 'bg-green-50 text-green-600' },
            { label: 'Avg Merit Score', value: overview.averageCompositeScore?.toFixed(4) ?? '—', icon: TrendingUp, color: 'bg-purple-50 text-purple-600' },
            { label: isGovOrAdmin ? 'Institutions' : 'Pending Verification', value: isGovOrAdmin ? overview.totalInstitutions : overview.pendingVerification, icon: isGovOrAdmin ? Building2 : BookOpen, color: 'bg-amber-50 text-amber-600' },
          ].map((stat, i) => {
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
      )}

      {/* Row 1: Grade Distribution + Score Histogram */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade Distribution Bar Chart */}
        <motion.div custom={4} initial="hidden" animate="visible" variants={cardVariants} className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Score by Grade</h3>
          {gradeDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={gradeDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="grade" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="avgCompositeScore" name="Composite" fill="#4f46e5" radius={[4,4,0,0]} />
                <Bar dataKey="avgAcademicZScore" name="Academic" fill="#0ea5e9" radius={[4,4,0,0]} />
                <Bar dataKey="avgAttendanceZScore" name="Attendance" fill="#10b981" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-12">No grade distribution data available</p>
          )}
        </motion.div>

        {/* Score Histogram */}
        <motion.div custom={5} initial="hidden" animate="visible" variants={cardVariants} className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Composite Score Distribution</h3>
          {scoreHistogram.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scoreHistogram}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" fontSize={12} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" name="Students" fill="#8b5cf6" radius={[4,4,0,0]}>
                  {scoreHistogram.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-12">No score data available</p>
          )}
        </motion.div>
      </div>

      {/* Row 2: Subject Performance Radar + Attendance Trends Line */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Performance Radar */}
        <motion.div custom={6} initial="hidden" animate="visible" variants={cardVariants} className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject Performance ({academicYear})</h3>
          {subjectPerformance.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={subjectPerformance}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" fontSize={12} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="Avg %" dataKey="avgPercentage" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.3} />
                <Radar name="Max %" dataKey="maxPercentage" stroke="#10b981" fill="#10b981" fillOpacity={0.15} />
                <Tooltip />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-12">No subject data available</p>
          )}
        </motion.div>

        {/* Attendance Trends */}
        <motion.div custom={7} initial="hidden" animate="visible" variants={cardVariants} className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Trends ({academicYear})</h3>
          {attendanceTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={attendanceTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="avgAttendancePercent" name="Avg Attendance %" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-12">No attendance data available</p>
          )}
        </motion.div>
      </div>

      {/* Institution Comparison (Gov/Admin only) */}
      {isGovOrAdmin && institutionComparison.length > 0 && (
        <motion.div custom={8} initial="hidden" animate="visible" variants={cardVariants} className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Institution Comparison</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={institutionComparison} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="institutionName" type="category" width={150} fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar dataKey="avgCompositeScore" name="Avg Composite" fill="#4f46e5" radius={[0,4,4,0]} />
              <Bar dataKey="avgAcademicZScore" name="Avg Academic" fill="#0ea5e9" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Top Performers Table */}
      <motion.div custom={9} initial="hidden" animate="visible" variants={cardVariants} className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h3>
        {topPerformers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header">#</th>
                  <th className="table-header">Student</th>
                  <th className="table-header">Grade</th>
                  {isGovOrAdmin && <th className="table-header">Institution</th>}
                  <th className="table-header">Composite Score</th>
                  <th className="table-header">School Rank</th>
                  {isGovOrAdmin && <th className="table-header">District Rank</th>}
                  {isGovOrAdmin && <th className="table-header">State Rank</th>}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topPerformers.map((tp, idx) => (
                  <motion.tr
                    key={tp.studentId}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="table-cell font-medium">
                      {idx < 3 ? (
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-white ${
                          idx === 0 ? 'bg-yellow-400' : idx === 1 ? 'bg-gray-400' : 'bg-amber-600'
                        }`}>{idx + 1}</span>
                      ) : idx + 1}
                    </td>
                    <td className="table-cell">
                      <div className="font-medium text-gray-900">{tp.studentName}</div>
                      <div className="text-xs text-gray-500">{tp.enrollmentNumber}</div>
                    </td>
                    <td className="table-cell">{tp.grade}</td>
                    {isGovOrAdmin && <td className="table-cell text-gray-600">{tp.institutionName}</td>}
                    <td className="table-cell font-semibold text-primary-600">{tp.compositeScore?.toFixed(4)}</td>
                    <td className="table-cell">{tp.rankSchool ?? '—'}</td>
                    {isGovOrAdmin && <td className="table-cell">{tp.rankDistrict ?? '—'}</td>}
                    {isGovOrAdmin && <td className="table-cell">{tp.rankState ?? '—'}</td>}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8">No performers data available. Run a merit calculation first.</p>
        )}
      </motion.div>
    </div>
  );
}
