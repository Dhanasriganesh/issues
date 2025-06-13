import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Admin from '../pages/Admin';
import Client from '../pages/Client';
import ClientHead from '../pages/ClientHead';
import Employee from '../pages/Employee';
import ProjectManager from '../pages/ProjectManager';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin" />;
      case 'client':
        return <Navigate to="/client" />;
      case 'clientHead':
        return <Navigate to="/client-head" />;
      case 'employee':
        return <Navigate to="/employee" />;
      case 'projectManager':
        return <Navigate to="/project-manager" />;
      default:
        return <Navigate to="/login" />;
    }
  }

  return children;
};

const AppRouter = () => {
  const { user } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              {user && (
                <Navigate
                  to={
                    {
                      admin: '/admin',
                      client: '/client',
                      clientHead: '/client-head',
                      employee: '/employee',
                      projectManager: '/project-manager',
                    }[user.role] || '/login'
                  }
                />
              )}
            </PrivateRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <Admin />
            </PrivateRoute>
          }
        />

        <Route
          path="/client"
          element={
            <PrivateRoute allowedRoles={['client']}>
              <Client />
            </PrivateRoute>
          }
        />

        <Route
          path="/client-head"
          element={
            <PrivateRoute allowedRoles={['clientHead']}>
              <ClientHead />
            </PrivateRoute>
          }
        />

        <Route
          path="/employee"
          element={
            <PrivateRoute allowedRoles={['employee']}>
              <Employee />
            </PrivateRoute>
          }
        />

        <Route
          path="/project-manager"
          element={
            <PrivateRoute allowedRoles={['projectManager']}>
              <ProjectManager />
            </PrivateRoute>
          }
        />

        {/* Default Route */}
        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default AppRouter; 