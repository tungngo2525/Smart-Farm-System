import React from 'react';
import { useNavigate } from 'react-router-dom';

function Header() {
  const username = 'tungngo2525@gmail.com';
  const navigate = useNavigate();

  const handleLogout = () => {
    alert('Bạn đã đăng xuất!');
    // TODO: Xử lý logout thực tế ở đây (xóa token, reset trạng thái,...)
    navigate('/login');  // Điều hướng về trang đăng nhập
  };

  return (
    <>
      <header
        style={{
          background: 'linear-gradient(90deg, #4a90e2 0%, #0077ff 100%)',
          color: 'white',
          padding: '0 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: 80,
          boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
          zIndex: 1000,
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          userSelect: 'none',
          boxSizing: 'border-box',
        }}
      >
        {/* Logo + Tên */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            fontWeight: 'bold',
            fontSize: '2.2rem',
            letterSpacing: 2,
            textShadow: '2px 2px 6px rgba(0,0,0,0.3)',
            cursor: 'default',
            height: '100%',
            lineHeight: '80px',
          }}
        >
          {/* Giả lập icon logo */}
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              background: 'radial-gradient(circle at center, #ffb400, #ff7000)',
              boxShadow: '0 0 15px #ffb400',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 28,
              fontWeight: '900',
              userSelect: 'none',
            }}
            title="Logo SMART FARM"
          >
            SF
          </div>
          SMART FARM
        </div>

        {/* User info + logout */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            fontSize: 18,
            fontWeight: '600',
            textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
            flexWrap: 'nowrap',
            maxWidth: 400,
            boxSizing: 'border-box',
            height: '100%',
            lineHeight: '80px',
          }}
        >
          <span style={{ userSelect: 'text', whiteSpace: 'nowrap' }}>
            Xin chào, <strong>{username}</strong>
          </span>

          <button
            onClick={handleLogout}
            style={{
              backgroundColor: '#ff3b3f',
              color: 'white',
              border: 'none',
              borderRadius: 10,
              padding: '10px 25px',
              cursor: 'pointer',
              fontWeight: '800',
              fontSize: 16,
              boxShadow: '0 4px 15px rgba(255, 59, 63, 0.7)',
              transition: 'background-color 0.3s ease, box-shadow 0.3s ease, transform 0.15s ease',
              userSelect: 'none',
              whiteSpace: 'nowrap',
              maxWidth: 150,
              height: 40,
              lineHeight: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#e03235';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(224, 50, 53, 0.9)';
              e.currentTarget.style.transform = 'scale(1.07)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#ff3b3f';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 59, 63, 0.7)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline = 'none';
              e.currentTarget.style.boxShadow = '0 0 10px 3px rgba(255,59,63,0.8)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 59, 63, 0.7)';
            }}
          >
            Đăng xuất
          </button>
        </div>
      </header>

      {/* Phần này rất quan trọng để tránh nội dung bên dưới bị header che khuất */}
      <div style={{ height: 80 }} />
    </>
  );
}

export default Header;
