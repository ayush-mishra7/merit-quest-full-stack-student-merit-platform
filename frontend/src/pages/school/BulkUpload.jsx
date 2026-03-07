import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileSpreadsheet, CheckCircle2, XCircle, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import api from '../../services/api';

const STATUS_CONFIG = {
  PENDING:    { icon: Clock,        color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Pending' },
  PROCESSING: { icon: RefreshCw,    color: 'text-blue-600',   bg: 'bg-blue-50',   label: 'Processing' },
  COMPLETED:  { icon: CheckCircle2, color: 'text-green-600',  bg: 'bg-green-50',  label: 'Completed' },
  FAILED:     { icon: XCircle,      color: 'text-red-600',    bg: 'bg-red-50',    label: 'Failed' },
};

const UPLOAD_TYPES = [
  { value: 'STUDENTS', label: 'Students', columns: 'enrollment_number, first_name, last_name, date_of_birth (YYYY-MM-DD), gender (MALE/FEMALE/OTHER), grade', optional: 'section, guardian_name, guardian_phone, guardian_email, address' },
  { value: 'ACADEMIC_RECORDS', label: 'Academic Records', columns: 'enrollment_number, subject, exam_type, marks_obtained, max_marks, academic_year', optional: 'grade, semester' },
  { value: 'ATTENDANCE', label: 'Attendance', columns: 'enrollment_number, date (YYYY-MM-DD), status (PRESENT/ABSENT/LATE), academic_year', optional: 'period, remarks' },
  { value: 'ACTIVITIES', label: 'Activities', columns: 'enrollment_number, activity_name, activity_type, date (YYYY-MM-DD)', optional: 'description, achievement, points' },
];

export default function BulkUpload() {
  const [uploads, setUploads] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedUpload, setSelectedUpload] = useState(null);
  const [uploadType, setUploadType] = useState('STUDENTS');
  const fileInputRef = useRef(null);

  const fetchUploads = useCallback(async () => {
    try {
      const { data } = await api.get('/uploads', { params: { size: 50 } });
      setUploads(data.data.content || []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchUploads(); }, [fetchUploads]);

  const downloadTemplate = (type) => {
    const templates = {
      STUDENTS: 'enrollment_number,first_name,last_name,date_of_birth,gender,grade,section,guardian_name,guardian_phone,guardian_email,address\nSTU-001,Aarav,Sharma,2008-05-15,MALE,10,A,Rajesh Sharma,9876543210,rajesh@example.com,Mumbai',
      ACADEMIC_RECORDS: 'enrollment_number,subject,exam_type,marks_obtained,max_marks,academic_year,grade,semester\nSTU-001,Mathematics,MIDTERM,85,100,2025-2026,10,1',
      ATTENDANCE: 'enrollment_number,date,status,academic_year,period,remarks\nSTU-001,2025-01-15,PRESENT,2025-2026,1,On time',
      ACTIVITIES: 'enrollment_number,activity_name,activity_type,date,description,achievement,points\nSTU-001,Science Fair,ACADEMIC,2025-02-10,Built a solar model,First Prize,100',
    };
    const csv = templates[type] || '';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type.toLowerCase()}-template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Poll for processing uploads
  useEffect(() => {
    const processing = uploads.some(u => u.status === 'PENDING' || u.status === 'PROCESSING');
    if (!processing) return;
    const interval = setInterval(fetchUploads, 3000);
    return () => clearInterval(interval);
  }, [uploads, fetchUploads]);

  const handleUpload = async (file) => {
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(ext)) {
      alert('Please upload a CSV or Excel file');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', uploadType);
      await api.post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchUploads();
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const onFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bulk Upload</h1>
        <p className="text-sm text-gray-500 mt-1">Upload CSV or Excel files to import data</p>
      </div>

      {/* Upload type selector */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium text-gray-700">Upload Type:</label>
        {UPLOAD_TYPES.map(t => (
          <button key={t.value} onClick={() => setUploadType(t.value)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              uploadType === t.value
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}>{t.label}</button>
        ))}
      </div>

      {/* Drop zone */}
      <motion.div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-colors cursor-pointer
          ${dragOver ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'}`}
        onClick={() => fileInputRef.current?.click()}
        whileHover={{ scale: 1.005 }}
      >
        <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" onChange={onFileSelect} className="hidden" />

        <div className="flex flex-col items-center gap-3">
          {uploading ? (
            <RefreshCw className="w-12 h-12 text-primary-500 animate-spin" />
          ) : (
            <Upload className="w-12 h-12 text-gray-400" />
          )}
          <div>
            <p className="text-lg font-medium text-gray-700">
              {uploading ? 'Uploading...' : 'Drop your file here, or click to browse'}
            </p>
            <p className="text-sm text-gray-400 mt-1">Supports CSV, XLSX, XLS files</p>
          </div>
        </div>
      </motion.div>

      {/* Template info */}
      {(() => {
        const type = UPLOAD_TYPES.find(t => t.value === uploadType);
        return (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800 flex-1">
              <div className="flex items-center justify-between">
                <p className="font-medium">CSV/Excel Template — {type?.label}</p>
                <button onClick={() => downloadTemplate(uploadType)}
                  className="text-xs px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Download Template
                </button>
              </div>
              <p className="mt-1">Required columns: <span className="font-mono text-xs">{type?.columns}</span></p>
              <p className="mt-0.5">Optional columns: <span className="font-mono text-xs">{type?.optional}</span></p>
            </div>
          </div>
        );
      })()}

      {/* Upload history */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Upload History</h2>
        </div>

        {uploads.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <FileSpreadsheet className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>No uploads yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {uploads.map((u) => {
              const cfg = STATUS_CONFIG[u.status] || STATUS_CONFIG.PENDING;
              const Icon = cfg.icon;
              return (
                <motion.div key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="px-5 py-4 flex items-center gap-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedUpload(selectedUpload?.id === u.id ? null : u)}>
                  <div className={`p-2 rounded-lg ${cfg.bg}`}>
                    <Icon className={`w-5 h-5 ${cfg.color} ${u.status === 'PROCESSING' ? 'animate-spin' : ''}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{u.fileName}</p>
                    <p className="text-xs text-gray-400">{new Date(u.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
                      {cfg.label}
                    </span>
                    {u.status === 'COMPLETED' && (
                      <p className="text-xs text-gray-500 mt-1">
                        {u.successRows}/{u.totalRows} rows imported
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Error details panel */}
      <AnimatePresence>
        {selectedUpload && selectedUpload.errorDetails?.rowErrors && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-red-100 bg-red-50">
              <h3 className="font-semibold text-red-800">Row Errors — {selectedUpload.fileName}</h3>
              <p className="text-xs text-red-600 mt-1">{selectedUpload.failedRows} rows failed</p>
            </div>
            <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
              {selectedUpload.errorDetails.rowErrors.map((err, i) => (
                <div key={i} className="px-5 py-3 flex gap-3 text-sm">
                  <span className="font-mono text-red-500 shrink-0">Row {err.row}</span>
                  <span className="text-gray-700">{err.errors}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
