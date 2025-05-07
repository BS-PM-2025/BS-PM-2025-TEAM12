// src/Profile.jsx

import React, { useState, useEffect } from 'react';

export default function Profile() {
  const [currentUser, setCurrentUser] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    full_name: '',
    email: '',
    phone_number: ''
  });
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [matchError, setMatchError] = useState('');

  const hasUpper = str => /[A-Z]/.test(str);
  const hasLower = str => /[a-z]/.test(str);

  useEffect(() => {
    fetch('http://localhost:8000/academics/api/departments/')
      .then(res => res.json())
      .then(data => setDepartments(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      const user = JSON.parse(stored);
      setCurrentUser(user);
      setEditedData({
        full_name: user.full_name,
        email: user.email,
        phone_number: user.phone_number || ''
      });
    }
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setEditedData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordInput = e => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));

    if ((name === 'confirm_password' || name === 'new_password') && passwordData.new_password) {
      const newPwd = name === 'new_password' ? value : passwordData.new_password;
      const conf  = name === 'confirm_password' ? value : passwordData.confirm_password;
      setMatchError(newPwd !== conf ? 'הסיסמאות אינן תואמות' : '');
    }
  };

  const showPopup = msg => {
    setSuccessMessage(msg);
    setShowSuccessModal(true);
    setTimeout(() => setShowSuccessModal(false), 3000);
  };

  const saveChanges = async () => {
    try {
      const res = await fetch(
        `http://localhost:8000/User/update/${currentUser.id}/`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editedData)
        }
      );
      const data = await res.json();
      if (res.ok) {
        const updated = { ...currentUser, ...editedData };
        localStorage.setItem('currentUser', JSON.stringify(updated));
        setCurrentUser(updated);
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
      const res = await fetch(
        `http://localhost:8000/User/change-password/${currentUser.id}/`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ old_password, new_password })
        }
      );
      const data = await res.json();
      if (res.ok) {
        setPasswordData({ old_password:'', new_password:'', confirm_password:'' });
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

  const deptName = departments.find(d => d.id === currentUser.department)?.name || 'לא מוגדר';

  return (
    <div dir="rtl" className="p-6 relative">
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-white dark:bg-gray-800 px-6 py-10 rounded-lg text-center max-w-lg w-full">
            <p className="text-gray-800 dark:text-white">{successMessage}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-8 max-w-4xl mx-auto">
        {/* פרטי משתמש */}
        <div className="text-center sm:text-right space-y-4 w-full">
          {isEditing ? (
            <>
              <div>
                <label className="block mb-1 font-medium">שם מלא:</label>
                <input
                  name="full_name"
                  value={editedData.full_name}
                  onChange={handleChange}
                  className="w-full border p-2 rounded text-right"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">אימייל:</label>
                <input
                  name="email"
                  value={editedData.email}
                  onChange={handleChange}
                  className="w-full border p-2 rounded text-right"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">טלפון:</label>
                <input
                  name="phone_number"
                  value={editedData.phone_number}
                  onChange={handleChange}
                  className="w-full border p-2 rounded text-right"
                />
              </div>
              <button
                onClick={saveChanges}
                className="mt-4 px-5 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
              >
                שמור שינויים
              </button>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-1">
                {currentUser.full_name}
              </h2>
              <p><strong>אימייל:</strong> {currentUser.email}</p>
              <p><strong>טלפון:</strong> {currentUser.phone_number || 'לא זמין'}</p>
              <p><strong>תפקיד:</strong> {currentUser.role}</p>
              <p><strong>מחלקה:</strong> {deptName}</p>
              <button
                onClick={() => setIsEditing(true)}
                className="mt-2 px-5 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
              >
                ערוך פרופיל
              </button>
            </>
          )}
        </div>

        {/* שינוי סיסמה */}
        <div className="mt-10 border-t pt-6">
          <h3 className="text-xl font-semibold mb-4">🔐 שינוי סיסמה</h3>
          <div className="space-y-3 max-w-md ml-auto text-right">
            <input
              name="old_password"
              type="password"
              placeholder="סיסמה נוכחית"
              value={passwordData.old_password}
              onChange={handlePasswordInput}
              className="w-full border p-2 rounded text-right"
            />
            <input
              name="new_password"
              type="password"
              placeholder="סיסמה חדשה"
              value={passwordData.new_password}
              onChange={handlePasswordInput}
              className="w-full border p-2 rounded text-right"
            />
            <input
              name="confirm_password"
              type="password"
              placeholder="אימות סיסמה חדשה"
              value={passwordData.confirm_password}
              onChange={handlePasswordInput}
              className="w-full border p-2 rounded text-right"
            />
            {matchError && <p className="text-red-500 text-sm">{matchError}</p>}
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
