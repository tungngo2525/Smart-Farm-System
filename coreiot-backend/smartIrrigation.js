const express = require('express');
const cors = require('cors');
const axios = require('axios');
const SimpleLinearRegression = require('ml-regression').SimpleLinearRegression;

const app = express();
const PORT = 3000;

const TOKEN = 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0dW5nbmdvMjUyNUBnbWFpbC5jb20iLCJ1c2VySWQiOiI2MDVjMzJjMC1lZTg5LTExZWYtODdiNS0yMWJjY2Y3ZDI5ZDUiLCJzY29wZXMiOlsiVEVOQU5UX0FETUlOIl0sInNlc3Npb25JZCI6IjkzNzQwYjM5LTU1ZTItNDI3NS05NGU5LTFkY2Q0NDhhMmY0OSIsImV4cCI6MTc0NzY1MTcwNCwiaXNzIjoiY29yZWlvdC5pbyIsImlhdCI6MTc0NzY0MjcwNCwiZmlyc3ROYW1lIjoiTmdvIFR1bmciLCJlbmFibGVkIjp0cnVlLCJpc1B1YmxpYyI6ZmFsc2UsInRlbmFudElkIjoiNjA1M2NlNTAtZWU4OS0xMWVmLTg3YjUtMjFiY2NmN2QyOWQ1IiwiY3VzdG9tZXJJZCI6IjEzODE0MDAwLTFkZDItMTFiMi04MDgwLTgwODA4MDgwODA4MCJ9.I_ozwzOWX8-1hFuMcsca7XrjdvUcjc1loYI2ccbuXNjvRNMFtqHPFs6zgxZMC51I1MfvDX5G3jpvauA3kbSkWw';
const DEVICE_ID = 'd4314760-06d7-11f0-a887-6d1a184f2bb5';

const BASE_URL = 'https://app.coreiot.io/api';

app.use(cors());

// Hàm lấy dữ liệu độ ẩm lịch sử (ví dụ lấy 100 điểm gần nhất)
async function getSoilMoistureData() {
  const res = await axios.get(`${BASE_URL}/plugins/telemetry/DEVICE/${DEVICE_ID}/values/timeseries`, {
    headers: { 'X-Authorization': `Bearer ${TOKEN}` },
    params: {
      keys: 'humidity',
      limit: 100,
      orderBy: 'DESC',
    },
  });
  return res.data.humidity || [];
}

// Hàm dự báo độ ẩm sử dụng hồi quy tuyến tính đơn giản
function forecastSoilMoisture(data) {
  // data là mảng object: [{ ts: ..., value: ... }, ...]

  if (data.length < 2) return null;

  // X: thứ tự (index), Y: giá trị độ ẩm
  const X = data.map((_, i) => i);
  const Y = data.map(d => parseFloat(d.value));

  const regression = new SimpleLinearRegression(X, Y);

  // Dự báo 1 bước tiếp theo (index lớn nhất + 1)
  const nextIndex = data.length;
  const predicted = regression.predict(nextIndex);

  return predicted;
}

// Giả lập trạng thái bơm (ON/OFF)
let pumpStatus = 'OFF';

// API dự báo và tự động bật/tắt bơm
app.get('/smart-irrigation', async (req, res) => {
  try {
    const data = await getSoilMoistureData();

    if (data.length === 0) return res.status(500).json({ error: 'Không có dữ liệu độ ẩm' });

    const predictedMoisture = forecastSoilMoisture(data);

    if (predictedMoisture === null) return res.status(500).json({ error: 'Không đủ dữ liệu dự báo' });

    // Ngưỡng độ ẩm tối thiểu, dưới ngưỡng bật bơm
    const moistureThreshold = 40;

    if (predictedMoisture < moistureThreshold) {
      pumpStatus = 'ON';
    } else {
      pumpStatus = 'OFF';
    }

    return res.json({
      predictedMoisture: predictedMoisture.toFixed(2),
      pumpStatus,
      moistureThreshold,
      message: pumpStatus === 'ON' ? 'Tưới cây: Bật bơm' : 'Tưới cây: Tắt bơm',
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Lỗi server' });
  }
});

app.listen(PORT, () => {
  console.log(`Server chạy tại http://localhost:${PORT}`);
});
