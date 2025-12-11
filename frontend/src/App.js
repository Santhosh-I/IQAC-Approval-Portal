import React from "react";
import { Routes, Route } from "react-router-dom";

import Login from "./components/Login";
import StaffHome from "./components/StaffHome";
import RoleDashboard from "./components/RoleDashboard";
import ApprovalLetter from "./components/ApprovalLetter";
import IQACHome from "./components/IQACHome";

import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import AddStaff from "./components/AddStaff";
import AddHod from "./components/AddHod";
import AdminAllRequests from "./components/AdminAllRequests";

import ProtectedRoute from "./components/ProtectedRoute";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} />

      <Routes>
        {/* Default Login */}
        <Route path="/" element={<Login />} />

        {/* Admin Login */}
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* Staff */}
        <Route
          path="/staff-home"
          element={
            <ProtectedRoute role="staff">
              <StaffHome />
            </ProtectedRoute>
          }
        />

        {/* IQAC */}
        <Route
          path="/iqac-home"
          element={
            <ProtectedRoute role="iqac">
              <IQACHome />
            </ProtectedRoute>
          }
        />

        {/* Role Users */}
        <Route
          path="/role/:roleKey"
          element={
            <ProtectedRoute>
              <RoleDashboard />
            </ProtectedRoute>
          }
        />

        {/* Report */}
        <Route
          path="/approval-letter/:id"
          element={
            <ProtectedRoute>
              <ApprovalLetter />
            </ProtectedRoute>
          }
        />

        {/* ========== ADMIN ROUTES ========== */}

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/add-staff"
          element={
            <ProtectedRoute role="admin">
              <AddStaff />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/add-hod"
          element={
            <ProtectedRoute role="admin">
              <AddHod />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/all-requests"
          element={
            <ProtectedRoute role="admin">
              <AdminAllRequests />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
