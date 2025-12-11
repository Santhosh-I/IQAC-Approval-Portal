import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api";
import { toast } from "react-toastify";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        role: "ADMIN",
        password: password,
      };

      const res = await loginUser(payload);

      // Save session
      localStorage.setItem("user", JSON.stringify(res.data.user));

      toast.success("Admin Login Successful!");

      navigate("/admin/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card shadow p-4" style={{ width: "450px" }}>
        <h3 className="text-center mb-4">Admin Login</h3>

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              required
            />
          </div>

          <button className="btn btn-primary w-100" type="submit">
            Login
          </button>
        </form>

        <button
          className="btn btn-link mt-3 w-100"
          onClick={() => navigate("/")}
        >
          Back to User Login
        </button>
      </div>
    </div>
  );
}
