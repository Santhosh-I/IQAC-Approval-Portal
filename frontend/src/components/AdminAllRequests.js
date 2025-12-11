import React, { useEffect, useState } from "react";
import { adminFetchAllRequests, approvalLetterUrl } from "../api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function AdminAllRequests() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [requests, setRequests] = useState([]);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const res = await adminFetchAllRequests(user.role);
      setRequests(res.data);
    } catch (err) {
      toast.error("Failed to load all requests");
    }
  };

  return (
    <div className="container mt-5 pb-5">
      <h3 className="text-center mb-4">All Requests (Admin View)</h3>

      <button
        className="btn btn-secondary mb-3"
        onClick={() => navigate("/admin/dashboard")}
      >
        ← Back to Dashboard
      </button>

      <div className="card shadow p-4">
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Reference No</th>
                <th>Staff</th>
                <th>Department</th>
                <th>Event</th>
                <th>Date</th>
                <th>Status</th>
                <th>Report</th>
              </tr>
            </thead>

            <tbody>
              {requests.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center text-muted py-3">
                    No requests found
                  </td>
                </tr>
              )}

              {requests.map((req, index) => (
                <tr key={req._id}>
                  <td>{index + 1}</td>
                  <td>{req.referenceNo || "-"}</td>
                  <td>{req.staffName}</td>
                  <td>{req.department}</td>
                  <td>{req.eventName}</td>
                  <td>{req.eventDate}</td>
                  <td>
                    <span
                      className={
                        req.isCompleted
                          ? "badge bg-success"
                          : "badge bg-warning text-dark"
                      }
                    >
                      {req.overallStatus}
                    </span>
                  </td>
                  <td>
                    <a
                      className="btn btn-primary btn-sm"
                      href={approvalLetterUrl(req._id)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View Approval Letter
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
