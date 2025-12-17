import React, { useEffect, useState } from "react";
import {
  fetchRequestsForRole,
  actOnRequest,
  approvalLetterUrl,
  getFreshReportUrl,
  checkReferenceNumber,
} from "../api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import useDisableBack from "./useDisableBack";
import "./Dashboard.css";
import logo from '../assets/kite-logo.png';

function IQACHome() {
  // ------------------------------------
  // HOOKS
  // ------------------------------------
  const navigate = useNavigate();
  useDisableBack();

  const role = "IQAC";

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [refNumbers, setRefNumbers] = useState({}); // per request
  const [workflows, setWorkflows] = useState({}); // per request
  const [comments, setComments] = useState({}); // comments per request
  const [refWarnings, setRefWarnings] = useState({}); // warnings for duplicate ref numbers

  const flowOptions = ["HOD", "PRINCIPAL", "DIRECTOR", "AO", "CEO"];

  // ------------------------------------
  // LOGOUT
  // ------------------------------------
  const logout = () => {
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  // ------------------------------------
  // LOAD REQUESTS
  // ------------------------------------
  const loadRequests = async () => {
    try {
      const res = await fetchRequestsForRole(role);
      setRequests(res.data);
      setLoading(false);
    } catch (err) {
      toast.error("Failed to load requests");
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  // ------------------------------------
  // VIEW REPORT - Fetch fresh signed URL
  // ------------------------------------
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

  // ------------------------------------
  // COMMENT HANDLER
  // ------------------------------------
  const handleCommentChange = (id, text) => {
    setComments((prev) => ({ ...prev, [id]: text }));
  };

  // ------------------------------------
  // CHECK REFERENCE NUMBER UNIQUENESS
  // ------------------------------------
  const checkRefNumberUniqueness = async (refNumber, requestId) => {
    if (refNumber.length !== 8) {
      setRefWarnings((prev) => ({ ...prev, [requestId]: "" }));
      return;
    }

    try {
      const res = await checkReferenceNumber(refNumber);
      if (res.data.exists) {
        setRefWarnings((prev) => ({
          ...prev,
          [requestId]: `⚠️ This reference number is already used for event: "${res.data.eventName}"`,
        }));
      } else {
        setRefWarnings((prev) => ({ ...prev, [requestId]: "" }));
      }
    } catch (err) {
      console.error("Error checking reference number:", err);
    }
  };

  // ------------------------------------
  // APPROVE
  // ------------------------------------
  const handleApprove = async (id) => {
    const cmt = comments[id] || "";
    const refNumber = refNumbers[id] || "";
    const flowRoles = workflows[id] || [];

    // Reference number must be exactly 8 alphanumeric characters
    if (!/^[A-Z0-9]{8}$/.test(refNumber)) {
      return toast.error("Reference number must be exactly 8 characters (letters and numbers only).");
    }

    // Check if reference number is duplicate
    if (refWarnings[id]) {
      return toast.error("Cannot approve: Reference number is already in use. Please use a unique reference.");
    }

    // At least one next approver required
    if (flowRoles.length === 0) {
      return toast.error("Select at least one role for the workflow.");
    }

    try {
      await actOnRequest(id, {
        action: "approve",
        comments: cmt,
        refNumber,
        flow: flowRoles,
      });

      toast.success("Approved and forwarded!");

      // reset only for that card
      setComments((prev) => ({ ...prev, [id]: "" }));
      setRefNumbers((prev) => ({ ...prev, [id]: "" }));
      setWorkflows((prev) => ({ ...prev, [id]: [] }));

      loadRequests();
    } catch {
      toast.error("Approval failed");
    }
  };

  // ------------------------------------
  // RECREATE
  // ------------------------------------
  const handleRecreate = async (id) => {
    const cmt = comments[id];

    if (!cmt || cmt.trim() === "") {
      return toast.error("Comments are required for recreation!");
    }

    try {
      await actOnRequest(id, {
        action: "recreate",
        comments: cmt,
      });

      toast.success("Sent back for recreation!");

      // reset comment only for this request
      setComments((prev) => ({ ...prev, [id]: "" }));

      loadRequests();
    } catch {
      toast.error("Recreate failed");
    }
  };

  if (loading) return (
    <div className="dashboard-page">
      <div className="dashboard-wrapper">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading requests...</p>
        </div>
      </div>
    </div>
  );

  return (
<<<<<<< HEAD
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
                <h1>IQAC Dashboard</h1>
                <p>Review event requests, assign workflow, approve or recreate</p>
              </div>
            </div>
            <div className="dashboard-header-right">
              <div className="dashboard-user-info">
                <div className="dashboard-user-name">Welcome, IQAC</div>
                <div className="dashboard-user-role">Internal Quality Assurance Cell</div>
              </div>
              <button className="btn-logout" onClick={logout}>
                Logout
              </button>
=======
    <div className="container mt-4">

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center">
        <h2 className="fw-bold text-primary">IQAC Dashboard</h2>

        <button className="btn btn-danger btn-sm" onClick={logout}>
          Logout
        </button>
      </div>

      <p className="text-muted">
        Review event requests, assign workflow, approve or recreate.
      </p>
      <hr />

      <div className="row">
        {requests.map((req) => (
          <div className="col-md-4" key={req._id}>
            <div className="card shadow p-3 mb-4">

              {/* BASIC DETAILS */}
              <h5 className="fw-bold">{req.eventName}</h5>
              <p><b>Event Date:</b> {req.eventDate}</p>
              <p><b>Staff:</b> {req.staffName}</p>
              <p><b>Status:</b> {req.overallStatus}</p>

              {/* VIEW REPORT FILE */}
              {req.reportUrl && (
                <button
                  className="btn btn-link p-0 mt-2"
                  onClick={() => handleViewReport(req._id)}
                >
                  View Uploaded Report
                </button>
              )}

              {/* SHOW APPROVAL REPORT WHEN COMPLETED */}
              {req.isCompleted && (
                <button
                  className="btn btn-success btn-sm mt-3 w-100"
                  onClick={() => window.open(approvalLetterUrl(req._id), "_blank")}
                >
                  Generate Approval Report
                </button>
              )}

              {/* SHOW IQAC ACTIONS ONLY WHEN WAITING FOR IQAC */}
              {req.currentRole === role && (
                <>
                  <hr />

                  {/* REFERENCE NO */}
                  <label className="fw-bold">Reference Number (8 characters)</label>
                  <input
                    type="text"
                    className={`form-control ${refWarnings[req._id] ? 'border-warning' : ''}`}
                    maxLength="8"
                    placeholder="Enter 8 character reference"
                    value={refNumbers[req._id] || ""}
                    onChange={(e) => {
                      // Only allow alphanumeric characters (letters and numbers)
                      const value = e.target.value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
                      setRefNumbers((prev) => ({
                        ...prev,
                        [req._id]: value,
                      }));
                      // Check uniqueness when user types
                      checkRefNumberUniqueness(value, req._id);
                    }}
                  />
                  {refWarnings[req._id] ? (
                    <small className="text-warning d-block mb-2">
                      <strong>{refWarnings[req._id]}</strong>
                    </small>
                  ) : (
                    <small className="text-muted d-block mb-2">Letters and numbers only, 8 characters (e.g., AB123456)</small>
                  )}

                  {/* WORKFLOW ROLES */}
                  <label className="fw-bold">Select Workflow Roles</label>
                  {flowOptions.map((r) => (
                    <div key={r}>
                      <input
                        type="checkbox"
                        checked={(workflows[req._id] || []).includes(r)}
                        onChange={() =>
                          setWorkflows((prev) => {
                            const current = prev[req._id] || [];
                            return {
                              ...prev,
                              [req._id]: current.includes(r)
                                ? current.filter((x) => x !== r)
                                : [...current, r],
                            };
                          })
                        }
                      />
                      <label className="ms-2">{r}</label>
                    </div>
                  ))}

                  <hr />

                  {/* COMMENTS */}
                  <label className="fw-bold">Comments</label>
                  <textarea
                    className="form-control mb-3"
                    placeholder="Enter comments (required for recreate)"
                    value={comments[req._id] || ""}
                    onChange={(e) =>
                      handleCommentChange(req._id, e.target.value)
                    }
                  />

                  {/* ACTION BUTTONS */}
                  <button
                    className="btn btn-primary btn-sm me-2"
                    onClick={() => handleApprove(req._id)}
                  >
                    Approve
                  </button>

                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => handleRecreate(req._id)}
                  >
                    Recreate
                  </button>
                </>
              )}

>>>>>>> bae7cf956ba50e58851e1b351b5c8482c2718ba9
            </div>
          </div>
        </div>

        {/* REQUEST CARDS */}
        {requests.length === 0 ? (
          <div className="dashboard-card fade-in">
            <div className="dashboard-card-body">
              <div className="empty-state">
                <div className="empty-state-icon">✅</div>
                <h4>No pending requests</h4>
                <p>All caught up! No requests are waiting for IQAC review.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            {requests.map((req) => (
              <div className="col-lg-4 col-md-6" key={req._id}>
                <div className="dashboard-card fade-in" style={{ height: '100%' }}>
                  <div className="dashboard-card-header" style={{ padding: '1rem 1.25rem' }}>
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{req.eventName}</h4>
                    <p style={{ margin: 0, opacity: 0.9 }}>{req.staffName} • {req.department}</p>
                  </div>
                  <div className="dashboard-card-body" style={{ padding: '1.25rem' }}>
                    <div style={{ marginBottom: '1rem' }}>
                      <p style={{ margin: '0.25rem 0', color: '#475569' }}>
                        <strong>Event Date:</strong> {req.eventDate}
                      </p>
                      <p style={{ margin: '0.25rem 0', color: '#475569' }}>
                        <strong>Status:</strong>{' '}
                        <span className={`badge-custom ${
                          req.isCompleted ? 'badge-approved' : 
                          req.overallStatus?.toLowerCase().includes('pending') ? 'badge-pending' : 
                          'badge-processing'
                        }`}>
                          {req.overallStatus}
                        </span>
                      </p>
                    </div>

                    {req.reportUrl && (
                      <button
                        className="btn-secondary-custom btn-sm-custom w-100"
                        onClick={() => handleViewReport(req._id)}
                        style={{ marginBottom: '0.75rem' }}
                      >
                        📄 View Uploaded Report
                      </button>
                    )}

                    {req.isCompleted && (
                      <button
                        className="btn-success-custom btn-sm-custom w-100"
                        onClick={() => window.open(approvalLetterUrl(req._id), "_blank")}
                      >
                        ✅ Generate Approval Report
                      </button>
                    )}

                    {req.currentRole === role && (
                      <>
                        <div className="section-divider" style={{ margin: '1rem 0' }}></div>

                        <div className="form-group-custom">
                          <label className="form-label-custom">Reference Number (8 digits)</label>
                          <input
                            type="text"
                            className="form-input-custom"
                            maxLength="8"
                            placeholder="Enter 8 digit number"
                            value={refNumbers[req._id] || ""}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9]/g, "");
                              setRefNumbers((prev) => ({
                                ...prev,
                                [req._id]: value,
                              }));
                            }}
                          />
                          <small style={{ color: '#64748b', fontSize: '0.75rem' }}>Only numbers allowed (e.g., 12345678)</small>
                        </div>

                        <div className="form-group-custom">
                          <label className="form-label-custom">Workflow Roles</label>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {flowOptions.map((r) => (
                              <label key={r} style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.375rem',
                                padding: '0.375rem 0.75rem',
                                background: (workflows[req._id] || []).includes(r) ? '#dbeafe' : '#f1f5f9',
                                borderRadius: '0.5rem',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                color: (workflows[req._id] || []).includes(r) ? '#1e40af' : '#475569',
                                transition: 'all 0.2s ease'
                              }}>
                                <input
                                  type="checkbox"
                                  checked={(workflows[req._id] || []).includes(r)}
                                  onChange={() =>
                                    setWorkflows((prev) => {
                                      const current = prev[req._id] || [];
                                      return {
                                        ...prev,
                                        [req._id]: current.includes(r)
                                          ? current.filter((x) => x !== r)
                                          : [...current, r],
                                      };
                                    })
                                  }
                                  style={{ accentColor: '#3b82f6' }}
                                />
                                {r}
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="form-group-custom">
                          <label className="form-label-custom">Comments</label>
                          <textarea
                            className="form-input-custom"
                            placeholder="Enter comments (required for recreate)"
                            value={comments[req._id] || ""}
                            onChange={(e) => handleCommentChange(req._id, e.target.value)}
                            style={{ minHeight: '80px' }}
                          />
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            className="btn-success-custom btn-sm-custom"
                            onClick={() => handleApprove(req._id)}
                            style={{ flex: 1 }}
                          >
                            ✅ Approve
                          </button>
                          <button
                            className="btn-warning-custom btn-sm-custom"
                            onClick={() => handleRecreate(req._id)}
                            style={{ flex: 1 }}
                          >
                            🔄 Recreate
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

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
    </div>
  );
}

export default IQACHome;
