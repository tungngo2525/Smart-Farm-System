import React from 'react';

function Header2() {
  return (
    <>
      <header
        style={{
          background: 'linear-gradient(90deg, #4a90e2 0%, #0077ff 100%)',
          color: 'white',
          padding: '0 40px',
          display: 'flex',
          justifyContent: 'flex-start',
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
      </header>

      {/* Khoảng cách tránh nội dung bị che bởi header */}
      <div style={{ height: 80 }} />
    </>
  );
}

export default Header2;
