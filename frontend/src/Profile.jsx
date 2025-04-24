import React, { useState, useEffect } from 'react';

export default function Profile() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({ full_name: '', email: '' });
  const [passwordData, setPasswordData] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [passwordError, setPasswordError] = useState('');
  const [matchError, setMatchError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const hasUpper = str => /[A-Z]/.test(str);
  const hasLower = str => /[a-z]/.test(str);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setCurrentUser(parsedUser);
      setEditedData({
        full_name: parsedUser.full_name,
        email: parsedUser.email,
      });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordInput = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));

    if (name === 'new_password') {
      let error = '';
      if (value.length < 6) error = 'הסיסמה חייבת להכיל לפחות 6 תווים';
      else if (!hasUpper(value)) error = 'יש לכלול לפחות אות גדולה';
      else if (!hasLower(value)) error = 'יש לכלול לפחות אות קטנה';
      setPasswordError(error);
    }

    if (name === 'confirm_password' || (name === 'new_password' && passwordData.confirm_password)) {
      const pwd = name === 'new_password' ? value : passwordData.new_password;
      const confirm = name === 'confirm_password' ? value : passwordData.confirm_password;
      setMatchError(pwd !== confirm ? 'הסיסמאות אינן תואמות' : '');
    }
  };

  const showPopup = (message) => {
    setSuccessMessage(message);
    setShowSuccessModal(true);
    setTimeout(() => setShowSuccessModal(false), 3000);
  };

  const saveChanges = async () => {
    try {
      const response = await fetch(`http://localhost:8000/User/update/${currentUser.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedData),
      });

      const data = await response.json();

      if (response.ok) {
        const updatedUser = { ...currentUser, ...editedData };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
        setIsEditing(false);
        showPopup('הפרטים עודכנו בהצלחה!');
      } else {
        alert(data.error || 'שגיאה בעדכון הפרופיל');
      }
    } catch {
      alert('שגיאת רשת - נסה שוב מאוחר יותר');
    }
  };

  const handlePasswordChange = async () => {
    const { old_password, new_password, confirm_password } = passwordData;

    if (!old_password || !new_password || !confirm_password) {
      alert('יש למלא את כל שדות הסיסמה');
      return;
    }

    if (new_password.length < 6 || !hasUpper(new_password) || !hasLower(new_password)) {
      alert('הסיסמה חייבת לכלול לפחות 6 תווים, אות גדולה ואות קטנה');
      return;
    }

    if (new_password !== confirm_password) {
      alert('הסיסמאות אינן תואמות');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/User/change-password/${currentUser.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ old_password, new_password }),
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
        showPopup('הסיסמה עודכנה בהצלחה!');
      } else {
        alert(data.error || 'שגיאה בשינוי סיסמה');
      }
    } catch {
      alert('שגיאת רשת - נסה שוב מאוחר יותר');
    }
  };

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-600 text-xl">
        לא התחברת למערכת
      </div>
    );
  }

  return (
    <div dir="rtl" className="p-6 relative">
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-white dark:bg-gray-800 px-6 py-10 rounded-lg text-center max-w-lg w-full">
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4"></h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{successMessage}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-8 max-w-4xl mx-auto">
        <div className="text-center sm:text-right space-y-3 w-full">
          {isEditing ? (
            <>
              <input
                type="text"
                name="full_name"
                value={editedData.full_name}
                onChange={handleChange}
                className="w-full border p-2 rounded text-right"
              />
              <input
                type="email"
                name="email"
                value={editedData.email}
                onChange={handleChange}
                className="w-full border p-2 rounded text-right"
              />
              <button
                onClick={saveChanges}
                className="mt-2 px-5 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
              >
                שמור שינויים
              </button>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-1">{currentUser.full_name}</h2>
              <p className="text-gray-700">
                <strong>אימייל:</strong> {currentUser.email}
              </p>
              <p className="text-gray-700">
                <strong>תפקיד:</strong> {currentUser.role}
              </p>
              <button
                onClick={() => setIsEditing(true)}
                className="mt-2 px-5 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
              >
                ערוך פרופיל
              </button>
            </>
          )}
        </div>

        <div className="mt-10 border-t pt-6">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">📋 מידע נוסף</h3>
          <ul className="text-gray-700 space-y-2 text-lg">
            <li>
              📅 <strong>תאריך הרשמה:</strong>{' '}
              {currentUser.registration_date
                ? new Date(currentUser.registration_date).toLocaleDateString()
                : 'לא זמין'}
            </li>
            <li>
              🛡️ <strong>הרשאות:</strong>{' '}
              {currentUser.role === 'admin' ? 'מנהל מערכת' : 'משתמש רגיל'}
            </li>
            <li>
              🆔 <strong>מזהה מערכת:</strong> {currentUser.id}
            </li>
            <li>
              📍 <strong>סטטוס:</strong> פעיל
            </li>
          </ul>
        </div>

        <div className="mt-10 border-t pt-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">🔐 שינוי סיסמה</h3>
          <div className="space-y-3 max-w-md">
            <input
              type="password"
              placeholder="סיסמה נוכחית"
              className="w-full border p-2 rounded text-right"
              name="old_password"
              value={passwordData.old_password}
              onChange={handlePasswordInput}
            />
            <input
              type="password"
              placeholder="סיסמה חדשה"
              className="w-full border p-2 rounded text-right"
              name="new_password"
              value={passwordData.new_password}
              onChange={handlePasswordInput}
            />
            <ul className="text-sm text-gray-600 dark:text-gray-400">
              <li className={`flex items-center ${passwordData.new_password.length >= 6 ? 'text-green-600' : ''}`}>
                <span className="mr-2">✔</span>   לפחות 6 תווים
              </li>
              <li className={`flex items-center ${hasUpper(passwordData.new_password) ? 'text-green-600' : ''}`}>
                <span className="mr-2">✔</span>  לפחות אות גדולה באנגלית
              </li>
              <li className={`flex items-center ${hasLower(passwordData.new_password) ? 'text-green-600' : ''}`}>
                <span className="mr-2">✔</span> לפחות אות קטנה באנגלית
              </li>
            </ul>
            <input
              type="password"
              placeholder="אישור סיסמה חדשה"
              className="w-full border p-2 rounded text-right"
              name="confirm_password"
              value={passwordData.confirm_password}
              onChange={handlePasswordInput}
            />
            {matchError && <p className="text-sm text-red-500">{matchError}</p>}
            <button
              onClick={handlePasswordChange}
              className="mt-2 px-5 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
            >
              עדכן סיסמה
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}