import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Calendar, DollarSign, Users, Search, Filter, ChevronRight, Award, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05 } }),
};

const statusColors = {
  ACTIVE: 'bg-green-100 text-green-700',
  CLOSED: 'bg-gray-100 text-gray-600',
  DRAFT: 'bg-yellow-100 text-yellow-700',
  CANCELLED: 'bg-red-100 text-red-600',
};

const orgTypeColors = {
  NGO: 'bg-purple-100 text-purple-700',
  GOVERNMENT: 'bg-blue-100 text-blue-700',
  PRIVATE: 'bg-orange-100 text-orange-700',
};

export default function ScholarshipList({ myApplications, applicantView }) {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const role = user?.role;

  const isStudent = role === 'STUDENT';
  const canCreate = ['NGO_REP', 'GOV_AUTHORITY', 'SYSTEM_ADMIN'].includes(role);

  useEffect(() => {
    fetchScholarships();
  }, [page, statusFilter]);

  const fetchScholarships = async () => {
    setLoading(true);
    try {
      const params = { page, size: 12 };
      if (statusFilter) params.status = statusFilter;

      let endpoint = '/scholarships';
      if (myApplications) {
        endpoint = '/scholarships/my-applications';
      } else if (applicantView) {
        endpoint = '/scholarships/mine';
      }

      const { data } = await api.get(endpoint, { params });
      setScholarships(data.data?.content || []);
      setTotalPages(data.data?.totalPages || 0);
    } catch (err) {
      toast.error('Failed to load scholarships');
    } finally {
      setLoading(false);
    }
  };

  const filteredScholarships = scholarships.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.organizationName.toLowerCase().includes(search.toLowerCase())
  );

  const formatCurrency = (amount, currency) => {
    if (!amount) return 'Variable';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: currency || 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return 'Open';
    return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const isExpiringSoon = (deadline) => {
    if (!deadline) return false;
    const d = new Date(deadline);
    const now = new Date();
    const daysLeft = (d - now) / (1000 * 60 * 60 * 24);
    return daysLeft > 0 && daysLeft <= 7;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {myApplications ? 'My Applications' : applicantView ? 'Scholarship Applicants' : 'Scholarships'}
          </h1>
          <p className="text-gray-500 mt-1">
            {myApplications ? 'Track your scholarship applications' : applicantView ? 'Review student applications for your scholarships' : isStudent ? 'Browse and apply to available scholarships' : 'Manage scholarship programs'}
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => navigate('/scholarships/create')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            <BookOpen className="w-4 h-4" />
            Create Scholarship
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search scholarships..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Active</option>
              <option value="ACTIVE">Active</option>
              <option value="CLOSED">Closed</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {/* Scholarship Cards Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : filteredScholarships.length === 0 ? (
        <div className="card text-center py-12">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No scholarships found</h3>
          <p className="text-gray-500 mt-1">Check back later for new opportunities.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScholarships.map((scholarship, i) => (
            <motion.div
              key={scholarship.id}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              onClick={() => navigate(`/scholarships/${scholarship.id}`)}
              className="card hover:shadow-lg transition-shadow cursor-pointer group"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                    {scholarship.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">{scholarship.organizationName}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors flex-shrink-0 ml-2" />
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[scholarship.status] || 'bg-gray-100 text-gray-600'}`}>
                  {scholarship.status}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${orgTypeColors[scholarship.organizationType] || 'bg-gray-100 text-gray-600'}`}>
                  {scholarship.organizationType}
                </span>
                {scholarship.hasApplied && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                    Applied
                  </span>
                )}
                {isExpiringSoon(scholarship.applicationDeadline) && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 animate-pulse">
                    Expiring Soon
                  </span>
                )}
              </div>

              {/* Description */}
              {scholarship.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{scholarship.description}</p>
              )}

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <span className="font-medium">{formatCurrency(scholarship.amount, scholarship.currency)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span>{formatDate(scholarship.applicationDeadline)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-4 h-4 text-purple-500" />
                  <span>{scholarship.totalSlots ? `${scholarship.filledSlots}/${scholarship.totalSlots} slots` : 'Unlimited'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>{scholarship.applicationCount || 0} applicants</span>
                </div>
              </div>

              {/* Eligibility Preview */}
              {scholarship.eligibilityCriteria && Object.keys(scholarship.eligibilityCriteria).length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 font-medium mb-1">Eligibility:</p>
                  <div className="flex flex-wrap gap-1">
                    {scholarship.eligibilityCriteria.minCompositeScore != null && (
                      <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 rounded">
                        Min Score: {scholarship.eligibilityCriteria.minCompositeScore}
                      </span>
                    )}
                    {scholarship.eligibilityCriteria.grades?.map(g => (
                      <span key={g} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded">
                        Grade {g}
                      </span>
                    ))}
                    {scholarship.eligibilityCriteria.districts?.map(d => (
                      <span key={d} className="text-xs px-2 py-0.5 bg-green-50 text-green-700 rounded">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
