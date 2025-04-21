import React, { useState } from 'react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowValidation(true);
    setMessage('');

    if (!email) return;

    try {
      const res = await fetch('http://localhost:8000/User/forgot-password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || '📧 קישור לאיפוס נשלח למייל');
        setShowModal(true);
      } else {
        setMessage(data.error || '❌ שגיאה בשליחת בקשה');
      }
    } catch (error) {
      setMessage('❌ שגיאה בשרת');
    }
  };

  return (
    <section dir="rtl" className="bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col items-center justify-center px-4 relative">
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-white dark:bg-gray-800 px-6 py-10 rounded-lg text-center max-w-lg w-full">
            <img src="/logo.png" alt="Logo" className="mx-auto mb-6 w-20 h-20" />
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">הבקשה התקבלה!</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">קישור לאיפוס סיסמה נשלח לכתובת האימייל שלך</p>
            <button
              onClick={() => setShowModal(false)}
              className="px-6 py-3 bg-black text-white rounded hover:bg-gray-700"
            >
              סגור
            </button>
          </div>
        </div>
      )}

      <div className="mb-6">
        <img
          src="/logo.png"
          alt="EduPortal Logo"
          className="object-contain"
          style={{ width: "220px", height: "220px" }}
        />
      </div>

      <div className="w-full max-w-md bg-white rounded-lg shadow-md dark:border dark:bg-gray-800 dark:border-gray-700 p-6 space-y-6 text-right">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
          שחזור סיסמה
        </h2>

        <form noValidate onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">
              כתובת מייל
            </label>
            <input
              type="email"
              placeholder="הכנס כתובת מייל"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`bg-gray-50 border ${showValidation && !email ? 'border-red-500 bg-red-50' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-black focus:border-black block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
            />
            {showValidation && !email && (
              <p className="text-sm text-red-500 mt-1">אנא הזן כתובת אימייל</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full text-white bg-black hover:bg-gray-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
          >
            שלח קישור לאיפוס
          </button>

          {message && !showModal && (
            <p className="text-center text-sm text-indigo-400 font-semibold mt-2">{message}</p>
          )}
        </form>

        <div className="text-sm text-center mt-4 text-gray-600 dark:text-gray-300">
          נזכרת בסיסמה?{' '}
          <a href="/" className="text-indigo-600 hover:underline dark:text-indigo-400">
            התחבר כאן
          </a>
        </div>
      </div>
    </section>
  );
}