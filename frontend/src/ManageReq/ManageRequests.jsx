import React, { useEffect, useState } from 'react';

export default function ManageRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [comments, setComments] = useState([]);
  const [activeTab, setActiveTab] = useState('open');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

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
      
      // עדכון מקומי של הסטטוס
      setSelectedRequest({...selectedRequest, status: newStatus});
      
      // עדכון הרשימה הראשית
      setRequests(requests.map(r => 
        r.id === selectedRequest.id ? {...r, status: newStatus} : r
      ));
      
      // שליחה של התגובה אם יש
      if (feedback.trim()) {
        await handleCommentSubmit();
      }
    } catch (err) {
      alert('שגיאה בעדכון הבקשה');
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
      case 'אושר': return '✅ אושר';
      case 'נדחה': return '❌ נדחה';
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ממתין': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'בטיפול': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'אושר': return 'bg-green-100 text-green-800 border-green-300';
      case 'נדחה': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const grouped = {
    open: requests.filter(r => r.status !== 'אושר' && r.status !== 'נדחה'),
    closed: requests.filter(r => r.status === 'אושר' || r.status === 'נדחה'),
  };

  // פונקציות סינון וחיפוש
  const filteredRequests = activeTab === 'open' ? grouped.open : grouped.closed;
  
  const searchedRequests = filteredRequests.filter(r => {
    const matchesSearch = searchTerm === '' || 
      r.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // רנדור לשורת טבלה בעיצוב חדש
  const RequestRow = ({ request }) => (
    <div className="border rounded-lg overflow-hidden hover:shadow-md transition-all mb-4 bg-white">
      <div className="flex flex-col md:flex-row">
        {/* סטטוס בצד ימין */}
        <div className={`p-4 md:w-16 flex flex-row md:flex-col items-center justify-center ${getStatusColor(request.status)}`}>
          <div className="text-xl mb-0 md:mb-2">{request.status === 'ממתין' ? '⏳' : request.status === 'בטיפול' ? '🔄' : request.status === 'אושר' ? '✅' : '❌'}</div>
          <div className="text-xs font-medium mr-2 md:mr-0">{request.status}</div>
        </div>
        
        {/* תוכן הבקשה */}
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
      {/* כותרת עם רקע גרדיאנט */}
      <div className="relative overflow-hidden bg-gradient-to-l from-blue-700 to-indigo-900 rounded-2xl shadow-xl mb-8">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <img src="/campus.png" alt="Campus" className="w-full h-full object-cover" />
        </div>
        <div className="relative p-8 md:p-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">ניהול בקשות</h1>
          <p className="text-blue-100 max-w-2xl">
            מרכז ניהול הבקשות במערכת מאפשר לך לצפות, לעדכן ולנהל את כל הבקשות של הסטודנטים תחת אחריותך.
          </p>
          
          {/* סטטיסטיקה מהירה */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <div className="text-white text-sm opacity-80">סך הכל</div>
              <div className="text-white text-2xl font-bold">{requests.length}</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <div className="text-white text-sm opacity-80">ממתינות</div>
              <div className="text-white text-2xl font-bold">{requests.filter(r => r.status === 'ממתין').length}</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <div className="text-white text-sm opacity-80">בטיפול</div>
              <div className="text-white text-2xl font-bold">{requests.filter(r => r.status === 'בטיפול').length}</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <div className="text-white text-sm opacity-80">הושלמו</div>
              <div className="text-white text-2xl font-bold">{requests.filter(r => r.status === 'אושר' || r.status === 'נדחה').length}</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* טאבים וסינון */}
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
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="חיפוש..."
                className="pl-4 pr-10 py-2 border rounded-lg w-full sm:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              className="border rounded-lg py-2 px-4"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">כל הסטטוסים</option>
              <option value="ממתין">ממתין</option>
              <option value="בטיפול">בטיפול</option>
              <option value="אושר">אושר</option>
              <option value="נדחה">נדחה</option>
            </select>
          </div>
        </div>
        
        {/* רשימת הבקשות - עיצוב חדש */}
        <div>
          {searchedRequests.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-lg font-medium text-gray-800 mb-2">לא נמצאו בקשות</h3>
              <p className="text-gray-600">לא נמצאו בקשות התואמות את הסינון שבחרת</p>
            </div>
          ) : (
            <div>
              {searchedRequests.map((request) => (
                <RequestRow key={request.id} request={request} />
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* מודאל פרטי בקשה */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl relative mx-auto max-h-[90vh] flex flex-col">
            {/* כפתור סגירה */}
            <button
              onClick={() => setSelectedRequest(null)}
              className="absolute top-3 left-3 text-gray-500 hover:text-gray-800 transition-colors bg-gray-100 hover:bg-gray-200 rounded-full p-2"
              aria-label="סגור"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* כותרת המודאל */}
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <h2 className="text-2xl font-bold text-gray-900">{selectedRequest.subject}</h2>
                <div className={`py-1 px-3 rounded-full text-sm font-medium ${getStatusColor(selectedRequest.status)}`}>
                  {translateStatus(selectedRequest.status)}
                </div>
              </div>
            </div>
            
            {/* תוכן המודאל */}
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
                    
                    {selectedRequest.attached_file && (
                      <div>
                        <div className="text-sm font-medium text-gray-600">קובץ מצורף</div>
                        <a
                          href={`http://localhost:8000${selectedRequest.attached_file}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 transition-colors px-3 py-2 rounded-lg"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          צפייה בקובץ
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-4 pb-2 border-b text-blue-900">פרטי הסטודנט</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="bg-blue-100 text-blue-800 rounded-full w-10 h-10 flex items-center justify-center font-bold ml-3">
                        {selectedRequest.student_name?.charAt(0) || "S"}
                      </div>
                      <div>
                        <div className="font-medium">{selectedRequest.student_name}</div>
                        <div className="text-sm text-gray-600">סטודנט</div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-gray-600">מרצה אחראי</div>
                      <div className="mt-1 text-gray-900">
                        {selectedRequest.assigned_lecturer?.full_name || '—'}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-gray-600">תאריך הגשה</div>
                      <div className="mt-1 text-gray-900">
                        {new Date(selectedRequest.submitted_at).toLocaleDateString('he-IL', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* אזור התגובות */}
              <div className="mt-8">
                <h3 className="font-semibold text-lg mb-4 pb-2 border-b text-blue-900">היסטוריית תגובות</h3>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-4 max-h-56 overflow-y-auto">
                  {comments.length === 0 ? (
                    <p className="text-gray-500 text-center py-6">אין תגובות עדיין</p>
                  ) : (
                    <div className="space-y-4">
                      {comments.map((c) => (
                        <div key={c.id} className={`flex ${c.author_id === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] rounded-lg p-3 ${c.author_id === currentUser.id ? 'bg-blue-100 text-blue-900' : 'bg-white border border-gray-200'}`}>
                            <div className="font-medium text-sm">{c.author_name}</div>
                            <p className="text-sm mt-1">{c.content}</p>
                            <div className="text-xs text-gray-500 mt-1 text-left">{new Date(c.timestamp).toLocaleString()}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* פעולות ותגובה */}
            <div className="p-6 border-t bg-gray-50">
              <textarea
                className="w-full border p-3 rounded-lg text-right mb-4 resize-none"
                rows={3}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="כתוב תגובה לסטודנט..."
              />
              
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <button 
                  onClick={handleCommentSubmit}
                  disabled={!feedback.trim()}
                  className={`${feedback.trim() ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'} text-white py-2 px-4 rounded-lg transition-colors`}
                >
                  שלח תגובה
                </button>
                
                <div className="flex items-center gap-3">
                  <span className="text-gray-700 whitespace-nowrap">עדכן סטטוס:</span>
                  <select 
                    className="border p-2 rounded-lg bg-white"
                    value={selectedRequest.status}
                    onChange={(e) => handleStatusUpdate(e.target.value)}
                  >
                    <option value="ממתין">ממתין</option>
                    <option value="בטיפול">בטיפול</option>
                    <option value="אושר">אושר</option>
                    <option value="נדחה">נדחה</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
