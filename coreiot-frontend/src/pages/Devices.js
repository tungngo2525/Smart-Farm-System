import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

function Devices() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('http://localhost:3000/devices')
      .then(res => {
        setDevices(res.data.data || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Lỗi khi lấy danh sách thiết bị');
        setLoading(false);
      });
  }, []);

  if (loading) return <p style={{ paddingTop: 100, textAlign: 'center' }}>Đang tải danh sách thiết bị...</p>;
  if (error) return <p style={{ paddingTop: 100, textAlign: 'center', color: 'red' }}>{error}</p>;
  if (devices.length === 0) return <p style={{ paddingTop: 100, textAlign: 'center' }}>Không có thiết bị nào.</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Sidebar />

      <main
        style={{
          marginLeft: 250,       // tránh chồng Sidebar
          paddingTop: 60,        // tránh chồng Header
          paddingLeft: 20,
          paddingRight: 20,
          flexGrow: 1,
          backgroundColor: '#f0f4f8',
          boxSizing: 'border-box',
        }}
      >
        <h1 style={{ color: '#003366', marginBottom: 20 }}>Danh sách thiết bị</h1>

        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          backgroundColor: 'white',
          boxShadow: '0 0 15px rgba(0,0,0,0.1)',
          borderRadius: 8,
        }}>
          <thead>
            <tr style={{ backgroundColor: '#004080', color: 'white' }}>
              <th style={{ padding: '12px', borderBottom: '2px solid #003366' }}>Tên thiết bị</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #003366' }}>Mã thiết bị</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #003366' }}>Nhãn</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #003366' }}>Loại thiết bị</th>
            </tr>
          </thead>
          <tbody>
            {devices.map(device => (
              <tr
                key={device.id.id}
                style={{
                  transition: 'background-color 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e6f0ff'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                onClick={() => alert(`Bạn vừa chọn thiết bị: ${device.name || device.id.id}`)}
              >
                <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{device.name || 'Không có tên'}</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{device.id.id}</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{device.label || 'Không có nhãn'}</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{device.type || 'Không có loại'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>

      <div style={{ marginLeft: 250 }}>
        <Footer />
      </div>
    </div>
  );
}

export default Devices;
