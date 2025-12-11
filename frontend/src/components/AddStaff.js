import React, { useEffect, useState } from "react";
import {
  adminCreateStaff,
  adminGetAllStaff,
  adminUpdateStaff,
  adminDeleteStaff,
  adminGetDepartments,
} from "../api";
import { toast } from "react-toastify";

export default function StaffManagement() {
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user.role;

  const [departments, setDepartments] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "",
    password: "",
  });

  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  // Load departments + staff list
  useEffect(() => {
    loadDepartments();
    loadStaffs();
  }, []);

  const loadDepartments = async () => {
    try {
      const res = await adminGetDepartments(role);
      setDepartments(res.data.departments);
    } catch {
      toast.error("Failed to load departments");
    }
  };

  const loadStaffs = async () => {
    try {
      const res = await adminGetAllStaff(role);
      setStaffList(res.data.staffs);
    } catch {
      toast.error("Failed to load staff list");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // CREATE OR UPDATE STAFF
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editMode) {
        await adminUpdateStaff(editId, form, role);
        toast.success("Staff Updated Successfully");
      } else {
        await adminCreateStaff(form, role);
        toast.success("Staff Created Successfully");
      }

      setForm({ name: "", email: "", department: "", password: "" });
      setEditMode(false);
      setEditId(null);
      loadStaffs();
    } catch (err) {
      toast.error(err.response?.data?.error || "Error");
    }
  };

  // DELETE STAFF
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await adminDeleteStaff(id, role);
      toast.success("Staff Deleted");
      loadStaffs();
    } catch {
      toast.error("Failed to delete");
    }
  };

  // LOAD STAFF DATA TO EDIT
  const handleEdit = (staff) => {
    setForm(staff);
    setEditId(staff._id);
    setEditMode(true);
  };

  return (
    <div className="container mt-5 pb-5">
      <h3 className="text-center mb-4">Staff Management</h3>

      <div className="card shadow p-4 mb-4">
        <h5>{editMode ? "Edit Staff" : "Add Staff"}</h5>
        <form onSubmit={handleSubmit}>
          {/* Name */}
          <input
            type="text"
            className="form-control mb-3"
            placeholder="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />

          {/* Email */}
          <input
            type="email"
            className="form-control mb-3"
            placeholder="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />

          {/* Department */}
          <select
            className="form-select mb-3"
            name="department"
            value={form.department}
            onChange={handleChange}
            required
          >
            <option value="">Select Department</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Password */}
          <input
            type="text"
            className="form-control mb-3"
            placeholder="Password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <button className="btn btn-primary w-100" type="submit">
            {editMode ? "Update Staff" : "Create Staff"}
          </button>
        </form>
      </div>

      {/* STAFF TABLE */}
      <div className="card shadow p-4">
        <h5>All Staffs</h5>
        <table className="table table-bordered table-striped mt-3">
          <thead className="table-dark">
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Password</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {staffList.map((s) => (
              <tr key={s._id}>
                <td>{s.name}</td>
                <td>{s.email}</td>
                <td>{s.department}</td>
                <td>{s.password}</td>
                <td>
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => handleEdit(s)}
                  >
                    Edit
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
      </div>
    </div>
  );
}
