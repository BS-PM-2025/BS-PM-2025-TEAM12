import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]); // לרשימת המחלקות

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    id_number: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    department: '',
    phone_number: ''
  });

  const [passwordError, setPasswordError] = useState('');
  const [matchError, setMatchError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const hasUpper = str => /[A-Z]/.test(str);
  const hasLower = str => /[a-z]/.test(str);

  // טען את המחלקות מה־API
  useEffect(() => {
    fetch('http://localhost:8000/academics/api/departments/')
      .then(res => res.json())
      .then(data => setDepartments(data))
      .catch(() => setDepartments([]));
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'password') {
      let err = '';
      if (value.length < 6) err = 'הסיסמה חייבת להכיל לפחות 6 תווים';
      else if (!hasUpper(value)) err = 'יש לכלול לפחות אות גדולה';
      else if (!hasLower(value)) err = 'יש לכלול לפחות אות קטנה';
      setPasswordError(err);
    }

    if (name === 'confirmPassword' || (name === 'password' && formData.confirmPassword)) {
      const pwd = name === 'password' ? value : formData.password;
      const conf = name === 'confirmPassword' ? value : formData.confirmPassword;
      setMatchError(pwd !== conf ? 'הסיסמאות אינן תואמות' : '');
    }
  };

  const validateForm = () => {
    const { full_name, email, id_number, password, confirmPassword, department, phone_number } = formData;
    if (!full_name || !email || !id_number || !password || !confirmPassword || !department || !phone_number) {
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

  const handleSubmit = async e => {
    e.preventDefault();
    setErrorMessage('');
    if (!validateForm()) return;

    const { confirmPassword, ...dataToSend } = formData;

    try {
      const res = await fetch('http://localhost:8000/User/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });
      const data = await res.json();
      if (res.ok) {
        setShowSuccessModal(true);
      } else {
        setErrorMessage(data.error || 'שגיאה כללית בהרשמה');
      }
    } catch {
      setErrorMessage('שגיאת שרת');
    }
  };

  return (
    <section dir="rtl" className="bg-gray-50 min-h-screen flex flex-col items-center justify-center px-4 relative">
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-white px-6 py-10 rounded-lg text-center max-w-lg w-full">
            <h1 className="text-2xl font-semibold mb-4">ברוך הבא למערכת!</h1>
            <p className="mb-6">הרשמתך הושלמה בהצלחה. תועבר לדף ההתחברות.</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-black text-white rounded hover:bg-gray-700"
            >
              עבור להתחברות
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 space-y-6 text-right">
        <h2 className="text-2xl font-bold">הרשמה למערכת</h2>
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* שם מלא */}
          <div>
            <label className="block mb-1">שם מלא</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          {/* אימייל */}
          <div>
            <label className="block mb-1">אימייל</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          {/* ת.ז. */}
          <div>
            <label className="block mb-1">תעודת זהות</label>
            <input
              type="text"
              name="id_number"
              value={formData.id_number}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          {/* מחלקה */}
          <div>
            <label className="block mb-1">מחלקה</label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            >
              <option value="">– בחר מחלקה –</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* טלפון */}
          <div>
            <label className="block mb-1">טלפון</label>
            <input
              type="text"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          {/* סיסמה */}
          <div>
            <label className="block mb-1">סיסמה</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
            <ul className="mt-2 text-sm space-y-1">
              <li className={formData.password.length >= 6 ? 'text-green-600' : ''}>✔ לפחות 6 תווים</li>
              <li className={hasUpper(formData.password) ? 'text-green-600' : ''}>✔ אות גדולה באנגלית</li>
              <li className={hasLower(formData.password) ? 'text-green-600' : ''}>✔ אות קטנה באנגלית</li>
            </ul>
            {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
          </div>

          {/* אישור סיסמה */}
          <div>
            <label className="block mb-1">אישור סיסמה</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
            {matchError && <p className="text-red-500 text-sm">{matchError}</p>}
          </div>

          {/* תפקיד */}
          <div>
            <label className="block mb-1">סוג משתמש</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            >
              <option value="student">סטודנט</option>
              <option value="lecturer">מרצה</option>
            </select>
          </div>

          {/* כפתור הרשמה */}
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
          >
            הירשם
          </button>

          {errorMessage && <p className="text-red-500 text-center">{errorMessage}</p>}

          <p className="text-center text-sm mt-4">
            כבר רשום? <a href="/" className="text-indigo-600 hover:underline">התחבר כאן</a>
          </p>
        </form>
      </div>
    </section>
  );
}
