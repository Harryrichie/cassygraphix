import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 rounded-lg text-sm font-medium transition-all shadow-sm cursor-pointer"
          >
            <i className="fa-solid fa-right-from-bracket mr-2"></i> Sign Out
          </button>
        </div>
        
        {userId && (
          <div className="mb-8 p-6 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-between"> {/* Changed to flex items-center justify-between */}
            <div className="flex items-center gap-4"> {/* Container for avatar and text */}
              <AvatarUpload
                userId={userId}
              />
              <div>
                <h2 className="text-xl font-bold text-slate-900">Welcome, Admin!</h2>
                {lastSignInTime && (
                  <p className="text-sm text-slate-500">Last sign in: {new Date(lastSignInTime).toLocaleString()}</p>
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