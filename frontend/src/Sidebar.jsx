// src/components/Sidebar.jsx

import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Sidebar() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const dropdownRef = useRef(null);

  // ── here we pull the logged-in user out of localStorage ───────────────────────
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const role = currentUser.role;                                      // fixes “role is not defined”
  const departmentId = currentUser.departmentId ?? currentUser.department; // fixes “departmentId is not defined”

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  // fetch unread notifications
  const fetchNotifications = async () => {
    if (!currentUser.id) return;
    try {
      const res = await fetch(
        `http://localhost:8000/api/notifications/unread/${currentUser.id}/`
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      setNotifications(data);
    } catch {
      setNotifications([]);
    }
  };

  // mark all as read
  const markAllAsRead = async () => {
    if (!currentUser.id) return;
    try {
      await fetch(
        `http://localhost:8000/api/notifications/mark-read/${currentUser.id}/`,
        { method: 'POST' }
      );
      setNotifications([]);
      setShowNotifs(false);
    } catch {
      alert('שגיאה בסימון כנקראו');
    }
  };

  // dismiss a single notification
  const markOneAsRead = async (id) => {
    // call same endpoint then remove locally
    await fetch(
      `http://localhost:8000/api/notifications/mark-read/${currentUser.id}/`,
      { method: 'POST' }
    );
    setNotifications(notifications.filter(n => n.id !== id));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // close dropdown on outside click
  useEffect(() => {
    const onClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    };
    if (showNotifs) document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [showNotifs]);

  return (
    <aside className="fixed z-20 h-full top-0 right-0 flex flex-col w-64 border-l bg-white shadow-lg">
      {/* Logo + Welcome + Notifications */}
      <div className="flex flex-col items-center py-6 border-b relative">
        <img src="/logo.png" alt="Logo" className="w-36 h-36 mb-2" />
        <h1 className="text-xl font-bold mb-2">ברוך הבא!</h1>

        <div className="relative" ref={dropdownRef}>
          {/* bell + badge */}
          <button
            onClick={() => {
              setShowNotifs(v => !v);
              if (!showNotifs) fetchNotifications();
            }}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6
                   0 10-12 0v3.159c0 .538-.214 1.055-.595
                   1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {notifications.length > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 animate-pulse">
                {notifications.length}
              </span>
            )}
          </button>

          {/* dropdown panel */}
          {showNotifs && (
            <div className="absolute top-full mt-2 right-0 w-80 bg-white border rounded-lg shadow-xl">
              <div className="flex justify-between items-center px-4 py-2 border-b">
                <span className="font-semibold text-gray-700 text-sm">התראות</span>
                {notifications.length > 0 && (
                  <button onClick={markAllAsRead} className="text-blue-600 text-xs hover:underline">
                    סמן כנקראו
                  </button>
                )}
              </div>
              <div className="max-h-56 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="p-4 text-center text-gray-500 text-sm">אין התראות חדשות</p>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      className="flex justify-between items-start px-4 py-2 hover:bg-gray-50"
                    >
                      <div>
                        <p className="text-gray-800 text-sm">{n.message}</p>
                        <p className="text-gray-400 text-xs mt-1">
                          {new Date(n.created_at).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => markOneAsRead(n.id)}
                        className="text-green-600 hover:text-green-800 ml-2"
                        title="סמן נקרא"
                      >
                        ✓
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 flex flex-col pb-4 overflow-y-auto">
        <ul className="px-3 space-y-2 mt-4">
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
          {role === 'student' && (
            <>
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
            </>
          )}
          {['lecturer', 'admin'].includes(role) && (
            <li>
              <Link to="/manage-requests" className="flex items-center p-2 rounded hover:bg-gray-100">
                ניהול בקשות
              </Link>
            </li>
          )}
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
