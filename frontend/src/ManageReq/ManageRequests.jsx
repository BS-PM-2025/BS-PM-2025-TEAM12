import React, { useEffect, useState } from 'react';

export default function ManageRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [comments, setComments] = useState([]);

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  useEffect(() => {
    if (!currentUser?.role) return;

    const fetchRequests = async () => {
      try {
        const payload = currentUser.role === 'admin'
          ? { department_id: currentUser.department }
          : { lecturer_id: currentUser.id };

        const res = await fetch('http://localhost:8000/api/requests/manage/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error('Network error');
        const data = await res.json();
        setRequests(data);
      } catch (err) {
        console.error('שגיאה בטעינת הבקשות:', err);
        setError('שגיאה בטעינת הבקשות');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const fetchComments = async (requestId) => {
    try {
      const res = await fetch(`http://localhost:8000/api/requests/comments/${requestId}/`);
      if (!res.ok) throw new Error('Failed to load comments');
      const data = await res.json();
      setComments(data);
    } catch {
      setComments([]);
    }
  };

  const handleViewRequest = (r) => {
    setSelectedRequest(r);
    setFeedback('');
    fetchComments(r.id);
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await fetch(`http://localhost:8000/api/requests/update-status/${selectedRequest.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, feedback }),
      });
      setSelectedRequest(null);
      setFeedback('');
      setLoading(true);

      const payload = currentUser.role === 'admin'
        ? { department_id: currentUser.department }
        : { lecturer_id: currentUser.id };

      const res = await fetch('http://localhost:8000/api/requests/manage/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setRequests(data);
    } catch (err) {
      alert('שגיאה בעדכון הבקשה');
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (!feedback.trim()) return;

    try {
      await fetch(`http://localhost:8000/api/requests/comments/add/${selectedRequest.id}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author_id: currentUser.id,
          content: feedback,
        }),
      });
      setFeedback('');
      fetchComments(selectedRequest.id);
    } catch {
      alert('שגיאה בשליחת תגובה');
    }
  };

  const translateType = (type) => {
    switch (type) {
      case 'appeal': return 'ערעור על ציון';
      case 'exemption': return 'פטור מקורס';
      case 'military': return 'בקשת מילואים';
      case 'other': return 'בקשה אחרת';
      default: return type;
    }
  };

  const translateStatus = (status) => {
    switch (status) {
      case 'ממתין': return '⏳ ממתין';
      case 'בטיפול': return '🔄 בטיפול';
      case 'טופל': return '✅ טופל';
      default: return status;
    }
  };

  const grouped = {
    open: requests.filter(r => r.status !== 'טופל'),
    closed: requests.filter(r => r.status === 'טופל'),
  };

  const RequestTable = ({ title, items }) => (
    <div className="mt-10">
      <h3 className="text-2xl font-semibold text-gray-700 mb-3">{title}</h3>
      <table className="w-full table-auto border">
        <thead>
          <tr className="bg-gray-100 text-right">
            <th className="border px-4 py-2">סטודנט</th>
            <th className="border px-4 py-2">סוג</th>
            <th className="border px-4 py-2">נושא</th>
            <th className="border px-4 py-2">מרצה</th>
            <th className="border px-4 py-2">סטטוס</th>
            <th className="border px-4 py-2">תאריך</th>
            <th className="border px-4 py-2">פעולות</th>
          </tr>
        </thead>
        <tbody>
          {items.map((r) => (
            <tr key={r.id}>
              <td className="border px-4 py-2">{r.student_name}</td>
              <td className="border px-4 py-2">{translateType(r.request_type)}</td>
              <td className="border px-4 py-2">{r.subject}</td>
              <td className="border px-4 py-2">{r.assigned_lecturer?.full_name || '—'}</td>
              <td className="border px-4 py-2">{translateStatus(r.status)}</td>
              <td className="border px-4 py-2">{new Date(r.submitted_at).toLocaleDateString()}</td>
              <td className="border px-4 py-2 text-center">
                <button
                  onClick={() => handleViewRequest(r)}
                  className="text-blue-600 hover:underline"
                >
                  צפייה
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (loading) return <p className="p-6">טוען בקשות...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="max-w-6xl mx-auto py-10 px-6 bg-white rounded-xl shadow-xl">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">ניהול בקשות</h2>
      <RequestTable title="בקשות פתוחות" items={grouped.open} />
      <RequestTable title="בקשות שטופלו" items={grouped.closed} />

      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-2xl p-6 rounded-xl shadow-xl relative">
            <button
              onClick={() => setSelectedRequest(null)}
              className="absolute top-3 left-3 text-gray-500 hover:text-black"
            >
              ✖
            </button>

            <h3 className="text-xl font-bold mb-4 text-right">{selectedRequest.subject}</h3>
            <p className="mb-2 text-right"><strong>סוג:</strong> {translateType(selectedRequest.request_type)}</p>
            <p className="mb-2 text-right whitespace-pre-line"><strong>פירוט:</strong><br />{selectedRequest.description}</p>
            <p className="mb-2 text-right"><strong>סטטוס:</strong> {translateStatus(selectedRequest.status)}</p>
            <p className="mb-2 text-right"><strong>סטודנט:</strong> {selectedRequest.student_name}</p>
            <p className="mb-2 text-right"><strong>מרצה:</strong> {selectedRequest.assigned_lecturer?.full_name || '—'}</p>
            <p className="mb-2 text-right"><strong>תאריך:</strong> {new Date(selectedRequest.submitted_at).toLocaleDateString()}</p>

            {selectedRequest.attached_file && (
              <p className="mt-4 text-right">
                <a
                  href={`http://localhost:8000${selectedRequest.attached_file}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  📎 צפייה בקובץ המצורף
                </a>
              </p>
            )}

            <hr className="my-4" />
            <div className="text-right mb-2 font-semibold">שיחה:</div>
            <div className="bg-gray-100 p-3 rounded h-40 overflow-y-auto text-sm mb-4">
              {comments.length === 0 ? (
                <p className="text-gray-500 text-right">אין תגובות עדיין.</p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="mb-2 text-right">
                    <strong>{c.author_name}</strong>: {c.content}
                    <div className="text-xs text-gray-500">{new Date(c.timestamp).toLocaleString()}</div>
                  </div>
                ))
              )}
            </div>

            <textarea
              className="w-full border p-2 rounded text-right"
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="כתוב תגובה לסטודנט..."
            />

            <div className="flex justify-between mt-4">
              <button onClick={handleCommentSubmit} className="px-4 py-2 bg-blue-600 text-white rounded">
                שלח תגובה לסטודנט
              </button>
              <div className="flex gap-2">
                <button onClick={() => handleStatusUpdate('בטיפול')} className="px-4 py-2 bg-yellow-500 text-white rounded">
                  סמן כבטיפול
                </button>
                <button onClick={() => handleStatusUpdate('טופל')} className="px-4 py-2 bg-green-600 text-white rounded">
                  סמן כטופל
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
