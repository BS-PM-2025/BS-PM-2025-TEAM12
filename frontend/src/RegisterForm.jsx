import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    id_number: '',
    password: '',
    confirmPassword: '',
    role: 'student',
  });

  const [passwordError, setPasswordError] = useState('');
  const [matchError, setMatchError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const hasUpper = str => /[A-Z]/.test(str);
  const hasLower = str => /[a-z]/.test(str);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'password') {
      let error = '';
      if (value.length < 6) error = 'הסיסמה חייבת להכיל לפחות 6 תווים';
      else if (!hasUpper(value)) error = 'יש לכלול לפחות אות גדולה';
      else if (!hasLower(value)) error = 'יש לכלול לפחות אות קטנה';
      setPasswordError(error);
    }

    if (name === 'confirmPassword' || (name === 'password' && formData.confirmPassword)) {
      const pwd = name === 'password' ? value : formData.password;
      const confirm = name === 'confirmPassword' ? value : formData.confirmPassword;
      setMatchError(pwd !== confirm ? 'הסיסמאות אינן תואמות' : '');
    }
  };

  const validateForm = () => {
    const { full_name, email, id_number, password, confirmPassword } = formData;
    if (!full_name || !email || !id_number || !password || !confirmPassword) {
      setErrorMessage('אנא מלא את כל השדות');
      return false;
    }

    if (password.length < 6 || !hasUpper(password) || !hasLower(password)) {
      setErrorMessage('הסיסמה חייבת לכלול לפחות 6 תווים, אות גדולה ואות קטנה');
      return false;
    }

    if (password !== confirmPassword) {
      setErrorMessage('הסיסמאות אינן תואמות');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!validateForm()) return;

    const { confirmPassword, ...dataToSend } = formData;

    try {
      const res = await fetch('http://localhost:8000/User/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      const data = await res.json();
      if (res.ok) {
        setShowSuccessModal(true);
      } else {
        const msg = data.error || data.detail || 'שגיאה כללית בהרשמה';
        setErrorMessage(msg);
      }
    } catch {
      setErrorMessage('שגיאת שרת');
    }
  };

  return (
    <section dir="rtl" className="bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col items-center justify-center px-4 relative">
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-white dark:bg-gray-800 px-6 py-10 rounded-lg text-center max-w-lg w-full">
            <img src="/logo.png" alt="Logo" className="mx-auto mb-6 w-20 h-20" />
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">ברוך הבא למערכת!</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">הרשמתך הושלמה בהצלחה. תועבר כעת לדף ההתחברות.</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-black text-white rounded hover:bg-gray-700"
            >
              עבור להתחברות
            </button>
          </div>
        </div>
      )}

      <div className="mb-6">
        <img src="/logo.png" alt="EduPortal Logo" style={{ width: "220px", height: "220px" }} className="object-contain" />
      </div>

      <div className="w-full max-w-md bg-white rounded-lg shadow-md dark:bg-gray-800 p-6 space-y-6 text-right">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">הרשמה למערכת</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">שם מלא</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-black focus:border-black block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>

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
            <label className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">תעודת זהות</label>
            <input
              type="text"
              name="id_number"
              value={formData.id_number}
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
  <h2 className="mt-3 mb-2 text-sm font-semibold text-gray-900 dark:text-white">הסיסמה חייבת לכלול:</h2>
  <ul className="max-w-md space-y-1 text-sm text-gray-500 list-inside dark:text-gray-400">
    <li className="flex items-center">
      <svg className={`w-4 h-4 me-2 ${formData.password.length >= 6 ? 'text-green-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
      </svg>
      לפחות 6 תווים
    </li>
    <li className="flex items-center">
      <svg className={`w-4 h-4 me-2 ${/[A-Z]/.test(formData.password) ? 'text-green-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
      </svg>
      לפחות אות גדולה באנגלית
    </li>
    <li className="flex items-center">
      <svg className={`w-4 h-4 me-2 ${/[a-z]/.test(formData.password) ? 'text-green-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
      </svg>
      לפחות אות קטנה באנגלית
    </li>
  </ul>
</div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">אישור סיסמה</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-black focus:border-black block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
            {matchError && <p className="text-sm text-red-400 mt-1">{matchError}</p>}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">סוג משתמש</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-black focus:border-black block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="student">סטודנט</option>
              <option value="lecturer">מרצה</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full text-white bg-black hover:bg-gray-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
          >
            הירשם
          </button>

          {errorMessage && <p className="text-center text-sm text-red-500 font-semibold mt-2">{errorMessage}</p>}

          <div className="text-sm text-center mt-4 text-gray-600 dark:text-gray-300">
            כבר יש לך חשבון?{' '}
            <a href="/" className="text-indigo-600 hover:underline dark:text-indigo-400">
              התחבר כאן
            </a>
          </div>
        </form>
      </div>
    </section>
  );
}