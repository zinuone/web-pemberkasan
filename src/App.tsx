// File: src/App.tsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';

// FIX 1: Tambahkan kata 'type' sebelum User
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { auth } from './firebase';
import { LogOut, Loader2 } from 'lucide-react';

import FormPendaftaran from './pages/FormPendaftaran'; 
import AdminDashboard from './pages/AdminDashboard'; 
import Login from './pages/Login';

// FIX 2: Pindahkan PrivateRoute ke LUAR komponen App
const PrivateRoute = ({ 
  children, 
  user, 
  isAuthLoading 
}: { 
  children: React.ReactNode; 
  user: User | null; 
  isAuthLoading: boolean; 
}) => {
  if (isAuthLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>;
  }
  if (!user) {
    return <Navigate to="/login" />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Mengecek apakah ada admin yang sedang login
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <Router>
      <div className="min-h-screen bg-[#F8FAF9]">
        {/* Navbar */}
        <nav className="bg-white shadow-sm p-4 flex justify-between items-center border-b border-slate-200">
          <Link to="/" className="font-black text-xl text-slate-800 flex items-center hover:opacity-80 transition-opacity">
            <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex justify-center items-center mr-3 text-sm">✓</span>
            Web Pemberkasan
          </Link>
          
          {/* Tombol Login/Logout dinamis */}
          {user ? (
            <button onClick={handleLogout} className="text-sm font-bold text-rose-500 hover:text-rose-700 transition-colors flex items-center">
              <LogOut className="w-4 h-4 mr-1" /> Logout Admin
            </button>
          ) : (
            <Link to="/admin" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">
              Login Admin
            </Link>
          )}
        </nav>

        {/* Area Routing */}
        <Routes>
          {/* Rute Publik */}
          <Route path="/" element={<FormPendaftaran />} />
          <Route path="/login" element={<Login />} />
          
          {/* Rute Rahasia (Digembok) */}
          <Route 
            path="/admin" 
            element={
              <PrivateRoute user={user} isAuthLoading={isAuthLoading}>
                <AdminDashboard />
              </PrivateRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;