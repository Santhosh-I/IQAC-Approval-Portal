import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchRequestsForRole,
  actOnRequest,
  getFreshReportUrl,
} from "../api";
import { toast } from "react-toastify";
import useDisableBack from "./useDisableBack";
import "./Dashboard.css";
import logo from '../assets/kite-logo.png';

function RoleDashboard() {
  // ------------------------------------------
  // HOOKS
  // ------------------------------------------
  const { roleKey } = useParams();
  const role = roleKey.toUpperCase();

  const navigate = useNavigate();
  useDisableBack();

  const user = JSON.parse(localStorage.getItem("user"));
  const [requests, setRequests] = useState([]);

  const [comments, setComments] = useState({}); // comment per request
  
  // Filter states
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterEventName, setFilterEventName] = useState("");
  
  // Modal state for viewing remarks
  const [showRemarksModal, setShowRemarksModal] = useState(false);
  const [selectedRequestRemarks, setSelectedRequestRemarks] = useState(null);

  // ------------------------------------------
  // LOGOUT
  // ------------------------------------------
  const logout = () => {
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  // ------------------------------------------
  // LOAD REQUESTS FOR ROLE
  // ------------------------------------------
  const loadRequests = async () => {
    try {
      // If HOD, pass department to filter requests by their department
      const department = role === "HOD" ? user?.department : null;
      const res = await fetchRequestsForRole(role, department);
      setRequests(res.data);
    } catch {
      toast.error("Failed to load requests");
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  // ------------------------------------------
  // VIEW REPORT - Fetch fresh signed URL
  // ------------------------------------------
  const handleViewReport = async (id) => {
    try {
      const res = await getFreshReportUrl(id);
      if (res.data.url) {
        window.open(res.data.url, "_blank");
      }
    } catch {
      toast.error("Failed to load report");
    }
  };

  // ------------------------------------------
  // COMMENT HANDLER
  // ------------------------------------------
  const handleCommentChange = (id, value) => {
    setComments((prev) => ({ ...prev, [id]: value }));
  };

  // ------------------------------------------
  // VIEW REMARKS
  // ------------------------------------------
  const handleViewRemarks = (request) => {
    setSelectedRequestRemarks({
      eventName: request.eventName,
      eventDate: request.eventDate,
      staffName: request.staffName,
      department: request.department,
      approvals: request.approvals || []
    });
    setShowRemarksModal(true);
  };

  // ------------------------------------------
  // APPROVE
  // ------------------------------------------
  const handleApprove = async (id) => {
    const commentText = comments[id] || "";

    try {
      await actOnRequest(id, {
        action: "approve",
        comments: commentText,
      });

      toast.success("Approved!");
      loadRequests();
    } catch {
      toast.error("Approval failed");
    }
  };

  // ------------------------------------------
  // RECREATE
  // ------------------------------------------
  const handleRecreate = async (id) => {
    const commentText = comments[id];

    if (!commentText || commentText.trim() === "") {
      return toast.error("Comments are required for recreate!");
    }

    try {
      await actOnRequest(id, {
        action: "recreate",
        comments: commentText,
      });

      toast.success("Sent back for recreation!");
      loadRequests();
    } catch {
      toast.error("Recreate failed");
    }
  };

  // ------------------------------------------
  // UNAUTHORIZED
  // ------------------------------------------
  if (!user || user.role.toUpperCase() !== role) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-wrapper">
          <div className="dashboard-card">
            <div className="dashboard-card-header danger">
              <h4>⚠️ Unauthorized Access</h4>
            </div>
            <div className="dashboard-card-body" style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>You do not have permission to access this page.</p>
              <button
                className="btn-primary-custom"
                onClick={() => navigate("/", { replace: true })}
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Filter requests based on department and event name
  const filteredRequests = requests.filter((req) => {
    const matchesDepartment = filterDepartment === "" || req.department === filterDepartment;
    const matchesEventName = filterEventName === "" || req.eventName.toLowerCase().includes(filterEventName.toLowerCase());
    return matchesDepartment && matchesEventName;
  });

  // Get unique departments for filter dropdown
  const departments = [...new Set(requests.map(req => req.department))].sort();

  // ------------------------------------------
  // MAIN RENDER
  // ------------------------------------------
  return (
    <div className="dashboard-page">
      <div className="dashboard-wrapper">
        {/* HEADER */}
        <div className="dashboard-header fade-in">
          <div className="dashboard-header-accent"></div>
          <div className="dashboard-header-content">
            <div className="dashboard-header-left">
              <div className="dashboard-logo-box">
                <img src={logo} alt="KITE Logo" className="dashboard-logo" />
              </div>
              <div className="dashboard-title-section">
                <h1>{role} Dashboard</h1>
                <p>Review and approve event requests</p>
              </div>
            </div>
            <div className="dashboard-header-right">
              <div className="dashboard-user-info">
                <div className="dashboard-user-name">Welcome, {user?.name}</div>
                <div className="dashboard-user-role">{role}</div>
              </div>
              <button className="btn-logout" onClick={logout}>
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* REQUESTS TABLE */}
        <div className="dashboard-card fade-in">
          <div className="dashboard-card-header">
            <h4>📋 Pending Requests</h4>
            <p>Requests awaiting your approval</p>
          </div>
          <div className="dashboard-card-body">
            {requests.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">✅</div>
                <h4>No pending requests</h4>
                <p>All caught up! No requests are waiting for your approval.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>Staff</th>
                      <th>Department</th>
                      <th>Event Date</th>
                      <th>Report</th>
                      <th>Comments</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((r) => (
                      <tr key={r._id}>
                        <td><strong>{r.eventName}</strong></td>
                        <td>{r.staffName}</td>
                        <td><span className="badge-custom badge-processing">{r.department}</span></td>
                        <td>{r.eventDate}</td>
                        <td>
                          {r.reportUrl ? (
                            <button 
                              className="btn-primary-custom btn-sm-custom"
                              onClick={() => handleViewReport(r._id)}
                            >
                              📄 View
                            </button>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>No File</span>
                          )}
                        </td>
                        <td>
                          <textarea
                            className="form-input-custom"
                            placeholder="Enter comments..."
                            value={comments[r._id] || ""}
                            onChange={(e) => handleCommentChange(r._id, e.target.value)}
                            style={{ minHeight: '60px', fontSize: '0.875rem' }}
                          />
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <button
                              className="btn-secondary-custom btn-sm-custom"
                              onClick={() => handleViewRemarks(r)}
                              title="View previous authority remarks"
                            >
                              👁️ Remarks
                            </button>
                            <button
                              className="btn-success-custom btn-sm-custom"
                              onClick={() => handleApprove(r._id)}
                            >
                              ✅ Approve
                            </button>
                            <button
                              className="btn-warning-custom btn-sm-custom"
                              onClick={() => handleRecreate(r._id)}
                            >
                              🔄 Recreate
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="dashboard-footer fade-in">
          <div className="dashboard-footer-content">
            <div className="dashboard-footer-brand">
              <span>IQAC Approval Portal</span>
            </div>
            <div className="dashboard-footer-text">
              © 2025 KGiSL Institute of Technology. All rights reserved.
            </div>
          </div>
        </div>
      </div>
<<<<<<< HEAD
=======

      <hr />

      {/* FILTER SECTION */}
      <div className="card shadow p-3 mb-3">
        <div className="row g-3">
          {role !== "HOD" && (
            <div className="col-md-4">
              <label className="form-label fw-bold">Filter by Department</label>
              <select
                className="form-select"
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className={role === "HOD" ? "col-md-8" : "col-md-4"}>
            <label className="form-label fw-bold">Filter by Event Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="Search event name..."
              value={filterEventName}
              onChange={(e) => setFilterEventName(e.target.value)}
            />
          </div>
          <div className={role === "HOD" ? "col-md-4" : "col-md-4"}>
            <button
              className="btn btn-secondary w-100"
              style={{ marginTop: role === "HOD" ? "32px" : "0" }}
              onClick={() => {
                setFilterDepartment("");
                setFilterEventName("");
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>
        <div className="mt-2">
          <small className="text-muted">
            Showing {filteredRequests.length} of {requests.length} requests
          </small>
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <p className="text-muted">No requests found matching the filters</p>
      ) : (
        <table className="table table-bordered shadow">
          <thead className="table-light">
            <tr>
              <th>Event</th>
              <th>Staff</th>
              <th>Department</th>
              <th>Event Date</th>
              <th>Uploaded Report</th>
              <th>Comments (Required for Recreate)</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredRequests.map((r) => (
              <tr key={r._id}>
                <td>{r.eventName}</td>
                <td>{r.staffName}</td>
                <td>{r.department}</td>
                <td>{r.eventDate}</td>

                <td>
                  {r.reportUrl ? (
                    <button 
                      className="btn btn-link p-0"
                      onClick={() => handleViewReport(r._id)}
                    >
                      View
                    </button>
                  ) : (
                    "No File"
                  )}
                </td>

                {/* COMMENTS TEXTBOX */}
                <td>
                  <textarea
                    className="form-control"
                    placeholder="Enter comments..."
                    value={comments[r._id] || ""}
                    onChange={(e) =>
                      handleCommentChange(r._id, e.target.value)
                    }
                  />
                </td>

                {/* ACTION BUTTONS */}
                <td>
                  <button
                    className="btn btn-info btn-sm me-2 mb-1"
                    onClick={() => handleViewRemarks(r)}
                    title="View previous authority remarks"
                  >
                    View Remarks
                  </button>
                  <br />
                  <button
                    className="btn btn-success btn-sm me-2"
                    onClick={() => handleApprove(r._id)}
                  >
                    Approve
                  </button>

                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => handleRecreate(r._id)}
                  >
                    Recreate
                  </button>

                  {/* ❌ DO NOT SHOW GENERATE REPORT HERE */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
>>>>>>> bae7cf956ba50e58851e1b351b5c8482c2718ba9
      
      {/* REMARKS MODAL */}
      {showRemarksModal && selectedRequestRemarks && (
        <div 
          className="modal-overlay"
          onClick={() => setShowRemarksModal(false)}
        >
          <div 
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '700px' }}
          >
            <div className="modal-header-custom">
              <h5>💬 Previous Authority Remarks</h5>
              <button
                className="modal-close-btn"
                onClick={() => setShowRemarksModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body-custom">
              <div className="alert-custom alert-info" style={{ marginBottom: '1.5rem' }}>
                <div>
                  <h6 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>📋 Event Details</h6>
                  <p style={{ margin: '0.25rem 0' }}><strong>Event Name:</strong> {selectedRequestRemarks.eventName}</p>
                  <p style={{ margin: '0.25rem 0' }}><strong>Staff:</strong> {selectedRequestRemarks.staffName}</p>
                  <p style={{ margin: '0.25rem 0' }}><strong>Department:</strong> {selectedRequestRemarks.department}</p>
                  <p style={{ margin: '0' }}><strong>Event Date:</strong> {selectedRequestRemarks.eventDate}</p>
                </div>
              </div>
              
              <h6 style={{ fontWeight: 700, marginBottom: '1rem', color: '#1e293b' }}>📜 Approval History & Remarks</h6>
              
              {selectedRequestRemarks.approvals.length === 0 ? (
                <div className="alert-custom alert-warning">
                  <span>ℹ️ No remarks or comments have been provided yet.</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {selectedRequestRemarks.approvals.map((approval, idx) => (
                    <div key={idx} style={{ 
                      background: 'white', 
                      borderRadius: '0.75rem', 
                      padding: '1rem',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      border: '1px solid #e2e8f0'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <span className={`badge-custom ${
                          approval.status === 'Approved' ? 'badge-approved' : 
                          approval.status === 'Recreated' ? 'badge-pending' : 
                          'badge-processing'
                        }`}>
                          {approval.role}
                        </span>
                        <small style={{ color: '#64748b' }}>
                          {new Date(approval.decidedAt).toLocaleString()}
                        </small>
                      </div>
                      
                      <div style={{ marginBottom: '0.5rem' }}>
                        <strong>Status:</strong> 
                        <span className={`badge-custom ${
                          approval.status === 'Approved' ? 'badge-approved' : 
                          approval.status === 'Recreated' ? 'badge-pending' : 
                          'badge-processing'
                        }`} style={{ marginLeft: '0.5rem' }}>
                          {approval.status}
                        </span>
                      </div>
                      
                      <div>
                        <strong>Comments:</strong>
                        <p style={{ 
                          margin: '0.5rem 0 0 0', 
                          padding: '0.75rem', 
                          background: '#f8fafc', 
                          borderRadius: '0.5rem',
                          color: approval.comments ? '#334155' : '#94a3b8',
                          fontStyle: approval.comments ? 'normal' : 'italic'
                        }}>
                          {approval.comments || 'No comments provided'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer-custom">
              <button
                className="btn-secondary-custom"
                onClick={() => setShowRemarksModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RoleDashboard;
