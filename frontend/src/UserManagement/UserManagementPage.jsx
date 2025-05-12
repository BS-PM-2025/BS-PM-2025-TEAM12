// src/UserManagement/UserManagementPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const roleLabels = {
  student:  'סטודנט',
  lecturer: 'מרצה',
  admin:    'מזכירה',
};

export default function UserManagementPage() {
  const { departmentId } = useParams();
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    full_name: '',
    id_number: '',
    phone_number: '',
    role: '',
    department: '',
  });
  const [courseDialogUser, setCourseDialogUser] = useState(null);
  const [selectedCourses, setSelectedCourses] = useState([]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/api/users/department/${departmentId}/`);
      setUsers(res.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = () => {
    setEditingId(null);
  };

  const fetchDepartments = async () => {
    const res = await axios.get('http://localhost:8000/academics/api/departments/');
    setDepartments(res.data);
  };

  const fetchCourses = async () => {
    const res = await axios.get(`http://localhost:8000/academics/api/courses/?department=${departmentId}`);
    setCourses(res.data);
  };

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
    fetchCourses();
  }, [departmentId]);

  const handleEditClick = u => {
    setEditingId(u.id);
    setEditData({
      full_name: u.full_name,
      id_number: u.id_number,
      phone_number: u.phone_number || '',
      role: u.role,
      department: u.department,
    });
  };

  const handleEditChange = e => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveClick = async id => {
    try {
      await axios.put(`http://localhost:8000/User/update/${id}/`, editData);
      setEditingId(null);
      fetchUsers();
    } catch {
      alert('שגיאה בעדכון המשתמש');
    }
  };

  const handleDeleteClick = async id => {
    if (!window.confirm('בטוח שברצונך למחוק משתמש זה?')) return;
    try {
      await axios.delete(`http://localhost:8000/User/delete/${id}/`);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch {
      alert('שגיאה במחיקת המשתמש');
    }
  };

  const handleApprove = async id => {
    try {
      await axios.put(`http://localhost:8000/User/update/${id}/`, { is_approved: true });
      fetchUsers();
    } catch {
      alert('שגיאה באישור המרצה');
    }
  };

  const handleAssignCourses = (u) => {
    setCourseDialogUser(u);
    setSelectedCourses(u.courses || []);
  };

  const handleCourseChange = (id) => {
    setSelectedCourses(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const saveCourseAssignment = async () => {
    try {
      await axios.put(`http://localhost:8000/User/assign-courses/${courseDialogUser.id}/`, {
        course_ids: selectedCourses,
      });
      setCourseDialogUser(null);
      fetchUsers();
    } catch {
      alert('שגיאה בהשמת הקורסים');
    }
  };

  if (loading) return <p className="text-center py-12">טוען...</p>;
  if (error) return <p className="text-red-600 text-center py-12">שגיאה: {error.message}</p>;

  const students = users.filter(u => u.role === 'student');
  const approvedLecturers = users.filter(u => u.role === 'lecturer' && u.is_approved);
  const pendingLecturers = users.filter(u => u.role === 'lecturer' && !u.is_approved);

  const renderTable = (title, data, type) => (
    <section className="bg-white rounded-lg shadow p-6 mb-8">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-right text-sm">שם מלא</th>
              <th className="px-4 py-2 text-right text-sm">אימייל</th>
              <th className="px-4 py-2 text-right text-sm">ת"ז</th>
              <th className="px-4 py-2 text-right text-sm">טלפון</th>
              <th className="px-4 py-2 text-right text-sm">תפקיד</th>
              <th className="px-4 py-2 text-right text-sm">מחלקה</th>
              <th className="px-4 py-2 text-center text-sm">פעולות</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map(u => (
              <tr key={u.id}>
                {editingId === u.id && type !== 'pending' ? (
                  <>
                    <td className="px-4 py-2"><input name="full_name" value={editData.full_name} onChange={handleEditChange} className="w-full border rounded px-2 py-1 text-sm" /></td>
                    <td className="px-4 py-2 text-sm">{u.email}</td>
                    <td className="px-4 py-2"><input name="id_number" value={editData.id_number} onChange={handleEditChange} className="w-full border rounded px-2 py-1 text-sm" /></td>
                    <td className="px-4 py-2"><input name="phone_number" value={editData.phone_number} onChange={handleEditChange} className="w-full border rounded px-2 py-1 text-sm" /></td>
                    <td className="px-4 py-2">
                      <select name="role" value={editData.role} onChange={handleEditChange} className="w-full border rounded px-2 py-1 text-sm">
                        <option value="student">סטודנט</option>
                        <option value="lecturer">מרצה</option>
                        <option value="admin">מזכירה</option>
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <select name="department" value={editData.department} onChange={handleEditChange} className="w-full border rounded px-2 py-1 text-sm">
                        {departments.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2 text-center space-x-2">
                      <button onClick={() => handleSaveClick(u.id)} className="px-3 py-1 bg-green-500 text-white rounded text-sm">שמור</button>
                      <button onClick={handleCancelClick} className="px-3 py-1 bg-gray-400 text-white rounded text-sm">ביטול</button>
                    </td>
                  </>
                ) : type === 'pending' ? (
                  <>
                    <td className="px-4 py-2 text-sm">{u.full_name}</td>
                    <td className="px-4 py-2 text-sm">{u.email}</td>
                    <td className="px-4 py-2 text-sm">{u.id_number}</td>
                    <td className="px-4 py-2 text-sm">{u.phone_number}</td>
                    <td className="px-4 py-2 text-sm">{roleLabels[u.role]}</td>
                    <td className="px-4 py-2 text-sm">{departments.find(d => d.id === u.department)?.name}</td>
                    <td className="px-4 py-2 text-center">
                      <button onClick={() => handleApprove(u.id)} className="px-3 py-1 bg-green-500 text-white rounded text-sm">אשר</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-2 text-sm">{u.full_name}</td>
                    <td className="px-4 py-2 text-sm">{u.email}</td>
                    <td className="px-4 py-2 text-sm">{u.id_number}</td>
                    <td className="px-4 py-2 text-sm">{u.phone_number}</td>
                    <td className="px-4 py-2 text-sm">{roleLabels[u.role]}</td>
                    <td className="px-4 py-2 text-sm">{departments.find(d => d.id === u.department)?.name}</td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex gap-2 justify-center flex-wrap">
                        <button onClick={() => handleEditClick(u)} className="px-3 py-1 bg-blue-500 text-white rounded text-sm">ערוך</button>
                        <button onClick={() => handleDeleteClick(u.id)} className="px-3 py-1 bg-red-500 text-white rounded text-sm">מחק</button>
                        {u.role === 'lecturer' && (
                          <button onClick={() => handleAssignCourses(u)} className="px-3 py-1 bg-yellow-500 text-white rounded text-sm">השמת קורסים</button>
                        )}
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6 text-center">ניהול משתמשים</h1>
        {renderTable('סטודנטים', students, 'students')}
        {renderTable('מרצים מאושרים', approvedLecturers, 'approved')}
        {renderTable('מרצים ממתינים לאישור', pendingLecturers, 'pending')}

        {courseDialogUser && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-xl">
              <h2 className="text-xl font-semibold mb-4">השמת קורסים עבור {courseDialogUser.full_name}</h2>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {courses.map(c => (
                  <label key={c.id} className="block">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={selectedCourses.includes(c.id)}
                      onChange={() => handleCourseChange(c.id)}
                    />
                    {c.name}
                  </label>
                ))}
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => setCourseDialogUser(null)} className="px-4 py-2 bg-gray-400 text-white rounded">ביטול</button>
                <button onClick={saveCourseAssignment} className="px-4 py-2 bg-green-600 text-white rounded">שמור</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
