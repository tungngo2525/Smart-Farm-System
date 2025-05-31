// src/pages/UserInfo.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';


function UserInfo() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await axios.get('http://localhost:3000/userinfo');
        setUser(res.data);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  return (
    <>
      <Header />
      <Sidebar />
      <main
        style={{
          marginLeft: 250,
          marginTop: 60,
          padding: '20px',
          minHeight: 'calc(100vh - 60px - 50px)', // trừ header + footer
          color: '#333',
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          backgroundColor: '#f9f9f9',
        }}
      >
        {loading && <p>Đang tải thông tin người dùng...</p>}
        {error && <p style={{ color: '#d9534f' }}>Lỗi: {error}</p>}
        {!loading && !error && user && (
          <div
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              maxWidth: '100%',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              overflowX: 'auto', // để có thể cuộn ngang khi màn hình nhỏ
            }}
          >
            <h2 style={{ marginBottom: '20px' }}>Thông tin người dùng</h2>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'center',
                minWidth: 600,
              }}
            >
              <thead>
                <tr style={{ backgroundColor: '#764ba2', color: 'white' }}>
                  <th style={{ padding: '12px 15px' }}>ID</th>
                  <th style={{ padding: '12px 15px' }}>Email</th>
                  <th style={{ padding: '12px 15px' }}>Quyền</th>
                  <th style={{ padding: '12px 15px' }}>Họ và tên</th>
                  <th style={{ padding: '12px 15px' }}>Số điện thoại</th>
                  <th style={{ padding: '12px 15px' }}>Nhà cung cấp xác thực</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  style={{
                    backgroundColor: '#eee',
                    transition: 'background-color 0.3s ease',
                    cursor: 'default',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#dcd6f7')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#eee')}
                >
                  <td style={{ padding: '12px 15px' }}>{user.id?.id || 'Không có'}</td>
                  <td style={{ padding: '12px 15px' }}>{user.email || 'Không có'}</td>
                  <td style={{ padding: '12px 15px' }}>{user.authority || 'Không có'}</td>
                  <td style={{ padding: '12px 15px' }}>{user.firstName} {user.lastName || ''}</td>
                  <td style={{ padding: '12px 15px' }}>{user.phone || 'Không có'}</td>
                  <td style={{ padding: '12px 15px' }}>{user.additionalInfo?.authProviderName || 'Không có'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </main>
      
    </>
  );
}

export default UserInfo;
