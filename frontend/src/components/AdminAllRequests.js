import React, { useEffect, useState } from "react";
import { adminFetchAllRequests, adminDeleteRequest, adminDeleteAllRequests, approvalLetterUrl } from "../api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function AdminAllRequests() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterEventName, setFilterEventName] = useState("");

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const res = await adminFetchAllRequests(user.role);
      setRequests(res.data);
    } catch (err) {
      toast.error("Failed to load all requests");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this request? This action cannot be undone.")) {
      return;
    }

    try {
      await adminDeleteRequest(id, user.role);
      toast.success("Request deleted successfully");
      loadRequests(); // Reload the list
    } catch (err) {
      toast.error("Failed to delete request");
    }
  };

  const handleDeleteAll = async () => {
    if (requests.length === 0) {
      toast.warning("No requests to delete");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ALL ${requests.length} requests? This action cannot be undone!`)) {
      return;
    }

    // Double confirmation for critical action
    if (!window.confirm("Final confirmation: This will permanently delete all requests. Are you absolutely sure?")) {
      return;
    }

    try {
      const res = await adminDeleteAllRequests(user.role);
      toast.success(`Successfully deleted ${res.data.deletedCount} requests`);
      loadRequests(); // Reload the list
    } catch (err) {
      toast.error("Failed to delete all requests");
    }
  };

  // Filter requests based on department and event name
  const filteredRequests = requests.filter((req) => {
    const matchesDepartment = filterDepartment === "" || req.department === filterDepartment;
    const matchesEventName = filterEventName === "" || req.eventName.toLowerCase().includes(filterEventName.toLowerCase());
    return matchesDepartment && matchesEventName;
  });

  // Get unique departments for filter dropdown
  const departments = [...new Set(requests.map(req => req.department))].sort();

  return (
    <div className="container mt-5 pb-5">
      <h3 className="text-center mb-4">All Requests (Admin View)</h3>

      <div className="d-flex justify-content-between mb-3">
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/admin/dashboard")}
        >
          ← Back to Dashboard
        </button>

        <button
          className="btn btn-danger"
          onClick={handleDeleteAll}
          disabled={requests.length === 0}
        >
          Delete All Requests
        </button>
      </div>

      {/* FILTER SECTION */}
      <div className="card shadow p-3 mb-3">
        <div className="row g-3">
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
          <div className="col-md-4">
            <label className="form-label fw-bold">Filter by Event Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="Search event name..."
              value={filterEventName}
              onChange={(e) => setFilterEventName(e.target.value)}
            />
          </div>
          <div className="col-md-4 d-flex align-items-end">
            <button
              className="btn btn-secondary w-100"
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
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="9" className="text-center py-4">
                    <span className="spinner-border text-primary"></span>
                    <p className="text-muted mt-2 mb-0">Loading requests...</p>
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center text-muted py-3">
                    No requests found
                  </td>
                </tr>
              ) : null}

              {!isLoading && filteredRequests.map((req, index) => (
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
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => window.open(approvalLetterUrl(req._id), "_blank")}
                    >
                      View Approval Letter
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(req._id)}
                    >
                      Delete
                    </button>
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
