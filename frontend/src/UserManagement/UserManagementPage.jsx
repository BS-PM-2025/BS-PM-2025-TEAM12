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
  const [users,     setUsers]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editData,  setEditData]  = useState({
    full_name:    '',
    id_number:    '',
    phone_number: '',
    role:         '',
  });

  // Fetch users
  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/users/department/${departmentId}/`
      );
      setUsers(res.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [departmentId]);

  // Start editing
  const handleEditClick = u => {
    setEditingId(u.id);
    setEditData({
      full_name:    u.full_name,
      id_number:    u.id_number,
      phone_number: u.phone_number || '',
      role:         u.role,
    });
  };

  // Input change
  const handleEditChange = e => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  // Save edits
  const handleSaveClick = async id => {
    try {
      await axios.put(
        `http://localhost:8000/User/update/${id}/`,
        editData
      );
      setEditingId(null);
      fetchUsers();
    } catch {
      alert('שגיאה בעדכון המשתמש');
    }
  };

  // Cancel edits
  const handleCancelClick = () => {
    setEditingId(null);
  };

  // Delete user
  const handleDeleteClick = async id => {
    if (!window.confirm('בטוח שברצונך למחוק משתמש זה?')) return;
    try {
      await axios.delete(`http://localhost:8000/User/delete/${id}/`);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch {
      alert('שגיאה במחיקת המשתמש');
    }
  };

  // Approve lecturer
  const handleApprove = async id => {
    try {
      await axios.put(
        `http://localhost:8000/User/update/${id}/`,
        { is_approved: true }
      );
      fetchUsers();
    } catch {
      alert('שגיאה באישור המרצה');
    }
  };

  if (loading) return <p className="text-center py-12">טוען...</p>;
  if (error)   return <p className="text-red-600 text-center py-12">שגיאה: {error.message}</p>;

  // Categorize
  const students          = users.filter(u => u.role === 'student');
  const approvedLecturers = users.filter(u => u.role === 'lecturer' && u.is_approved);
  const pendingLecturers  = users.filter(u => u.role === 'lecturer' && !u.is_approved);

  // Render a table section
  const renderTable = (title, data, type) => (
    <section className="bg-white rounded-lg shadow p-6 mb-8">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">שם מלא</th>
              <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">אימייל</th>
              <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">ת"ז</th>
              <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">טלפון</th>
              <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">תפקיד</th>
              <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">פעולות</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((u, i) => (
              <tr key={u.id} className={i % 2 ? 'bg-gray-50' : ''}>
                {editingId === u.id && type !== 'pending' ? (
                  <>
                    <td className="px-4 py-2 text-right">
                      <input
                        name="full_name"
                        value={editData.full_name}
                        onChange={handleEditChange}
                        className="w-full border rounded px-2 py-1 text-sm"
                      />
                    </td>
                    <td className="px-4 py-2 text-right text-sm text-gray-800">{u.email}</td>
                    <td className="px-4 py-2 text-right">
                      <input
                        name="id_number"
                        value={editData.id_number}
                        onChange={handleEditChange}
                        className="w-full border rounded px-2 py-1 text-sm"
                      />
                    </td>
                    <td className="px-4 py-2 text-right">
                      <input
                        name="phone_number"
                        value={editData.phone_number}
                        onChange={handleEditChange}
                        className="w-full border rounded px-2 py-1 text-sm"
                      />
                    </td>
                    <td className="px-4 py-2 text-right">
                      <select
                        name="role"
                        value={editData.role}
                        onChange={handleEditChange}
                        className="w-full border rounded px-2 py-1 text-sm"
                      >
                        <option value="student">סטודנט</option>
                        <option value="lecturer">מרצה</option>
                        <option value="admin">מזכירה</option>
                      </select>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleSaveClick(u.id)}
                          className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm"
                        >
                          שמור
                        </button>
                        <button
                          onClick={handleCancelClick}
                          className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm"
                        >
                          ביטול
                        </button>
                        <button
                          onClick={() => handleDeleteClick(u.id)}
                          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
                        >
                          מחק
                        </button>
                      </div>
                    </td>
                  </>
                ) : type === 'pending' ? (
                  <>
                    <td className="px-4 py-2 text-right text-sm text-gray-800">{u.full_name}</td>
                    <td className="px-4 py-2 text-right text-sm text-gray-800">{u.email}</td>
                    <td className="px-4 py-2 text-right text-sm text-gray-800">{u.id_number}</td>
                    <td className="px-4 py-2 text-right text-sm text-gray-800">{u.phone_number}</td>
                    <td className="px-4 py-2 text-right text-sm text-gray-800">{roleLabels[u.role]}</td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => handleApprove(u.id)}
                        className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm"
                      >
                        אשר
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-2 text-right text-sm text-gray-800">{u.full_name}</td>
                    <td className="px-4 py-2 text-right text-sm text-gray-800">{u.email}</td>
                    <td className="px-4 py-2 text-right text-sm text-gray-800">{u.id_number}</td>
                    <td className="px-4 py-2 text-right text-sm text-gray-800">{u.phone_number}</td>
                    <td className="px-4 py-2 text-right text-sm text-gray-800">{roleLabels[u.role]}</td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEditClick(u)}
                          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
                        >
                          ערוך
                        </button>
                        <button
                          onClick={() => handleDeleteClick(u.id)}
                          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
                        >
                          מחק
                        </button>
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
      </div>
    </div>
  );
}
