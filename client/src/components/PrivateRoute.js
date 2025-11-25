// PrivateRoute.js
import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, role }) => {
  const token = localStorage.getItem("token"); // Lấy token từ localStorage

  if (!token) {
    // Nếu không có token, điều hướng người dùng đến trang login
    return <Navigate to="/login" replace />;
  }

  try {
    // Giải mã token để lấy thông tin
    const decodedToken = JSON.parse(atob(token.split(".")[1]));

    // Kiểm tra quyền truy cập dựa trên role (nếu có)
    if (role && decodedToken.role !== role) {
      return <Navigate to="/unauthorized" replace />;
    }

    return children; // Nếu đủ điều kiện, render component
  } catch (error) {
    // Nếu token không hợp lệ (hoặc giải mã lỗi), điều hướng đến trang login
    return <Navigate to="/login" replace />;
  }
};

export default PrivateRoute;
