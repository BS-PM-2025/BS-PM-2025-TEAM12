import React, { useEffect, useState } from 'react';

export default function ManageRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [comments, setComments] = useState([]);
  const [activeTab, setActiveTab] = useState('open');
  const [newComment, setNewComment] = useState('');

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
    setNewComment('');
    fetchComments(r.id);
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await fetch(`http://localhost:8000/api/requests/update-status/${selectedRequest.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, feedback }),
      });
      
      setSelectedRequest({...selectedRequest, status: newStatus, status_display: newStatus});
      
      setRequests(requests.map(r => 
        r.id === selectedRequest.id ? {...r, status: newStatus, status_display: newStatus} : r
      ));
      
      if (feedback.trim()) {
        await handleSendComment();
      }
    } catch (err) {
      alert('שגיאה בעדכון הבקשה');
    }
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

  const translateStatus = (statusDisplay) => {
    switch (statusDisplay) {
      case 'ממתין': return '⏳ ממתין';
      case 'בטיפול': return '🔄 בטיפול';
      case 'אושר': return '✅ אושר';
      case 'נדחה': return '❌ נדחה';
      default: return statusDisplay;
    }
  };

  const getStatusColor = (statusDisplay) => {
    switch (statusDisplay) {
      case 'ממתין': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'בטיפול': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'אושר': return 'bg-green-100 text-green-800 border-green-300';
      case 'נדחה': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const grouped = {
    open: requests.filter(r => r.status_display !== 'אושר' && r.status_display !== 'נדחה'),
    closed: requests.filter(r => r.status_display === 'אושר' || r.status_display === 'נדחה'),
  };
  const shownRequests = activeTab === 'open' ? grouped.open : grouped.closed;

  const getStatusCounts = () => {
    const total = requests.length;
    const pending = requests.filter(r => r.status_display === 'ממתין').length;
    const inProgress = requests.filter(r => r.status_display === 'בטיפול').length;
    const approved = requests.filter(r => r.status_display === 'אושר').length;
    const rejected = requests.filter(r => r.status_display === 'נדחה').length;
    
    return { total, pending, inProgress, approved, rejected };
  };

  const stats = getStatusCounts();

  const RequestRow = ({ request }) => (
    <div className="border rounded-lg overflow-hidden hover:shadow-md transition-all mb-4 bg-white">
      <div className="flex flex-col md:flex-row">
        <div className={`p-4 md:w-16 flex flex-row md:flex-col items-center justify-center ${getStatusColor(request.status_display)}`}>
          <div className="text-xl mb-0 md:mb-2">{request.status_display === 'ממתין' ? '⏳' : request.status_display === 'בטיפול' ? '🔄' : request.status_display === 'אושר' ? '✅' : '❌'}</div>
          <div className="text-xs font-medium mr-2 md:mr-0">{request.status_display}</div>
        </div>
        
        <div className="flex-1 p-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div>
              <h3 className="font-bold text-lg mb-1 truncate">{request.subject}</h3>
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                  {translateType(request.request_type)}
                </span>
                <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                  {new Date(request.submitted_at).toLocaleDateString()}
                </span>
              </div>
            </div>
                <button
              onClick={() => handleViewRequest(request)}
              className="mt-2 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white text-sm py-1 px-3 rounded-full transition-colors"
                >
              פרטים מלאים
                </button>
          </div>
          
          <div className="mt-2 flex flex-wrap justify-between items-end">
            <div className="flex-1">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-sm text-gray-700">{request.student_name}</span>
              </div>
              {request.assigned_lecturer && (
                <div className="flex items-center mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-gray-700">{request.assigned_lecturer.full_name || '—'}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">טוען בקשות...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-xl">
        <div className="p-6 text-center bg-red-50 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-red-800">{error}</h3>
          <p className="mt-2 text-red-600">אירעה שגיאה בטעינת הבקשות, אנא נסה שוב מאוחר יותר.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
      <div className="relative overflow-hidden bg-gradient-to-l from-blue-700 to-indigo-900 rounded-2xl shadow-xl mb-8">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <img src="/campus.png" alt="Campus" className="w-full h-full object-cover" />
        </div>
        <div className="relative p-8 md:p-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">ניהול בקשות</h1>
          <p className="text-blue-100 max-w-2xl">
            מרכז ניהול הבקשות במערכת מאפשר לך לצפות, לעדכן ולנהל את כל הבקשות של הסטודנטים תחת אחריותך.
          </p>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <div className="text-white text-sm opacity-80">סך הכל</div>
              <div className="text-white text-2xl font-bold">{stats.total}</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <div className="text-white text-sm opacity-80">ממתינות</div>
              <div className="text-white text-2xl font-bold">{stats.pending}</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <div className="text-white text-sm opacity-80">בטיפול</div>
              <div className="text-white text-2xl font-bold">{stats.inProgress}</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <div className="text-white text-sm opacity-80">הושלמו</div>
              <div className="text-white text-2xl font-bold">{stats.approved + stats.rejected}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between mb-6">
          <div className="mb-4 md:mb-0">
            <div className="flex space-x-1 rtl:space-x-reverse border rounded-lg p-1 bg-gray-50 text-sm">
              <button
                className={`py-2 px-4 rounded-md transition-colors font-medium ${activeTab === 'open' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
                onClick={() => setActiveTab('open')}
              >
                בקשות פתוחות ({grouped.open.length})
              </button>
              <button
                className={`py-2 px-4 rounded-md transition-colors font-medium ${activeTab === 'closed' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
                onClick={() => setActiveTab('closed')}
              >
                בקשות שטופלו ({grouped.closed.length})
              </button>
            </div>
          </div>
        </div>
        
        <div>
          {shownRequests.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-lg font-medium text-gray-800 mb-2">לא נמצאו בקשות</h3>
              <p className="text-gray-600">לא נמצאו בקשות להצגה</p>
            </div>
          ) : (
            <div>
              {shownRequests.map((request) => (
                <RequestRow key={request.id} request={request} />
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl relative mx-auto max-h-[90vh] flex flex-col">
            <button
              onClick={() => setSelectedRequest(null)}
              className="absolute top-3 left-3 text-gray-500 hover:text-gray-800 transition-colors bg-gray-100 hover:bg-gray-200 rounded-full p-2"
              aria-label="סגור"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <h2 className="text-2xl font-bold text-gray-900">{selectedRequest.subject}</h2>
                <div className={`py-1 px-3 rounded-full text-sm font-medium ${getStatusColor(selectedRequest.status_display)}`}>
                  {translateStatus(selectedRequest.status_display)}
                </div>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-4 pb-2 border-b text-blue-900">פרטי הבקשה</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium text-gray-600">סוג בקשה</div>
                      <div className="mt-1 text-gray-900">{translateType(selectedRequest.request_type)}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-gray-600">תיאור</div>
                      <div className="mt-1 text-gray-900 whitespace-pre-line bg-gray-50 p-3 rounded-lg border text-sm">
                        {selectedRequest.description}
                      </div>
                    </div>
                    
                    {selectedRequest.file && (
                      <div>
                        <div className="text-sm font-medium text-gray-600">קובץ מצורף</div>
                        <div className="mt-1">
                          <a 
                            href={selectedRequest.file}
                  target="_blank"
                  rel="noopener noreferrer"
                            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 2a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2V8.414A1 1 0 0015.414 8L11.586 4.172A1 1 0 0010.879 4H6zm3 2a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm1 3a1 1 0 00-1 1v3a1 1 0 102 0v-3a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            הצג קובץ מצורף
                          </a>
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-4 pt-4 border-t">
                      <div className="text-sm font-medium text-gray-600 mb-2">סטטוס</div>
                      <select 
                        value={selectedRequest.status_display}
                        onChange={(e) => handleStatusUpdate(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        <option value="ממתין">ממתין</option>
                        <option value="בטיפול">בטיפול</option>
                        <option value="אושר">אושר</option>
                        <option value="נדחה">נדחה</option>
                      </select>
                    </div>

                    <div className="mt-4">
                      <div className="text-sm font-medium text-gray-600 mb-2">פידבק (אופציונלי)</div>
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        rows={4}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="הוסף פידבק לבקשה..."
                      ></textarea>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-4 pb-2 border-b text-blue-900">תגובות</h3>
                  <div className="space-y-4 max-h-60 overflow-y-auto pr-3">
                    {comments.map((comment) => (
                      <div key={comment.id} className="bg-gray-50 p-3 rounded-lg text-sm border">
                        <div className="font-medium text-gray-900 mb-1">{comment.author_name}</div>
                        <div className="text-gray-700 whitespace-pre-line">{comment.content}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(comment.created_at).toLocaleString()}
                        </div>
                      </div>
                    ))}
                    {comments.length === 0 && (
                      <div className="text-center text-gray-500 py-4">אין תגובות לבקשה זו.</div>
              )}
            </div>

                  <div className="mt-4 pt-4 border-t">
                    <div className="text-sm font-medium text-gray-600 mb-2">הוסף תגובה</div>
            <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
              rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="כתוב תגובה כאן..."
                    ></textarea>
                    <button
                      onClick={handleSendComment}
                      disabled={!newComment.trim()}
                      className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      שלח תגובה
              </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}