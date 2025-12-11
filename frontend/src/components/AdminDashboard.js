import React from "react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/admin-login");
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Admin Dashboard</h2>

      <div className="text-end mb-3">
        <span className="me-3 fw-bold text-primary">Welcome, {user?.name}</span>
        <button className="btn btn-danger btn-sm" onClick={logout}>
          Logout
        </button>
      </div>

      <div className="row g-4 justify-content-center">

        {/* Add Staff */}
        <div className="col-md-4">
          <div
            className="card shadow text-center p-4"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/admin/add-staff")}
          >
            <h4>Add Staff</h4>
            <p className="text-muted">Create new staff accounts</p>
          </div>
        </div>

        {/* Add HOD */}
        <div className="col-md-4">
          <div
            className="card shadow text-center p-4"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/admin/add-hod")}
          >
            <h4>Add HOD</h4>
            <p className="text-muted">Assign HOD for each department</p>
          </div>
        </div>

        {/* All Requests */}
        <div className="col-md-4">
          <div
            className="card shadow text-center p-4"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/admin/all-requests")}
          >
            <h4>All Requests</h4>
            <p className="text-muted">View every request submitted by staff</p>
          </div>
        </div>

      </div>
    </div>
  );
}
