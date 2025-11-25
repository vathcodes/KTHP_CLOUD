import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div>
      <h1>403 - Không được phép</h1>
      <p>Bạn không có quyền truy cập vào trang này.</p>
      <Link to="/login">Quay lại trang đăng nhập</Link>
    </div>
  );
};

export default Unauthorized;
