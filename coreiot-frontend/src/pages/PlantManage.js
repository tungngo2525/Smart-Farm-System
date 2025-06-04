// src/pages/PlantManage.js
import React, { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

function PlantManage() {
  // Data mẫu khởi tạo
  const [plants, setPlants] = useState([
    {
      id: 1,
      name: 'Cà chua',
      plantedDate: '2025-05-01',
      lastFertilize: '2025-05-20',
      lastWatered: '2025-05-25',
      expectedHarvest: '2025-06-15',
    },
    {
      id: 2,
      name: 'Dưa leo',
      plantedDate: '2025-04-25',
      lastFertilize: '2025-05-15',
      lastWatered: '2025-05-23',
      expectedHarvest: '2025-06-10',
    },
  ]);

  // State để thêm cây mới
  const [newPlant, setNewPlant] = useState({
    name: '',
    plantedDate: '',
    lastFertilize: '',
    lastWatered: '',
    expectedHarvest: '',
  });

  // State chỉnh sửa
  const [editingPlantId, setEditingPlantId] = useState(null);
  const [editPlantData, setEditPlantData] = useState({});

  // Thêm cây mới
  const handleAddPlant = () => {
    if (!newPlant.name.trim()) return alert('Vui lòng nhập tên cây trồng');
    setPlants(prev => [
      ...prev,
      {
        ...newPlant,
        id: Date.now(), // tạo id đơn giản
      },
    ]);
    setNewPlant({
      name: '',
      plantedDate: '',
      lastFertilize: '',
      lastWatered: '',
      expectedHarvest: '',
    });
  };

  // Bắt đầu chỉnh sửa
  const startEdit = (plant) => {
    setEditingPlantId(plant.id);
    setEditPlantData({ ...plant });
  };

  // Hủy chỉnh sửa
  const cancelEdit = () => {
    setEditingPlantId(null);
    setEditPlantData({});
  };

  // Lưu chỉnh sửa
  const saveEdit = () => {
    if (!editPlantData.name.trim()) return alert('Vui lòng nhập tên cây trồng');
    setPlants(prev =>
      prev.map(p => (p.id === editingPlantId ? editPlantData : p))
    );
    cancelEdit();
  };

  // Xóa cây
  const deletePlant = (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa cây trồng này?')) return;
    setPlants(prev => prev.filter(p => p.id !== id));
  };

  return (
    <>
      <Header />
      <Sidebar />
      <main style={{ marginLeft: 250, padding: 20, minHeight: 'calc(100vh - 140px)', backgroundColor: '#f8f9fa' }}>
        <h2 style={{ marginBottom: 20 }}>Quản lý Cây trồng</h2>

        {/* Thêm cây mới */}
        <div style={{ marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Tên cây trồng"
            value={newPlant.name}
            onChange={e => setNewPlant({...newPlant, name: e.target.value})}
            style={inputStyle}
          />
          <input
            type="date"
            placeholder="Ngày trồng"
            value={newPlant.plantedDate}
            onChange={e => setNewPlant({...newPlant, plantedDate: e.target.value})}
            style={inputStyle}
          />
          <input
            type="date"
            placeholder="Thời gian bón phân gần nhất"
            value={newPlant.lastFertilize}
            onChange={e => setNewPlant({...newPlant, lastFertilize: e.target.value})}
            style={inputStyle}
          />
          <input
            type="date"
            placeholder="Thời gian tưới cây gần nhất"
            value={newPlant.lastWatered}
            onChange={e => setNewPlant({...newPlant, lastWatered: e.target.value})}
            style={inputStyle}
          />
          <input
            type="date"
            placeholder="Thời gian thu hoạch"
            value={newPlant.expectedHarvest}
            onChange={e => setNewPlant({...newPlant, expectedHarvest: e.target.value})}
            style={inputStyle}
          />
          <button onClick={handleAddPlant} style={buttonStyle}>
            Thêm cây
          </button>
        </div>

        {/* Danh sách cây */}
        <table
          width="100%"
          cellPadding="8"
          style={{ borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}
        >
          <thead>
            <tr style={{ backgroundColor: '#007bff', color: 'white', textAlign: 'left' }}>
              <th style={{ paddingLeft: 12 }}>Tên cây trồng</th>
              <th>Ngày trồng</th>
              <th>Bón phân gần nhất</th>
              <th>Tưới cây gần nhất</th>
              <th>Thu hoạch dự kiến</th>
              <th style={{ width: 160, textAlign: 'center' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {plants.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: 12 }}>
                  Không có cây trồng nào.
                </td>
              </tr>
            )}
            {plants.map((plant) => (
              <tr key={plant.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                <td style={{ paddingLeft: 12 }}>
                  {editingPlantId === plant.id ? (
                    <input
                      type="text"
                      value={editPlantData.name}
                      onChange={e => setEditPlantData({...editPlantData, name: e.target.value})}
                      style={inputStyle}
                      autoFocus
                    />
                  ) : (
                    plant.name
                  )}
                </td>
                {['plantedDate', 'lastFertilize', 'lastWatered', 'expectedHarvest'].map((field) => (
                  <td key={field}>
                    {editingPlantId === plant.id ? (
                      <input
                        type="date"
                        value={editPlantData[field]}
                        onChange={e => setEditPlantData({...editPlantData, [field]: e.target.value})}
                        style={inputStyle}
                      />
                    ) : (
                      plant[field] || '-'
                    )}
                  </td>
                ))}
                <td style={{ textAlign: 'center' }}>
                  {editingPlantId === plant.id ? (
                    <>
                      <button onClick={saveEdit} style={{ ...buttonStyle, backgroundColor: '#28a745', marginRight: 8 }}>
                        Lưu
                      </button>
                      <button onClick={cancelEdit} style={{ ...buttonStyle, backgroundColor: '#6c757d' }}>
                        Hủy
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(plant)} style={{ ...buttonStyle, backgroundColor: '#17a2b8', marginRight: 8 }}>
                        Sửa
                      </button>
                      <button onClick={() => deletePlant(plant.id)} style={{ ...buttonStyle, backgroundColor: '#dc3545' }}>
                        Xóa
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
      <Footer />
    </>
  );
}

const inputStyle = {
  padding: '8px 10px',
  borderRadius: 5,
  border: '1px solid #ced4da',
  fontSize: 15,
  outline: 'none',
  minWidth: 140,
};

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

export default PlantManage;
