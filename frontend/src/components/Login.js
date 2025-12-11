import React, { useState } from "react";
import { loginUser } from "../api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();

  const [role, setRole] = useState("");
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [password, setPassword] = useState("");

  const departments = ["AI&DS", "CSE", "ECE", "IT", "MECH", "AI&ML", "CYS"];

  const handleLogin = async (e) => {
    e.preventDefault();

    // =======================================
    //      🔥 STATIC ADMIN LOGIN (NO NAME)
    // =======================================
    if (role === "ADMIN") {
      if (password === "admin@123") {
        const adminUser = {
          name: "Admin",
          role: "ADMIN",
        };

        localStorage.setItem("user", JSON.stringify(adminUser));
        toast.success("Admin Login Successful!");
        return navigate("/admin/dashboard");
      } else {
        return toast.error("Invalid Admin Password");
      }
    }

    // =======================================
    //      🔥 NORMAL LOGIN (BACKEND)
    // =======================================
    try {
      const payload = {
        role,
        name,
        password,
        department: role === "HOD" ? department : undefined,
      };

      const res = await loginUser(payload);

      localStorage.setItem("user", JSON.stringify(res.data.user));

      toast.success("Login Successful!");

      if (role === "STAFF") navigate("/staff-home");
      else if (role === "IQAC") navigate("/iqac-home");
      else navigate(`/role/${role.toLowerCase()}`);

    } catch (err) {
      toast.error(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="login-container">

      <div className="login-card">
        <h2 className="login-title">Login</h2>

        <form onSubmit={handleLogin}>
          
          {/* ROLE SELECT */}
          <div className="form-group">
            <label>Role</label>
            <select
              className="form-control"
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setName(""); // reset name if switching roles
              }}
              required
            >
              <option value="">Select Role</option>
              <option value="ADMIN">Admin</option>
              <option value="STAFF">Staff</option>
              <option value="IQAC">IQAC</option>
              <option value="HOD">HOD</option>
              <option value="PRINCIPAL">Principal</option>
              <option value="DIRECTOR">Director</option>
              <option value="AO">AO</option>
              <option value="CEO">CEO</option>
            </select>
          </div>

          {/* STAFF NAME */}
          {role === "STAFF" && (
            <div className="form-group">
              <label>Staff Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          {/* HOD → Department Select */}
          {role === "HOD" && (
            <div className="form-group">
              <label>Department</label>
              <select
                className="form-control"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          )}

          {/* PASSWORD (Shown for ALL roles) */}
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              placeholder={
                role === "ADMIN" ? "Enter Admin Password" : "Enter password"
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-btn">
            Login
          </button>

        </form>
      </div>
    </div>
  );
}
