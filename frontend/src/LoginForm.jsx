import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      const res = await fetch('http://localhost:8000/User/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
if (res.ok) {
  localStorage.setItem('currentUser', JSON.stringify(data));
  setShowSuccessModal(true);
  setTimeout(() => navigate('/dashboard'), 2000);
}
 else {
        setErrorMessage(data.error || '❌ פרטי התחברות שגויים');
      }
    } catch {
      setErrorMessage('❌ שגיאת שרת');
    }
  };

  return (
    <section dir="rtl" className="bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col items-center justify-center px-4 relative">
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-white dark:bg-gray-800 px-6 py-10 rounded-lg text-center max-w-lg w-full">
            <img src="/logo.png" alt="Logo" className="mx-auto mb-6 w-20 h-20" />
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">התחברת בהצלחה!</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">אתה מועבר כעת לדף הבית של המערכת...</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-black text-white rounded hover:bg-gray-700"
            >
              עבור עכשיו
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">התחברות למערכת</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">אימייל</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-black focus:border-black block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">סיסמה</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-black focus:border-black block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>

          <div className="text-sm text-left text-gray-500 dark:text-gray-300">
            <a href="/forgot-password" className="text-indigo-600 hover:underline dark:text-indigo-400">
              שכחת סיסמה?
            </a>
          </div>

          <button
            type="submit"
            className="w-full text-white bg-black hover:bg-gray-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
          >
            התחבר
          </button>

          {errorMessage && (
            <p className="text-center text-sm text-red-500 font-semibold mt-2">{errorMessage}</p>
          )}

          <div className="text-sm text-center mt-4 text-gray-600 dark:text-gray-300">
            אין לך עדיין חשבון?{' '}
            <a href="/register" className="text-indigo-600 hover:underline dark:text-indigo-400">
              הירשם כאן
            </a>
          </div>
        </form>
      </div>
    </section>
  );
}