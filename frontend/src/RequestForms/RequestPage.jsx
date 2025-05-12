import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function RequestPage() {
  const navigate = useNavigate();

  const requestTypes = [
    { label: 'ערעור על ציון', path: 'appeal', color: 'from-pink-500 to-red-500' },
    { label: 'בקשה לפטור מקורס', path: 'exemption', color: 'from-yellow-400 to-yellow-600' },
    { label: 'בקשת מילואים', path: 'military', color: 'from-green-400 to-green-600' },
    { label: 'בקשה אחרת', path: 'other', color: 'from-indigo-400 to-blue-600' },
  ];

  return (
    <div className="max-w-5xl mx-auto py-12 px-8">
      <div className="bg-white rounded-3xl shadow-2xl p-10">
        <h1 className="text-4xl font-extrabold text-gray-800 text-center mb-10">
          הגשת בקשה חדשה
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {requestTypes.map((req) => (
            <button
              key={req.path}
              onClick={() => navigate(`/request/${req.path}`)}
              className={`py-6 px-4 rounded-xl shadow-md text-white font-semibold text-lg bg-gradient-to-r ${req.color} hover:scale-105 transform transition`}
            >
              {req.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
