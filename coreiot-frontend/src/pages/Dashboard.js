import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TelemetryChart from '../components/TelemetryChart';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

function Dashboard() {
  const [keys, setKeys] = useState([]);
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedKey, setSelectedKey] = useState('');

  useEffect(() => {
    axios.get('http://localhost:3000/telemetry')
      .then(res => {
        setKeys(res.data.keys);
        setData(res.data.data);
        if (res.data.keys.length > 0) setSelectedKey(res.data.keys[0]);
        setLoading(false);
      })
      .catch(err => {
        console.error('API error:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p style={{ paddingTop: 100, textAlign: 'center' }}>Đang tải dữ liệu...</p>;
  if (!selectedKey) return <p style={{ paddingTop: 100, textAlign: 'center' }}>Không có dữ liệu cảm biến</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Sidebar />

      {/* Nội dung chính */}
      <main
        style={{
          marginLeft: 250,      // tránh chồng Sidebar
          paddingTop: 60,       // tránh chồng Header
          paddingLeft: 20,
          paddingRight: 20,
          flexGrow: 1,          // để main chiếm khoảng trống còn lại
          backgroundColor: '#f0f4f8',
          boxSizing: 'border-box',
        }}
      >
        <h1 style={{ color: '#003366' }}>Dashboard CoreIoT</h1>

        <label style={{ fontWeight: 'bold', color: '#004080' }}>
          Chọn biểu đồ:{' '}
          <select
            value={selectedKey}
            onChange={e => setSelectedKey(e.target.value)}
            style={{
              padding: '6px 10px',
              fontSize: 16,
              borderRadius: 4,
              border: '1px solid #ccc',
              marginBottom: 30,
            }}
          >
            {keys.map(key => (
              <option key={key} value={key}>{key}</option>
            ))}
          </select>
        </label>

        <TelemetryChart data={data} sensorKey={selectedKey} />
      </main>

      {/* Footer không bị chồng Sidebar */}
      <div style={{ marginLeft: 250 }}>
        <Footer />
      </div>
    </div>
  );
}

export default Dashboard;
