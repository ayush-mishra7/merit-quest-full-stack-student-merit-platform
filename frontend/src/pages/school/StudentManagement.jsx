import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../services/api';

const GENDERS = ['MALE', 'FEMALE', 'OTHER'];

const emptyForm = {
  enrollmentNumber: '', firstName: '', lastName: '', dateOfBirth: '',
  gender: 'MALE', grade: '', section: '', guardianName: '',
  guardianPhone: '', guardianEmail: '', address: '',
};

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, size: 20 };
      if (gradeFilter) params.grade = gradeFilter;
      if (search) params.search = search;
      const { data } = await api.get('/students', { params });
      const pg = data.data;
      setStudents(pg.content || []);
      setTotalPages(pg.totalPages || 0);
    } catch {
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [page, gradeFilter, search]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setShowForm(true);
  };

  const openEdit = (student) => {
    setEditing(student.id);
    setForm({
      enrollmentNumber: student.enrollmentNumber,
      firstName: student.firstName,
      lastName: student.lastName,
      dateOfBirth: student.dateOfBirth,
      gender: student.gender,
      grade: student.grade,
      section: student.section || '',
      guardianName: student.guardianName || '',
      guardianPhone: student.guardianPhone || '',
      guardianEmail: student.guardianEmail || '',
      address: student.address || '',
    });
    setErrors({});
    setShowForm(true);
  };

  const validate = () => {
    const e = {};
    if (!form.enrollmentNumber.trim()) e.enrollmentNumber = 'Required';
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (!form.lastName.trim()) e.lastName = 'Required';
    if (!form.dateOfBirth) e.dateOfBirth = 'Required';
    if (!form.grade.trim()) e.grade = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (editing) {
        await api.put(`/students/${editing}`, form);
      } else {
        await api.post('/students', form);
      }
      setShowForm(false);
      fetchStudents();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save';
      setErrors({ _form: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this student?')) return;
    try {
      await api.delete(`/students/${id}`);
      fetchStudents();
    } catch { /* ignore */ }
  };

  // Server-side search — reset page when search changes
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage student records for your institution</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
          <Plus className="w-4 h-4" /> Add Student
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search by name or enrollment..." value={search} onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
        </div>
        <input type="text" placeholder="Filter by grade" value={gradeFilter} onChange={(e) => { setGradeFilter(e.target.value); setPage(0); }}
          className="w-40 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Enrollment #', 'Name', 'Grade', 'Gender', 'DOB', 'Guardian', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No students found</td></tr>
              ) : students.map((s) => (
                <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">{s.enrollmentNumber}</td>
                  <td className="px-4 py-3 font-medium">{s.firstName} {s.lastName}</td>
                  <td className="px-4 py-3">{s.grade}{s.section ? `-${s.section}` : ''}</td>
                  <td className="px-4 py-3 capitalize">{s.gender?.toLowerCase()}</td>
                  <td className="px-4 py-3">{s.dateOfBirth}</td>
                  <td className="px-4 py-3 text-gray-500">{s.guardianName || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(s)} className="p-1.5 text-gray-400 hover:text-primary-600 rounded-md hover:bg-primary-50"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(s.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <span className="text-sm text-gray-500">Page {page + 1} of {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                className="p-1.5 rounded-md border border-gray-300 disabled:opacity-40 hover:bg-white"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                className="p-1.5 rounded-md border border-gray-300 disabled:opacity-40 hover:bg-white"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold">{editing ? 'Edit Student' : 'Add Student'}</h2>
                <button onClick={() => setShowForm(false)} className="p-1 rounded-md hover:bg-gray-100"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {errors._form && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">{errors._form}</div>}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Enrollment #" error={errors.enrollmentNumber}>
                    <input value={form.enrollmentNumber} onChange={e => setForm({...form, enrollmentNumber: e.target.value})}
                      className="input" placeholder="e.g. STU-001" />
                  </Field>
                  <Field label="First Name" error={errors.firstName}>
                    <input value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} className="input" />
                  </Field>
                  <Field label="Last Name" error={errors.lastName}>
                    <input value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} className="input" />
                  </Field>
                  <Field label="Date of Birth" error={errors.dateOfBirth}>
                    <input type="date" value={form.dateOfBirth} onChange={e => setForm({...form, dateOfBirth: e.target.value})} className="input" />
                  </Field>
                  <Field label="Gender">
                    <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})} className="input">
                      {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </Field>
                  <Field label="Grade" error={errors.grade}>
                    <input value={form.grade} onChange={e => setForm({...form, grade: e.target.value})} className="input" placeholder="e.g. 10" />
                  </Field>
                  <Field label="Section">
                    <input value={form.section} onChange={e => setForm({...form, section: e.target.value})} className="input" placeholder="e.g. A" />
                  </Field>
                  <Field label="Guardian Name">
                    <input value={form.guardianName} onChange={e => setForm({...form, guardianName: e.target.value})} className="input" />
                  </Field>
                  <Field label="Guardian Phone">
                    <input value={form.guardianPhone} onChange={e => setForm({...form, guardianPhone: e.target.value})} className="input" />
                  </Field>
                  <Field label="Guardian Email">
                    <input type="email" value={form.guardianEmail} onChange={e => setForm({...form, guardianEmail: e.target.value})} className="input" />
                  </Field>
                </div>
                <Field label="Address">
                  <textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})} rows={2} className="input" />
                </Field>

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
                  <button type="submit" disabled={submitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50">
                    {submitting ? 'Saving...' : (editing ? 'Update' : 'Create')}
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

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
