import React, { useState } from 'react';
import axios from './axiosConfig';
import { useNavigate } from 'react-router-dom'; 
import { toast } from 'react-toastify';
import '../styles/style.css'; // Import CSS for styling

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Thêm trường name
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    // Kiểm tra nếu email và password hợp lệ
    if (!name || !email || !password) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      // Gửi yêu cầu đăng ký đến API backend với trường name
      await axios.post('/auth/register', { name, email, password });

      // Hiển thị thông báo thành công và chuyển hướng tới trang đăng nhập
      toast.success('Đăng ký thành công, vui lòng đăng nhập');
      navigate('/login');
    } catch (error) {
      // Log lỗi để dễ dàng debug
      console.error('Đăng ký thất bại:', error.response || error.message);
      
      // Hiển thị thông báo lỗi khi đăng ký thất bại
      toast.error('Đăng ký thất bại');
    }
  };

  return (
    <div className="form-container">
      <h1>Đăng ký</h1>
      <form onSubmit={handleRegister}>
        <div>
          <label>Tên</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)} 
            required
          />
        </div>
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
      
        <button type="submit">Đăng ký</button>
      </form>
      <div className="form-footer">
        <p>Đã có tài khoản? <a href="/login">Đăng nhập</a></p>
      </div>
    </div>
  );
};

export default Register;
