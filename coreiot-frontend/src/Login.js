// src/pages/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header2 from './components/Header2';
import Footer from './components/Footer';

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = e => {
    e.preventDefault();
    if (username === 'tungngo2525@gmail.com' && password === '0917700273') {
      setError('');
      onLoginSuccess();
      navigate('/dashboard');
    } else {
      setError('Sai tên đăng nhập hoặc mật khẩu!');
    }
  };

  return (
    <>
      <Header2 />

      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 136px)' }}>
        {/* 136px = chiều cao Header + Footer giả định */}
        <div className="card p-4 shadow-sm" style={{ maxWidth: 400, width: '100%' }}>
          <h2 className="mb-4 text-center">Đăng nhập</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="inputEmail" className="form-label">Email</label>
              <input
                id="inputEmail"
                type="email"
                className="form-control"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                placeholder="Nhập email"
                autoComplete="username"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="inputPassword" className="form-label">Mật khẩu</label>
              <input
                id="inputPassword"
                type="password"
                className="form-control"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="Nhập mật khẩu"
                autoComplete="current-password"
              />
            </div>
            {error && <div className="alert alert-danger" role="alert">{error}</div>}
            <button type="submit" className="btn btn-primary w-100">Đăng nhập</button>
          </form>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default Login;
