import React, { useEffect, useState } from 'react';

export default function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  useEffect(() => {
    async function fetchRequests() {
      try {
        const res = await fetch('http://localhost:8000/api/requests/by-student/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ student_id: currentUser.id }),
        });
        if (!res.ok) throw new Error('Response not OK');
        const data = await res.json();
        setRequests(data);
      } catch (err) {
        setError('שגיאה בטעינת הבקשות');
      } finally {
        setLoading(false);
      }
    }
    fetchRequests();
  }, []);

  const fetchComments = async (requestId) => {
    try {
      const res = await fetch(`http://localhost:8000/api/requests/comments/${requestId}/`);
      const data = await res.json();
      setComments(data);
    } catch (err) {
      console.error('שגיאה בטעינת תגובות:', err);
    }
  };

  const markCommentsAsRead = async (requestId) => {
    try {
      await fetch(`http://localhost:8000/api/requests/comments/mark-read/${requestId}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUser.id }),
      });
    } catch (err) {
      console.warn('שגיאה בסימון תגובות כנקראו');
    }
  };

  const handleOpenModal = async (req) => {
    setSelectedRequest(req);
    setNewComment('');
    await fetchComments(req.id);
    await markCommentsAsRead(req.id);  // סימון כנקראו
  };

  const handleSendComment = async () => {
    if (!newComment.trim()) return;
    try {
      await fetch(`http://localhost:8000/api/requests/comments/add/${selectedRequest.id}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author_id: currentUser.id,
          content: newComment,
        }),
      });
      setNewComment('');
      await fetchComments(selectedRequest.id);
    } catch {
      alert('שגיאה בשליחת התגובה');
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

  if (loading) return <p className="p-6">טוען בקשות...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="max-w-5xl mx-auto py-10 px-6 bg-white rounded-xl shadow-xl">
      <h2 className="text-3xl font-semibold text-gray-800 mb-6">הבקשות שלי</h2>

      {requests.length === 0 ? (
        <p className="text-center text-gray-500 mt-8 text-lg">לא נמצאו בקשות 🙁</p>
      ) : (
        <table className="w-full table-auto border">
          <thead>
            <tr className="bg-gray-100 text-right">
              <th className="border px-4 py-2">סוג</th>
              <th className="border px-4 py-2">נושא</th>
              <th className="border px-4 py-2">מרצה</th>
              <th className="border px-4 py-2">סטטוס</th>
              <th className="border px-4 py-2">תאריך</th>
              <th className="border px-4 py-2">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id}>
                <td className="border px-4 py-2">{translateType(r.request_type)}</td>
                <td className="border px-4 py-2">{r.subject}</td>
                <td className="border px-4 py-2">{r.assigned_lecturer?.full_name || '—'}</td>
                <td className="border px-4 py-2">{translateStatus(r.status)}</td>
                <td className="border px-4 py-2">{new Date(r.submitted_at).toLocaleDateString()}</td>
                <td className="border px-4 py-2 text-center">
                  <button
                    onClick={() => handleOpenModal(r)}
                    className="text-blue-600 hover:underline"
                  >
                    צפייה
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* מודאל צפייה */}
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
            <p className="text-right"><strong>סוג:</strong> {translateType(selectedRequest.request_type)}</p>
            <p className="text-right whitespace-pre-line"><strong>פירוט:</strong><br />{selectedRequest.description}</p>
            <p className="text-right"><strong>סטטוס:</strong> {translateStatus(selectedRequest.status)}</p>
            <p className="text-right"><strong>מרצה:</strong> {selectedRequest.assigned_lecturer?.full_name || '—'}</p>

            <p className="mt-6 mb-2 text-right font-bold">שיחה:</p>
            <div className="max-h-40 overflow-y-auto bg-gray-100 rounded p-3 text-sm text-right">
              {comments.length === 0 ? (
                <p className="text-gray-500">אין תגובות עדיין</p>
              ) : (
                comments.map(c => (
                  <p key={c.id} className="mb-2">
                    <strong>{c.author_name}: </strong>{c.content}
                    <div className="text-xs text-gray-400">{new Date(c.timestamp).toLocaleString()}</div>
                  </p>
                ))
              )}
            </div>

            <textarea
              className="w-full border mt-4 p-2 rounded text-right"
              rows={3}
              placeholder="כתוב תגובה..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handleSendComment}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                שלח תגובה
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
