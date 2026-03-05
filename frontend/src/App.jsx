import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Unauthorized from './pages/Unauthorized';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

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
        <Route path="/performance" element={<Placeholder title="Performance" />} />
        <Route path="/merit" element={<Placeholder title="Merit Lists" />} />
        <Route path="/scholarships" element={<Placeholder title="Scholarships" />} />
        <Route path="/alerts" element={<Placeholder title="Alerts" />} />
        <Route path="/students" element={<Placeholder title="Student Management" />} />
        <Route path="/upload" element={<Placeholder title="Bulk Upload" />} />
        <Route path="/certificates" element={<Placeholder title="Certificates" />} />
        <Route path="/verification" element={<Placeholder title="Verification Queue" />} />
        <Route path="/analytics" element={<Placeholder title="Analytics" />} />
        <Route path="/applicants" element={<Placeholder title="Applicants" />} />
        <Route path="/audit-log" element={<Placeholder title="Audit Log" />} />
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
