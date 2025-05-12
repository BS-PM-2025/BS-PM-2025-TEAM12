import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AppealForm() {
  const [formData, setFormData] = useState({
    course: '',
    term: '',
    grade: '',
    reason: '',
    lecturer: '',
    file: null,
  });

  const [courses, setCourses] = useState([]);
  const [selectedLecturers, setSelectedLecturers] = useState([]);
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
    setFormData(prev => ({ ...prev, [name]: files ? files[0] : value }));

    if (name === 'course') {
      const selectedCourse = courses.find(c => c.name === value);
      setSelectedLecturers(selectedCourse?.lecturers || []);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { course, term, grade, reason, lecturer, file } = formData;

    if (!course || !term || !grade || !reason || !lecturer) {
      setError('נא למלא את כל השדות');
      return;
    }

    const payload = new FormData();
    payload.append('request_type', 'appeal');
    payload.append('subject', `ערעור על ציון - ${course}`);
    payload.append(
      'description',
      `קורס: ${course}\nמועד: ${term}\nציון: ${grade}\nנימוק: ${reason}`
    );
    payload.append('student', currentUser.id);
    payload.append('assigned_lecturer_id', lecturer);
    if (file) payload.append('attached_file', file);

    try {
      const res = await fetch('http://localhost:8000/api/requests/create/', {
        method: 'POST',
        body: payload,
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
      <h2 className="text-3xl font-semibold mb-6 text-gray-700">ערעור על ציון</h2>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {success && <p className="text-green-600 mb-4">הבקשה נשלחה בהצלחה!</p>}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <select name="course" required onChange={handleChange} className="w-full p-2 border rounded">
          <option value="">בחר קורס</option>
          {courses.map(c => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>

        {selectedLecturers.length > 0 && (
          <select name="lecturer" required onChange={handleChange} className="w-full p-2 border rounded">
            <option value="">בחר מרצה</option>
            {selectedLecturers.map(l => (
              <option key={l.id} value={l.id}>{l.full_name}</option>
            ))}
          </select>
        )}

        <select name="term" required onChange={handleChange} className="w-full p-2 border rounded">
          <option value="">מועד בחינה</option>
          <option value="A">מועד א׳</option>
          <option value="B">מועד ב׳</option>
        </select>

        <input
          type="number"
          name="grade"
          placeholder="ציון שהתקבל"
          required
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <textarea
          name="reason"
          placeholder="נימוק לערעור"
          required
          rows={4}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        ></textarea>

        <input
          type="file"
          name="file"
          onChange={handleChange}
          className="w-full p-2"
        />

        <button type="submit" className="w-full py-2 bg-indigo-500 text-white font-semibold rounded hover:bg-indigo-600">
          שלח בקשה
        </button>
      </form>
    </div>
  );
}
