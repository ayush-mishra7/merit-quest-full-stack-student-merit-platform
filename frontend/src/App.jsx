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
import ScholarshipList from './pages/scholarship/ScholarshipList';
import ScholarshipDetail from './pages/scholarship/ScholarshipDetail';
import ScholarshipForm from './pages/scholarship/ScholarshipForm';
import AlertPanel from './pages/ml/AlertPanel';
import MLModelManagement from './pages/ml/MLModelManagement';
import UserManagement from './pages/admin/UserManagement';
import InstitutionManagement from './pages/admin/InstitutionManagement';
import CertificateManagement from './pages/school/CertificateManagement';

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

        {/* Student & Parent */}
        <Route path="/performance" element={<ProtectedRoute roles={['STUDENT','PARENT','SCHOOL_ADMIN','SYSTEM_ADMIN']}><StudentPerformance /></ProtectedRoute>} />
        <Route path="/performance/:studentId" element={<ProtectedRoute roles={['STUDENT','PARENT','SCHOOL_ADMIN','SYSTEM_ADMIN']}><StudentPerformance /></ProtectedRoute>} />
        <Route path="/my-applications" element={<ProtectedRoute roles={['STUDENT']}><ScholarshipList myApplications /></ProtectedRoute>} />

        {/* Scholarships — viewable by many, create/edit restricted */}
        <Route path="/merit" element={<MeritLists />} />
        <Route path="/scholarships" element={<ScholarshipList />} />
        <Route path="/scholarships/:id" element={<ScholarshipDetail />} />
        <Route path="/scholarships/create" element={<ProtectedRoute roles={['NGO_REP','GOV_AUTHORITY','SYSTEM_ADMIN']}><ScholarshipForm /></ProtectedRoute>} />
        <Route path="/scholarships/:id/edit" element={<ProtectedRoute roles={['NGO_REP','GOV_AUTHORITY','SYSTEM_ADMIN']}><ScholarshipForm /></ProtectedRoute>} />

        {/* School Admin */}
        <Route path="/students" element={<ProtectedRoute roles={['SCHOOL_ADMIN','SYSTEM_ADMIN']}><StudentManagement /></ProtectedRoute>} />
        <Route path="/upload" element={<ProtectedRoute roles={['SCHOOL_ADMIN','SYSTEM_ADMIN']}><BulkUpload /></ProtectedRoute>} />
        <Route path="/certificates" element={<ProtectedRoute roles={['SCHOOL_ADMIN','SYSTEM_ADMIN']}><CertificateManagement /></ProtectedRoute>} />
        <Route path="/alerts" element={<ProtectedRoute roles={['STUDENT','PARENT','SCHOOL_ADMIN','SYSTEM_ADMIN']}><AlertPanel /></ProtectedRoute>} />

        {/* Data Verifier */}
        <Route path="/verification" element={<ProtectedRoute roles={['DATA_VERIFIER','SCHOOL_ADMIN','SYSTEM_ADMIN']}><VerificationQueue /></ProtectedRoute>} />

        {/* Analytics — multi-role */}
        <Route path="/analytics" element={<ProtectedRoute roles={['SCHOOL_ADMIN','NGO_REP','GOV_AUTHORITY','SYSTEM_ADMIN']}><AnalyticsDashboard /></ProtectedRoute>} />

        {/* NGO */}
        <Route path="/applicants" element={<ProtectedRoute roles={['NGO_REP','GOV_AUTHORITY','SYSTEM_ADMIN']}><ScholarshipList applicantView /></ProtectedRoute>} />

        {/* Audit */}
        <Route path="/audit-log" element={<ProtectedRoute roles={['DATA_VERIFIER','GOV_AUTHORITY','SYSTEM_ADMIN']}><AuditLogViewer /></ProtectedRoute>} />

        {/* System Admin */}
        <Route path="/admin/users" element={<ProtectedRoute roles={['SYSTEM_ADMIN']}><UserManagement /></ProtectedRoute>} />
        <Route path="/admin/institutions" element={<ProtectedRoute roles={['SYSTEM_ADMIN']}><InstitutionManagement /></ProtectedRoute>} />
        <Route path="/admin/ml-models" element={<ProtectedRoute roles={['SYSTEM_ADMIN']}><MLModelManagement /></ProtectedRoute>} />
      </Route>

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}


