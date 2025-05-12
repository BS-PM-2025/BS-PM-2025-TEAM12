import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MilitaryForm() {
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    unit: '',
    notes: '',
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
    const { startDate, endDate, unit, notes, file } = formData;

    if (!startDate || !unit) {
      setError('יש למלא לפחות שדה תאריך התחלה ויחידה');
      return;
    }

    const payload = new FormData();
    payload.append('request_type', 'military');
    payload.append('subject', `בקשת מילואים: ${unit}`);
    payload.append(
      'description',
      `מתאריך: ${startDate}\n` +
      `עד תאריך: ${endDate || 'לא צוין'}\n` +
      `יחידה: ${unit}\n` +
      `הערות: ${notes || '—'}`
    );
    payload.append('student', currentUser.id);
    if (file) payload.append('attached_file', file);

    try {
      const res = await fetch('http://localhost:8000/api/requests/create/', {
        method: 'POST',
        body: payload, // fetch מטפל בעצמו ב־Content-Type
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => navigate('/my-requests'), 2000);
      } else {
        console.error('❌ שגיאה מהשרת:', data);
        setError(data.error || 'שגיאה בשליחת הבקשה');
      }
    } catch {
      setError('❌ שגיאת רשת');
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-6 bg-white rounded-xl shadow-xl">
      <h2 className="text-3xl font-semibold mb-6 text-gray-700">בקשת מילואים</h2>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {success && <p className="text-green-600 mb-4">הבקשה נשלחה בהצלחה!</p>}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="text-gray-700">מתאריך (חובה)</span>
          <input
            type="date"
            name="startDate"
            required
            onChange={handleChange}
            className="w-full p-2 border rounded mt-1"
          />
        </label>

        <label className="block">
          <span className="text-gray-700">עד תאריך (לא חובה)</span>
          <input
            type="date"
            name="endDate"
            onChange={handleChange}
            className="w-full p-2 border rounded mt-1"
          />
        </label>

        <input
          type="text"
          name="unit"
          placeholder="יחידה / מספר צו"
          required
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <textarea
          name="notes"
          placeholder="הערות נוספות"
          rows={4}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        ></textarea>

        <input type="file" name="file" onChange={handleChange} className="w-full p-2" />

        <button type="submit" className="w-full py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">
          שלח בקשה
        </button>
      </form>
    </div>
  );
}
