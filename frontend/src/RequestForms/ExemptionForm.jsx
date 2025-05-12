import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ExemptionForm() {
  const [formData, setFormData] = useState({
    course: '',
    previousInstitution: '',
    previousCourse: '',
    reason: '',
    file: null,
  });

  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(`http://localhost:8000/academics/api/courses/?department=${currentUser.department}`);
        const data = await res.json();
        setCourses(data);
      } catch (err) {
        console.error('שגיאה בטעינת קורסים:', err);
      }
    };

    if (currentUser.department) {
      fetchCourses();
    }
  }, [currentUser.department]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { course, previousInstitution, previousCourse, reason, file } = formData;

    if (!course || !previousInstitution || !previousCourse || !reason) {
      setError('נא למלא את כל השדות');
      return;
    }

    const payload = new FormData();
    payload.append('request_type', 'exemption');
    payload.append('subject', `פטור מקורס: ${course}`);
    payload.append(
      'description',
      `מוסד קודם: ${previousInstitution}\nשם הקורס במוסד קודם: ${previousCourse}\nנימוק: ${reason}`
    );
    payload.append('student', currentUser.id);
    if (file) {
      payload.append('attached_file', file);
    }

    try {
      const res = await fetch('http://localhost:8000/api/requests/create/', {
        method: 'POST',
        body: payload, // אל תציין Content-Type! fetch יטפל בזה לבד.
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
      <h2 className="text-3xl font-semibold mb-6 text-gray-700">בקשה לפטור מקורס</h2>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {success && <p className="text-green-600 mb-4">הבקשה נשלחה בהצלחה!</p>}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <select
          name="course"
          required
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="">בחר קורס מהמחלקה</option>
          {courses.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          name="previousInstitution"
          placeholder="מוסד קודם"
          required
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          name="previousCourse"
          placeholder="שם הקורס במוסד הקודם"
          required
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <textarea
          name="reason"
          placeholder="נימוק"
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

        <button type="submit" className="w-full py-2 bg-green-500 text-white rounded hover:bg-green-600">
          שלח בקשה
        </button>
      </form>
    </div>
  );
}
