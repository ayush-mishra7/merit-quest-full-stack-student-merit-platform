import { useState, useEffect, useCallback } from 'react';
import { Shield, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import api from '../../services/api';

export default function AuditLogViewer() {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [entityType, setEntityType] = useState('');
  const [entityId, setEntityId] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, size: 20 };
      if (entityType) params.entityType = entityType;
      if (entityId) params.entityId = entityId;
      const { data } = await api.get('/audit-logs', { params });
      const pg = data.data;
      setLogs(pg.content || []);
      setTotalPages(pg.totalPages || 0);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [page, entityType, entityId]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    fetchLogs();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Entity type..."
            value={entityType}
            onChange={(e) => setEntityType(e.target.value)}
            className="input w-36"
          />
          <input
            type="text"
            placeholder="Entity ID..."
            value={entityId}
            onChange={(e) => setEntityId(e.target.value)}
            className="input w-28"
          />
          <button type="submit" className="p-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors">
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : logs.length === 0 ? (
        <div className="card text-center py-12">
          <Shield className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-4 text-gray-500">No audit logs found</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Entity</th>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">IP Address</th>
                <th className="px-4 py-3 font-medium">Details</th>
                <th className="px-4 py-3 font-medium">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{log.entityType} #{log.entityId}</td>
                  <td className="px-4 py-3 text-gray-600">{log.userEmail}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{log.ipAddress}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">
                    {log.details ? JSON.stringify(log.details) : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
            className="p-2 rounded-lg border disabled:opacity-30">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-600">Page {page + 1} of {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
            className="p-2 rounded-lg border disabled:opacity-30">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
