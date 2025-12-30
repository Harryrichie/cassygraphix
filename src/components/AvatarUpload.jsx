import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../config/supabaseConfig';

const AvatarUpload = ({  userId, email, name, username }) => {
  const [fetchedEmail, setFetchedEmail] = useState(null);

  useEffect(() => {
    if (!email) {
      const fetchUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) setFetchedEmail(user.email);
      };
      fetchUser();
    }
  }, [email]);

  const displayName = useMemo(() => {
    if (email) return email.split('@')[0];
    if (fetchedEmail) return fetchedEmail.split('@')[0];
    if (username) return username;
    if (name) return name;
    if (userId && typeof userId === 'string' && userId.includes('@')) return userId.split('@')[0];
    return 'User Avatar';
  }, [username, name, email, fetchedEmail, userId]);

  const { initials, bgColor } = useMemo(() => {
    const colors = ['#FF9AA2', '#FFB7B2', '#FFDAC1', '#E2F0CB', '#B5EAD7', '#C7CEEA', '#F8C8DC', '#E0BBE4'];
    
    let hash = 0;
    const seed = displayName || 'User';
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = colors[Math.abs(hash) % colors.length];

    let init = 'UA';
    if (displayName) {
      const cleanName = displayName.replace(/[^a-zA-Z0-9\s._-]/g, '');
      const parts = cleanName.split(/[\s._-]+/).filter(Boolean);
      if (parts.length >= 2) {
        init = (parts[0][0] + parts[1][0]).toUpperCase();
      } else if (cleanName.length >= 2) {
        init = cleanName.substring(0, 2).toUpperCase();
      } else if (cleanName.length === 1) {
        init = (cleanName[0] + cleanName[0]).toUpperCase();
      }
    }
    return { initials: init, bgColor: color };
  }, [displayName]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div 
        className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-indigo-500 flex items-center justify-center"
        style={{ backgroundColor: bgColor }}
      >
        <span className="text-3xl font-bold text-slate-700">{initials}</span>
      </div>
      <p className="text-sm font-medium text-slate-700">{displayName}</p>
    </div>
  );
};

export default AvatarUpload;