import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function ResetPassword() {
  const { userId, token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [matchError, setMatchError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const hasUpper = str => /[A-Z]/.test(str);
  const hasLower = str => /[a-z]/.test(str);

  const isValidPassword = password.length >= 6 && hasUpper(password) && hasLower(password);

  useEffect(() => {
    if (confirm && password !== confirm) {
      setMatchError('הסיסמאות אינן תואמות');
    } else {
      setMatchError('');
    }
  }, [confirm, password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!isValidPassword || matchError) return;

    try {
      const res = await fetch(`http://localhost:8000/User/reset-password/${userId}/${token}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, confirm }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('✅ הסיסמה אופסה בהצלחה! מעביר לדף התחברות...');
        setShowModal(true);
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setMessage(data.error || '❌ שגיאה באיפוס');
      }
    } catch {
      setMessage('❌ שגיאת שרת');
    }
  };

  return (
    <section dir="rtl" className="bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col items-center justify-center px-4 relative">
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-white dark:bg-gray-800 px-6 py-10 rounded-lg text-center max-w-lg w-full">
            <img src="/logo.png" alt="Logo" className="mx-auto mb-6 w-20 h-20" />
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">הסיסמה אופסה!</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">הסיסמה החדשה נשמרה בהצלחה, תועבר לדף התחברות...</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-black text-white rounded hover:bg-gray-700"
            >
              עבור עכשיו
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-md bg-white rounded-lg shadow-md dark:border dark:bg-gray-800 dark:border-gray-700 p-6 space-y-6 text-right">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
          איפוס סיסמה
        </h2>

        <form noValidate onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">סיסמה חדשה</label>
            <input
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-black focus:border-black block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <h2 className="mt-3 mb-2 text-sm font-semibold text-gray-900 dark:text-white">הסיסמה חייבת לכלול:</h2>
            <ul className="max-w-md space-y-1 text-sm text-gray-500 list-inside dark:text-gray-400">
              <li className="flex items-center">
                <svg className={`w-4 h-4 me-2 ${password.length >= 6 ? 'text-green-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
                </svg>
                לפחות 6 תווים
              </li>
              <li className="flex items-center">
                <svg className={`w-4 h-4 me-2 ${/[A-Z]/.test(password) ? 'text-green-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
                </svg>
                לפחות אות גדולה באנגלית
              </li>
              <li className="flex items-center">
                <svg className={`w-4 h-4 me-2 ${/[a-z]/.test(password) ? 'text-green-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
                </svg>
                לפחות אות קטנה באנגלית
              </li>
            </ul>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">אימות סיסמה</label>
            <input
              type="password"
              placeholder="********"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-black focus:border-black block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            {matchError && (
              <p className="text-sm text-red-500 mt-1">{matchError}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full text-white bg-black hover:bg-gray-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
          >
            אפס סיסמה
          </button>

          {message && !showModal && (
            <p className="text-center text-sm text-indigo-400 font-semibold mt-2">{message}</p>
          )}
        </form>
      </div>
    </section>
  );
}