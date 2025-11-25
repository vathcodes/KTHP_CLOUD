import React, { useState } from "react";
import axios from "./axiosConfig";
import { useNavigate } from "react-router-dom"; // Use useNavigate instead of useHistory
import { toast } from "react-toastify";
import "../styles/style.css"; // Import CSS for styling

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/auth/login", { email, password });
      const { token } = response.data;
      localStorage.setItem("token", token);

      // Decode JWT token để lấy thông tin người dùng
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      const user = {
        id: decodedToken.id,
        name: decodedToken.name,
        email: decodedToken.email,
      };
      localStorage.setItem("user", JSON.stringify(user)); // Lưu thông tin người dùng

      const role = decodedToken.role;
      if (role === "admin") {
        navigate("/admin");
      } else {
        navigate("/user");
      }

      toast.success("Đăng nhập thành công");
    } catch (error) {
      toast.error("Đăng nhập thất bại");
    }
  };

  return (
    <div className="form-container">
      <h1>Đăng nhập</h1>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Đăng nhập</button>
      </form>
      <div className="form-footer">
        <p>
          Bạn chưa có tài khoản? <a href="/register">Đăng ký</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
