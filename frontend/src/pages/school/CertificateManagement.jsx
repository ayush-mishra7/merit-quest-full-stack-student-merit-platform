import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Upload, Search, Trash2, Download, FileText, X } from 'lucide-react';
import api from '../../services/api';

export default function CertificateManagement() {
  const [studentId, setStudentId] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [students, setStudents] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: '', issuingBody: '', issueDate: '' });
  const fileRef = useRef(null);

  // Search students
  const searchStudents = useCallback(async () => {
    if (!studentSearch.trim()) return;
    try {
      const { data } = await api.get('/students', { params: { search: studentSearch, size: 10 } });
      setStudents(data.data.content || []);
    } catch {
      setStudents([]);
    }
  }, [studentSearch]);

  // Fetch certificates for selected student
  const fetchCerts = useCallback(async (sid) => {
    if (!sid) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/certificates/student/${sid}`);
      setCertificates(data.data || []);
    } catch {
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const selectStudent = (s) => {
    setStudentId(s.id);
    setStudentSearch(`${s.firstName} ${s.lastName} (${s.enrollmentNumber})`);
    setStudents([]);
    fetchCerts(s.id);
  };

  // Upload certificate
  const handleUpload = async (e) => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file || !studentId) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('data', new Blob([JSON.stringify({ ...form, studentId: Number(studentId) })], { type: 'application/json' }));
      await api.post('/certificates', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setShowUpload(false);
      setForm({ title: '', issuingBody: '', issueDate: '' });
      if (fileRef.current) fileRef.current.value = '';
      fetchCerts(studentId);
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Download
  const handleDownload = async (certId) => {
    try {
      const { data } = await api.get(`/certificates/${certId}/download`);
      window.open(data.data.url, '_blank');
    } catch {
      alert('Failed to get download link');
    }
  };

  // Delete
  const handleDelete = async (certId) => {
    if (!window.confirm('Delete this certificate?')) return;
    try {
      await api.delete(`/certificates/${certId}`);
      fetchCerts(studentId);
    } catch { /* ignore */ }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Certificates</h1>
          <p className="text-sm text-gray-500 mt-1">Upload and manage student certificates</p>
        </div>
      </div>

      {/* Student search */}
      <div className="card">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Student</label>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search student by name or enrollment..."
            value={studentSearch}
            onChange={(e) => { setStudentSearch(e.target.value); }}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); searchStudents(); } }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
          <button onClick={searchStudents} className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs bg-primary-600 text-white rounded-md hover:bg-primary-700">
            Search
          </button>
        </div>

        {/* Student dropdown */}
        {students.length > 0 && (
          <div className="mt-2 max-w-md bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {students.map(s => (
              <button key={s.id} onClick={() => selectStudent(s)}
                className="w-full text-left px-4 py-2 hover:bg-primary-50 text-sm flex justify-between">
                <span className="font-medium">{s.firstName} {s.lastName}</span>
                <span className="text-gray-400 font-mono text-xs">{s.enrollmentNumber}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Certificates list */}
      {studentId && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Certificates</h2>
            <button onClick={() => setShowUpload(true)}
              className="btn-primary flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
              <Upload className="w-4 h-4" /> Upload Certificate
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : certificates.length === 0 ? (
            <div className="card text-center py-12">
              <Award className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-4 text-gray-500">No certificates uploaded for this student</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {certificates.map(cert => (
                <motion.div key={cert.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="card p-4 flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <FileText className="w-8 h-8 text-primary-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{cert.title}</h3>
                      {cert.issuingBody && <p className="text-sm text-gray-500">{cert.issuingBody}</p>}
                      {cert.issueDate && <p className="text-xs text-gray-400 mt-1">{cert.issueDate}</p>}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">{cert.fileName} ({(cert.fileSize / 1024).toFixed(1)} KB)</div>
                  <div className="flex gap-2 mt-auto pt-2 border-t border-gray-100">
                    <button onClick={() => handleDownload(cert.id)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100">
                      <Download className="w-3 h-3" /> Download
                    </button>
                    <button onClick={() => handleDelete(cert.id)}
                      className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Upload modal */}
      <AnimatePresence>
        {showUpload && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold">Upload Certificate</h2>
                <button onClick={() => setShowUpload(false)} className="p-1 rounded-md hover:bg-gray-100"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleUpload} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                    className="input w-full" placeholder="e.g. Math Olympiad Gold Medal" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issuing Body</label>
                  <input value={form.issuingBody} onChange={e => setForm({...form, issuingBody: e.target.value})}
                    className="input w-full" placeholder="e.g. CBSE Board" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                  <input type="date" value={form.issueDate} onChange={e => setForm({...form, issueDate: e.target.value})}
                    className="input w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Certificate File *</label>
                  <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" required
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowUpload(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
                  <button type="submit" disabled={uploading}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50">
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
