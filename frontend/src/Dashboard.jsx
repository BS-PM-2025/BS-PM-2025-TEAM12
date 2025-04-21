import React, { useEffect, useState } from 'react';

function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div dir="rtl">
      {user ? (
        <>
          <div className="flex items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-gray-800">שלום {user.full_name} 👋</h1>
              <p className="text-gray-600 leading-relaxed max-w-2xl">
                ברוך הבא לפורטל EduPortal – המערכת האינטראקטיבית החדשה שתלווה אותך לאורך כל הדרך. כאן תוכל להגיש בקשות בקלות,
                לעקוב אחרי הסטטוס שלהן, לקבל התראות בזמן אמת ולשמור על תקשורת מסודרת עם הסגל האקדמי. הפלטפורמה תוכננה במיוחד
                כדי לפשט עבורך את תהליך ההתנהלות מול המוסד ולוודא שכל בקשה תקבל מענה מקצועי ומהיר.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">בקשות שנשלחו</h3>
              <p className="text-3xl font-bold text-indigo-600">12</p>
            </div>
            <div className="p-6 bg-white rounded shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">בקשות ממתינות</h3>
              <p className="text-3xl font-bold text-yellow-500">3</p>
            </div>
            <div className="p-6 bg-white rounded shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">בקשות שאושרו</h3>
              <p className="text-3xl font-bold text-green-500">9</p>
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-600"></div>
          <p className="text-gray-600">טוען מידע מהשרת...</p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
