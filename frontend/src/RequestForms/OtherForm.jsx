import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function OtherForm() {
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    file: null,
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { subject, description, file } = formData;

    if (!subject || !description) {
      setError('נא למלא את כל השדות');
      return;
    }

    const payload = new FormData();
    payload.append('request_type', 'other');
    payload.append('subject', subject);
    payload.append('description', description);
    payload.append('student', currentUser.id);
    if (file) payload.append('attached_file', file);

    try {
      const res = await fetch('http://localhost:8000/api/requests/create/', {
        method: 'POST',
        body: payload, // fetch יגדיר את ה־boundary לבד
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => navigate('/my-requests'), 2000);
      } else {
        console.error('❌ שגיאת שרת:', data);
        setError(data.error || 'שגיאה בשליחת הבקשה');
      }
    } catch {
      setError('❌ שגיאת רשת');
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-6 bg-white rounded-xl shadow-xl">
      <h2 className="text-3xl font-semibold mb-6 text-gray-700">בקשה אחרת</h2>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {success && <p className="text-green-600 mb-4">הבקשה נשלחה בהצלחה!</p>}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          type="text"
          name="subject"
          placeholder="נושא הבקשה"
          required
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <textarea
          name="description"
          placeholder="תיאור הבקשה"
          rows={4}
          required
          onChange={handleChange}
          className="w-full p-2 border rounded"
        ></textarea>

        <input
          type="file"
          name="file"
          onChange={handleChange}
          className="w-full p-2"
        />

        <button
          type="submit"
          className="w-full py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          שלח בקשה
        </button>
      </form>
    </div>
  );
}
