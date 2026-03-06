import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Unauthorized from './pages/Unauthorized';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import StudentManagement from './pages/school/StudentManagement';
import BulkUpload from './pages/school/BulkUpload';
import VerificationQueue from './pages/verification/VerificationQueue';
import AuditLogViewer from './pages/audit/AuditLogViewer';
import MeritLists from './pages/merit/MeritLists';
import AnalyticsDashboard from './pages/analytics/AnalyticsDashboard';
import StudentPerformance from './pages/performance/StudentPerformance';

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected routes — wrapped in Layout with sidebar */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Placeholder routes (will be implemented in later phases) */}
        <Route path="/performance" element={<StudentPerformance />} />
        <Route path="/performance/:studentId" element={<StudentPerformance />} />
        <Route path="/merit" element={<MeritLists />} />
        <Route path="/scholarships" element={<Placeholder title="Scholarships" />} />
        <Route path="/alerts" element={<Placeholder title="Alerts" />} />
        <Route path="/students" element={<StudentManagement />} />
        <Route path="/upload" element={<BulkUpload />} />
        <Route path="/certificates" element={<Placeholder title="Certificates" />} />
        <Route path="/verification" element={<VerificationQueue />} />
        <Route path="/analytics" element={<AnalyticsDashboard />} />
        <Route path="/applicants" element={<Placeholder title="Applicants" />} />
        <Route path="/audit-log" element={<AuditLogViewer />} />
        <Route path="/admin/users" element={<Placeholder title="User Management" />} />
        <Route path="/admin/institutions" element={<Placeholder title="Institutions" />} />
        <Route path="/admin/ml-models" element={<Placeholder title="ML Models" />} />
      </Route>

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function Placeholder({ title }) {
  return (
    <div className="card">
      <h1 className="text-xl font-bold text-gray-900">{title}</h1>
      <p className="text-gray-500 mt-2">This feature will be implemented in a future phase.</p>
    </div>
  );
}
