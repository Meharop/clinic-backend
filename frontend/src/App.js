// Main App Component - Handles routing
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import PatientDashboard from './components/PatientDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import ReceptionistDashboard from './components/ReceptionistDashboard';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  // Handle login
  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return <div className="text-center mt-20">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Login and Register routes */}
        <Route 
          path="/login" 
          element={user ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />} 
        />
        <Route 
          path="/register" 
          element={user ? <Navigate to="/dashboard" /> : <Register onRegister={handleLogin} />} 
        />
        
        {/* Dashboard route - shows different dashboard based on role */}
        <Route
          path="/dashboard"
          element={
            !user ? <Navigate to="/login" /> :
            user.role === 'patient' ? <PatientDashboard user={user} onLogout={handleLogout} /> :
            user.role === 'doctor' ? <DoctorDashboard user={user} onLogout={handleLogout} /> :
            user.role === 'receptionist' ? <ReceptionistDashboard user={user} onLogout={handleLogout} /> :
            user.role === 'admin' ? <AdminDashboard user={user} onLogout={handleLogout} /> :
            <div>Unknown role</div>
          }
        />
        
        {/* Default route */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;