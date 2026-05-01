import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../config/supabaseConfig';
import UploadForm from '../components/UploadForm';
import AvatarUpload from '../components/AvatarUpload';
function Admin() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [lastSignInTime, setLastSignInTime] = useState(null);

  useEffect(() => {
    const fetchUserAndAvatar = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        setLastSignInTime(user.last_sign_in_at);
      } else {
        navigate('/signin');
      }
    };

    fetchUserAndAvatar();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        setLastSignInTime(session.user.last_sign_in_at);
      } else {
        setUserId(null);
        setLastSignInTime(null);
        navigate('/signin');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/signin');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
          <div className="flex items-center gap-3">
            <Link 
              to="/gallery-view"
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg text-sm font-medium transition-all shadow-sm cursor-pointer flex items-center"
            >
              <i className="fa-solid fa-images mr-2"></i> View Gallery
            </Link>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-red-600 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm font-medium transition-all shadow-sm cursor-pointer"
            >
              <i className="fa-solid fa-right-from-bracket mr-2"></i> Sign Out
            </button>
          </div>
        </div>
        
        {userId && (
          <div className="mb-8 p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between"> {/* Changed to flex items-center justify-between */}
            <div className="flex items-center gap-4"> {/* Container for avatar and text */}
              <AvatarUpload
                userId={userId}
              />
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Welcome, Admin!</h2>
                {lastSignInTime && (
                  <p className="text-sm text-slate-500 dark:text-slate-400">Last sign in: {new Date(lastSignInTime).toLocaleString()}</p>
                )}
              </div>
            </div>
          </div>
        )}

        <UploadForm />
      </div>
    </div>
  );
}

export default Admin;