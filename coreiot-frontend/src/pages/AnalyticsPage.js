import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

function AnalyticsPage() {
  const [analysis, setAnalysis] = useState({
    alerts: [],
    sensorErrors: {},
    statistics: {},
  });
  const [loading, setLoading] = useState(true);
  const [selectedKey, setSelectedKey] = useState('all');

  useEffect(() => {
    fetch('http://localhost:3000/analyze')
      .then(res => res.json())
      .then(data => {
        setAnalysis({
          alerts: data.alerts || [],
          sensorErrors: data.sensorErrors || {},
          statistics: data.statistics || {},
        });
        setLoading(false);
      })
      .catch(err => {
        console.error('Lỗi gọi API:', err);
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    setSelectedKey(e.target.value);
  };

  if (loading) return <p style={{ paddingTop: 100, textAlign: 'center' }}>Đang tải dữ liệu phân tích...</p>;

  const alertKeys = Array.from(new Set(analysis.alerts.map(a => a.key)));
  const errorKeys = Object.keys(analysis.sensorErrors);
  const statisticKeys = Object.keys(analysis.statistics);

  const allKeys = Array.from(new Set([...alertKeys, ...errorKeys, ...statisticKeys]));

  const filteredAlerts = selectedKey === 'all'
    ? analysis.alerts
    : analysis.alerts.filter(a => a.key === selectedKey);

  const filteredSensorErrors = selectedKey === 'all'
    ? analysis.sensorErrors
    : { [selectedKey]: analysis.sensorErrors[selectedKey] || [] };

  const filteredStatistics = selectedKey === 'all'
    ? analysis.statistics
    : { [selectedKey]: analysis.statistics[selectedKey] || {} };

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 60, zIndex: 1000 }}>
        <Header />
      </div>

      {/* Sidebar */}
      <div style={{
        position: 'fixed',
        top: 60,
        left: 0,
        width: 250,
        bottom: 0,
        overflowY: 'auto',
        backgroundColor: '#f0f0f0',
        zIndex: 900
      }}>
        <Sidebar />
      </div>

      {/* Nội dung chính */}
      <main
        style={{
          marginTop: 60,
          marginLeft: 250,
          padding: 24,
          backgroundColor: '#f5f5f5',
          minHeight: 'calc(100vh - 60px)',
          overflowY: 'auto',
          boxSizing: 'border-box',
        }}
      >
        <h2 style={styles.title}>📊 Phân Tích Dữ Liệu Telemetry</h2>

        <div style={{ marginBottom: 20 }}>
          <label htmlFor="sensor-select"><strong>Chọn trường cảm biến:</strong> </label>
          <select
            id="sensor-select"
            value={selectedKey}
            onChange={handleChange}
            style={styles.select}
          >
            <option value="all">Hiển thị tất cả</option>
            {allKeys.map(key => (
              <option key={key} value={key}>{key}</option>
            ))}
          </select>
        </div>

        {/* Bất thường - dạng bảng */}
        <section>
          <h3 style={{ ...styles.sectionTitle, color: '#d32f2f' }}>🚨 Giá trị bất thường</h3>
          {filteredAlerts.length === 0 ? (
            <p>Không có giá trị bất thường.</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>STT</th>
                  <th style={styles.th}>Sensor</th>
                  <th style={styles.th}>Giá trị</th>
                  <th style={styles.th}>Thời gian</th>
                  <th style={styles.th}>Cảnh báo</th>
                </tr>
              </thead>
              <tbody>
                {filteredAlerts.map((alert, idx) => (
                  <tr key={idx} style={styles.alertRow}>
                    <td style={styles.td}>{idx + 1}</td>
                    <td style={styles.td}>{alert.key.toUpperCase()}</td>
                    <td style={{ ...styles.td, color: '#d32f2f', fontWeight: 'bold' }}>{alert.value}</td>
                    <td style={styles.td}>{new Date(alert.ts).toLocaleString()}</td>
                    <td style={styles.td}>{alert.alert}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Lỗi cảm biến */}
        <section>
          <h3 style={{ ...styles.sectionTitle, color: '#f57c00' }}>⚠️ Lỗi cảm biến</h3>
          {Object.entries(filteredSensorErrors).length === 0 && <p>Không có lỗi cảm biến.</p>}
          {Object.entries(filteredSensorErrors).map(([key, entries]) => (
            <div key={key}>
              <h4 style={styles.keyTitle}>{key.toUpperCase()}</h4>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>STT</th>
                    <th style={styles.th}>Giá trị lỗi</th>
                    <th style={styles.th}>Thời gian</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, idx) => (
                    <tr key={idx} style={styles.errorRow}>
                      <td style={styles.td}>{idx + 1}</td>
                      <td style={styles.tdOrange}>{entry.value}</td>
                      <td style={styles.td}>{new Date(entry.ts).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </section>

        {/* Thống kê */}
        <section>
          <h3 style={{ ...styles.sectionTitle, color: '#00796b' }}>📈 Thống kê dữ liệu</h3>
          {Object.entries(filteredStatistics).length === 0 && <p>Không có dữ liệu thống kê.</p>}
          {Object.entries(filteredStatistics).map(([key, stats]) => (
            <div key={key}>
              <h4 style={styles.keyTitle}>{key.toUpperCase()}</h4>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Min</th>
                    <th style={styles.th}>Max</th>
                    <th style={styles.th}>Trung bình</th>
                    <th style={styles.th}>Phổ biến</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={styles.td}>{stats.min ?? '-'}</td>
                    <td style={styles.td}>{stats.max ?? '-'}</td>
                    <td style={styles.td}>{stats.average ?? '-'}</td>
                    <td style={styles.td}>{stats.mode ?? '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

const styles = {
  title: {
    fontSize: 24,
    fontWeight: 600,
    marginBottom: 20,
  },
  sectionTitle: {
    marginTop: 32,
    marginBottom: 8,
    fontSize: 20,
    fontWeight: 600,
  },
  keyTitle: {
    margin: '10px 0',
    fontWeight: 'bold',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 6,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    overflow: 'hidden',
  },
  th: {
    border: '1px solid #ddd',
    backgroundColor: '#eee',
    padding: '10px 12px',
    textAlign: 'left',
    fontWeight: 600,
    fontSize: 14,
  },
  td: {
    border: '1px solid #ddd',
    padding: '10px 12px',
    fontSize: 14,
  },
  tdOrange: {
    border: '1px solid #ddd',
    padding: '10px 12px',
    fontSize: 14,
    color: '#f57c00',
    fontStyle: 'italic',
  },
  alertRow: {
    backgroundColor: '#ffebee', // nền đỏ nhạt cho dòng bất thường
  },
  errorRow: {
    backgroundColor: '#fff',
  },
  select: {
    padding: '8px 12px',
    fontSize: 14,
    borderRadius: 4,
    border: '1px solid #ccc',
    backgroundColor: '#fff',
    marginLeft: 10,
  },
};

export default AnalyticsPage;
