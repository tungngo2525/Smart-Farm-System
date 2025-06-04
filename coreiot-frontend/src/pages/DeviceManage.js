// src/pages/DeviceManage.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

const API_BASE = 'http://localhost:3000'; // Địa chỉ backend của bạn

function DeviceManage() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceStatus, setNewDeviceStatus] = useState('active');
  const [editingDevice, setEditingDevice] = useState(null);
  const [editDeviceName, setEditDeviceName] = useState('');
  const [editDeviceStatus, setEditDeviceStatus] = useState('active');

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/devices`);
      setDevices(res.data.data || res.data);
      setError('');
    } catch (err) {
      setError('Lỗi khi tải danh sách thiết bị');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleAddDevice = async () => {
    if (!newDeviceName.trim()) return alert('Vui lòng nhập tên thiết bị');
    try {
      await axios.post(`${API_BASE}/devices`, { name: newDeviceName, type: 'default', status: newDeviceStatus });
      setNewDeviceName('');
      setNewDeviceStatus('active');
      fetchDevices();
    } catch {
      alert('Lỗi khi thêm thiết bị');
    }
  };

  const startEdit = (device) => {
    setEditingDevice(device);
    setEditDeviceName(device.name);
    setEditDeviceStatus(device.status || 'active');
  };

  const cancelEdit = () => {
    setEditingDevice(null);
    setEditDeviceName('');
    setEditDeviceStatus('active');
  };

  const saveEdit = async () => {
    if (!editDeviceName.trim()) return alert('Vui lòng nhập tên thiết bị');
    try {
      await axios.put(`${API_BASE}/devices/${editingDevice.id}`, {
        ...editingDevice,
        name: editDeviceName,
        status: editDeviceStatus,
      });
      cancelEdit();
      fetchDevices();
    } catch {
      alert('Lỗi khi cập nhật thiết bị');
    }
  };

  const deleteDevice = async (deviceId) => {
    if (!window.confirm('Bạn có chắc muốn xóa thiết bị này?')) return;
    try {
      await axios.delete(`${API_BASE}/devices/${deviceId}`);
      fetchDevices();
    } catch {
      alert('Lỗi khi xóa thiết bị');
    }
  };

  // Hàm toggle trạng thái thiết bị
  const toggleDeviceStatus = async (device) => {
    const newStatus = device.status === 'active' ? 'inactive' : 'active';
    try {
      await axios.put(`${API_BASE}/devices/${device.id}`, {
        ...device,
        status: newStatus,
      });
      fetchDevices();
    } catch {
      alert('Lỗi khi thay đổi trạng thái thiết bị');
    }
  };

  // Icons giữ nguyên (iconEdit, iconDelete, iconSave, iconCancel)...

  const iconEdit = (
    <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: 6 }}>
      <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.06 4.09l-2.122-2.122 1.44-1.44a.5.5 0 0 1 .706 0l1.418 1.412zm-3.3 2.113L4 12.25V15h2.75l8.204-8.204-2.752-2.743z"/>
    </svg>
  );

  const iconDelete = (
    <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: 6 }}>
      <path d="M5.5 5.5A.5.5 0 0 1 6 5h4a.5.5 0 0 1 0 1H6a.5.5 0 0 1-.5-.5zm0 2A.5.5 0 0 1 6 7h4a.5.5 0 0 1 0 1H6a.5.5 0 0 1-.5-.5zm0 2A.5.5 0 0 1 6 9h4a.5.5 0 0 1 0 1H6a.5.5 0 0 1-.5-.5z"/>
      <path fillRule="evenodd" d="M14 3.5v-1a.5.5 0 0 0-.5-.5H10.5v-1a.5.5 0 0 0-.5-.5H6a.5.5 0 0 0-.5.5v1H2.5a.5.5 0 0 0-.5.5v1H14zm-11 1V14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4.5H3z"/>
    </svg>
  );

  const iconSave = (
    <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: 6 }}>
      <path d="M8 0a8 8 0 1 0 8 8A8 8 0 0 0 8 0zm3.5 8.5a.5.5 0 0 1-.5.5H8.707l1.147 1.146a.5.5 0 0 1-.708.708L8 9.707l-2.146 2.147a.5.5 0 0 1-.708-.708L7.293 9H5a.5.5 0 0 1 0-1h5z"/>
    </svg>
  );

  const iconCancel = (
    <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: 6 }}>
      <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
    </svg>
  );

  return (
    <>
      <Header />
      <Sidebar />
      <main style={{ marginLeft: 250, padding: 20, minHeight: 'calc(100vh - 140px)', backgroundColor: '#f8f9fa' }}>
        <h2 style={{ marginBottom: 20 }}>Quản lý Thiết bị</h2>

        {/* Thêm thiết bị mới */}
        <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
          <input
            type="text"
            placeholder="Tên thiết bị mới"
            value={newDeviceName}
            onChange={(e) => setNewDeviceName(e.target.value)}
            style={{
              padding: '10px 12px',
              width: 300,
              borderRadius: 5,
              border: '1px solid #ced4da',
              fontSize: 16,
              outline: 'none',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)',
              transition: 'border-color 0.3s',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#80bdff')}
            onBlur={(e) => (e.target.style.borderColor = '#ced4da')}
          />
          <select
            value={newDeviceStatus}
            onChange={(e) => setNewDeviceStatus(e.target.value)}
            style={{
              padding: '10px 12px',
              borderRadius: 5,
              border: '1px solid #ced4da',
              fontSize: 16,
              outline: 'none',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)',
              transition: 'border-color 0.3s',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#80bdff')}
            onBlur={(e) => (e.target.style.borderColor = '#ced4da')}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button
            onClick={handleAddDevice}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              padding: '10px 18px',
              borderRadius: 5,
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: 16,
              boxShadow: '0 4px 8px rgba(0,123,255,0.4)',
              transition: 'background-color 0.3s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#0056b3')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#007bff')}
          >
            Thêm thiết bị
          </button>
        </div>

        {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}

        {loading ? (
          <div>Đang tải thiết bị...</div>
        ) : (
          <table
            width="100%"
            cellPadding="8"
            style={{ borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}
          >
            <thead>
              <tr style={{ backgroundColor: '#007bff', color: 'white', textAlign: 'left' }}>
                <th style={{ paddingLeft: 12 }}>Tên thiết bị</th>
                <th>Loại</th>
                <th>Trạng thái</th>
                <th>Thời gian tạo</th>
                <th style={{ width: 220, textAlign: 'center' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {devices.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: 12 }}>
                    Không có thiết bị nào.
                  </td>
                </tr>
              )}
              {devices.map((device) => (
                <tr key={device.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                  <td style={{ paddingLeft: 12 }}>
                    {editingDevice && editingDevice.id === device.id ? (
                      <input
                        type="text"
                        value={editDeviceName}
                        onChange={(e) => setEditDeviceName(e.target.value)}
                        style={{
                          padding: 6,
                          width: '90%',
                          borderRadius: 4,
                          border: '1px solid #ced4da',
                          fontSize: 15,
                          outline: 'none',
                        }}
                        autoFocus
                      />
                    ) : (
                      device.name
                    )}
                  </td>
                  <td>{device.type || '-'}</td>
                  <td style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {/* Nút bật/tắt trạng thái */}
                    {editingDevice && editingDevice.id === device.id ? (
                      <select
                        value={editDeviceStatus}
                        onChange={(e) => setEditDeviceStatus(e.target.value)}
                        style={{
                          padding: 6,
                          borderRadius: 4,
                          border: '1px solid #ced4da',
                          fontSize: 15,
                          outline: 'none',
                          width: '90%',
                        }}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    ) : (
                      <>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: 20,
                            color: device.status === 'active' ? 'white' : '#6c757d',
                            backgroundColor: device.status === 'active' ? '#28a745' : '#e2e3e5',
                            display: 'inline-block',
                            fontWeight: '600',
                            fontSize: 14,
                            userSelect: 'none',
                            minWidth: 70,
                            textAlign: 'center',
                          }}
                        >
                          {device.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                        <button
                          onClick={() => toggleDeviceStatus(device)}
                          style={{
                            cursor: 'pointer',
                            border: 'none',
                            backgroundColor: device.status === 'active' ? '#dc3545' : '#28a745',
                            color: 'white',
                            padding: '5px 12px',
                            borderRadius: 20,
                            fontWeight: '600',
                            fontSize: 14,
                            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                            transition: 'background-color 0.3s ease',
                          }}
                          title={device.status === 'active' ? 'Tắt thiết bị' : 'Bật thiết bị'}
                        >
                          {device.status === 'active' ? 'Tắt' : 'Bật'}
                        </button>
                      </>
                    )}
                  </td>
                  <td>{device.createdAt ? new Date(device.createdAt).toLocaleString('vi-VN') : '-'}</td>
                  <td style={{ textAlign: 'center' }}>
                    {editingDevice && editingDevice.id === device.id ? (
                      <>
                        <button
                          onClick={saveEdit}
                          style={{
                            ...buttonStyle,
                            backgroundColor: '#28a745',
                            marginRight: 10,
                          }}
                          title="Lưu"
                        >
                          {iconSave} Lưu
                        </button>
                        <button
                          onClick={cancelEdit}
                          style={{
                            ...buttonStyle,
                            backgroundColor: '#6c757d',
                          }}
                          title="Hủy"
                        >
                          {iconCancel} Hủy
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(device)}
                          style={{
                            ...buttonStyle,
                            backgroundColor: '#17a2b8',
                            marginRight: 10,
                          }}
                          title="Sửa"
                        >
                          {iconEdit} Sửa
                        </button>
                        <button
                          onClick={() => deleteDevice(device.id)}
                          style={{
                            ...buttonStyle,
                            backgroundColor: '#dc3545',
                          }}
                          title="Xóa"
                        >
                          {iconDelete} Xóa
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
      <Footer />
    </>
  );
}

const buttonStyle = {
  color: 'white',
  border: 'none',
  borderRadius: 5,
  padding: '7px 14px',
  fontWeight: '600',
  fontSize: 14,
  cursor: 'pointer',
  boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
  transition: 'background-color 0.3s ease, transform 0.15s ease',
};

export default DeviceManage;
