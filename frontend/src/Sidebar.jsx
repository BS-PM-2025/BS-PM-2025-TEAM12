import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Sidebar() {
  const navigate = useNavigate();

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
        <div className="flex-1 px-3 bg-white divide-y space-y-1">
          <ul className="space-y-2 pb-2">
            <li>
              <Link to="/dashboard" className="text-base text-gray-900 font-normal rounded-lg flex items-center p-2 hover:bg-gray-100 group">
                <span>דף הבית</span>
              </Link>
            </li>
            <li>
              <Link to="/profile" className="text-base text-gray-900 font-normal rounded-lg flex items-center p-2 hover:bg-gray-100 group">
                <span>פרופיל</span>
              </Link>
            </li>
            <li>
              <Link to="/request" className="text-base text-gray-900 font-normal rounded-lg flex items-center p-2 hover:bg-gray-100 group">
                <span>הגש בקשה</span>
              </Link>
            </li>
            <li>
              <Link to="/my-requests" className="text-base text-gray-900 font-normal rounded-lg flex items-center p-2 hover:bg-gray-100 group">
                <span>הבקשות שלי</span>
              </Link>
            </li>
            <li>
              <button onClick={handleLogout} className="w-full text-base text-red-600 font-normal rounded-lg flex items-center p-2 hover:bg-red-100 group">
                <span>התנתק</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </aside>
  );
}
