// src/components/Sidebar.jsx

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Sidebar() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  // קחו בחשבון שה־login מחזיר שדה "department", לא "departmentId"
  const role = currentUser.role;
  const departmentId = currentUser.departmentId ?? currentUser.department;

  // (אופציונלי) הדפיסו לקונסול לבדיקה:
  console.log('🔍 currentUser in Sidebar:', currentUser);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  return (
    <aside className="fixed z-20 h-full top-0 right-0 flex flex-col w-64 border-l border-gray-200 bg-white">
      <div className="flex flex-col items-center py-6">
        <img src="/logo.png" alt="Logo" className="w-40 h-40 mb-4" />
        <h1 className="text-xl font-bold text-gray-800">ברוך הבא!</h1>
      </div>

      <div className="flex-1 flex flex-col pb-4 overflow-y-auto">
        <ul className="px-3 space-y-2">
          <li>
            <Link to="/dashboard" className="flex items-center p-2 rounded hover:bg-gray-100">
              דף הבית
            </Link>
          </li>
          <li>
            <Link to="/profile" className="flex items-center p-2 rounded hover:bg-gray-100">
              פרופיל
            </Link>
          </li>

          {role === 'admin' && departmentId != null && (
            <li>
              <Link
                to={`/user-management/users/${departmentId}`}
                className="flex items-center p-2 rounded hover:bg-gray-100"
              >
                ניהול משתמשים
              </Link>
            </li>
          )}

          <li>
            <Link to="/request" className="flex items-center p-2 rounded hover:bg-gray-100">
              הגש בקשה
            </Link>
          </li>
          <li>
            <Link to="/my-requests" className="flex items-center p-2 rounded hover:bg-gray-100">
              הבקשות שלי
            </Link>
          </li>
          <li>
            <button
              onClick={handleLogout}
              className="w-full text-red-600 flex items-center p-2 rounded hover:bg-red-100"
            >
              התנתק
            </button>
          </li>
        </ul>
      </div>
    </aside>
);
}
