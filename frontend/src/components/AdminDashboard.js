import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  adminGetAllStaff, 
  adminDeleteStaff,
  adminGetDepartments,
  adminGetHodByDepartment,
  adminDeleteHod,
  adminResetStaffPassword,
  adminResetHodPassword
} from "../api";
import { toast } from "react-toastify";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const role = user.role;

  const [staffList, setStaffList] = useState([]);
  const [hodList, setHodList] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [loadingHod, setLoadingHod] = useState(true);

  // Password reset modal state
  const [resetModal, setResetModal] = useState({
    show: false,
    type: null, // 'staff' or 'hod'
    id: null, // staff id or department name
    name: '',
    newPassword: ''
  });

  useEffect(() => {
    loadStaffs();
    loadHods();

    // Refresh data when returning to this page
    const handleFocus = () => {
      loadStaffs();
      loadHods();
    };

    window.addEventListener("focus", handleFocus);
    
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const loadStaffs = async () => {
    setLoadingStaff(true);
    try {
      const res = await adminGetAllStaff(role);
      setStaffList(res.data.staffs);
    } catch {
      toast.error("Failed to load staff list");
    } finally {
      setLoadingStaff(false);
    }
  };

  const loadHods = async () => {
    setLoadingHod(true);
    try {
      const depRes = await adminGetDepartments(role);
      const deps = depRes.data.departments || [];

      const results = await Promise.all(
        deps.map(async (dept) => {
          try {
            const res = await adminGetHodByDepartment(dept, role);
            return { department: dept, hod: res.data.hod || null };
          } catch (e) {
            return { department: dept, hod: null };
          }
        })
      );

      setHodList(results);
    } catch {
      toast.error("Failed to load HOD list");
    } finally {
      setLoadingHod(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this staff?")) return;
    try {
      await adminDeleteStaff(id, role);
      toast.success("Staff Deleted");
      loadStaffs();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleEdit = (staff) => {
    navigate("/admin/add-staff", { state: { editStaff: staff } });
  };

  const handleEditHod = (department) => {
    navigate("/admin/add-hod", { state: { department } });
  };

  const handleUnassignHod = async (department) => {
    if (!window.confirm(`Are you sure you want to unassign the HOD for ${department}? This action cannot be undone.`)) {
      return;
    }

    try {
      await adminDeleteHod(department, role);
      toast.success(`HOD for ${department} unassigned successfully`);
      loadHods();
    } catch (err) {
      toast.error("Failed to unassign HOD");
    }
  };

  // Password Reset Handlers
  const openResetModal = (type, id, name) => {
    setResetModal({
      show: true,
      type,
      id,
      name,
      newPassword: ''
    });
  };

  const closeResetModal = () => {
    setResetModal({
      show: false,
      type: null,
      id: null,
      name: '',
      newPassword: ''
    });
  };

  const handleResetPassword = async () => {
    if (!resetModal.newPassword || resetModal.newPassword.length < 4) {
      toast.error("Password must be at least 4 characters");
      return;
    }

    try {
      if (resetModal.type === 'staff') {
        await adminResetStaffPassword(resetModal.id, resetModal.newPassword, role);
        toast.success(`Password reset for staff: ${resetModal.name}`);
      } else if (resetModal.type === 'hod') {
        await adminResetHodPassword(resetModal.id, resetModal.newPassword, role);
        toast.success(`Password reset for HOD: ${resetModal.name}`);
      }
      closeResetModal();
    } catch (err) {
      toast.error("Failed to reset password");
    }
  };

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

      {/* ALL HODs TABLE */}
      <div className="card shadow p-4 mt-5">
        <h5>All HODs</h5>
        {loadingHod ? (
          <div className="text-center py-4">
            <span className="spinner-border text-primary"></span>
            <p className="text-muted mt-2">Loading HODs...</p>
          </div>
        ) : (
        <table className="table table-bordered table-striped mt-3">
          <thead className="table-dark">
            <tr>
              <th>Department</th>
              <th>HOD Name</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {hodList.map((h) => (
              <tr key={h.department}>
                <td>{h.department}</td>
                <td>{h.hod ? h.hod.name : "—"}</td>
                <td>
                  {h.hod ? (
                    <span className="badge bg-success">Assigned</span>
                  ) : (
                    <span className="badge bg-danger">Not Assigned</span>
                  )}
                </td>
                <td>
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => handleEditHod(h.department)}
                  >
                    {h.hod ? "Edit" : "Assign"}
                  </button>
                  {h.hod && (
                    <>
                      <button
                        className="btn btn-info btn-sm me-2"
                        onClick={() => openResetModal('hod', h.department, h.hod.name)}
                      >
                        Reset Password
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleUnassignHod(h.department)}
                      >
                        Unassign
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>

      {/* ALL STAFFS TABLE */}
      <div className="card shadow p-4 mt-4">
        <h5>All Staffs</h5>
        {loadingStaff ? (
          <div className="text-center py-4">
            <span className="spinner-border text-primary"></span>
            <p className="text-muted mt-2">Loading staff...</p>
          </div>
        ) : (
        <table className="table table-bordered table-striped mt-3">
          <thead className="table-dark">
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {staffList.map((s) => (
              <tr key={s._id}>
                <td>{s.name}</td>
                <td>{s.email}</td>
                <td>{s.department}</td>
                <td>
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => handleEdit(s)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-info btn-sm me-2"
                    onClick={() => openResetModal('staff', s._id, s.name)}
                  >
                    Reset Password
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(s._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>

      {/* RESET PASSWORD MODAL */}
      {resetModal.show && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Reset Password</h5>
                <button type="button" className="btn-close" onClick={closeResetModal}></button>
              </div>
              <div className="modal-body">
                <p>
                  Reset password for <strong>{resetModal.name}</strong>
                  {resetModal.type === 'hod' && <span className="badge bg-primary ms-2">HOD</span>}
                  {resetModal.type === 'staff' && <span className="badge bg-secondary ms-2">Staff</span>}
                </p>
                <div className="mb-3">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Enter new password"
                    value={resetModal.newPassword}
                    onChange={(e) => setResetModal({ ...resetModal, newPassword: e.target.value })}
                    autoFocus
                  />
                  <small className="text-muted">Minimum 4 characters</small>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeResetModal}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleResetPassword}>
                  Reset Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
