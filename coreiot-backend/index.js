const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 3000;

const TOKEN = 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0dW5nbmdvMjUyNUBnbWFpbC5jb20iLCJ1c2VySWQiOiI2MDVjMzJjMC1lZTg5LTExZWYtODdiNS0yMWJjY2Y3ZDI5ZDUiLCJzY29wZXMiOlsiVEVOQU5UX0FETUlOIl0sInNlc3Npb25JZCI6ImViMTM3NTNlLTIwMDQtNGE4OS1iZDVhLTU0MTBkY2U0YzY5ZSIsImV4cCI6MTc0ODY2ODU1NiwiaXNzIjoiY29yZWlvdC5pbyIsImlhdCI6MTc0ODY1OTU1NiwiZmlyc3ROYW1lIjoiTmdvIFR1bmciLCJlbmFibGVkIjp0cnVlLCJpc1B1YmxpYyI6ZmFsc2UsInRlbmFudElkIjoiNjA1M2NlNTAtZWU4OS0xMWVmLTg3YjUtMjFiY2NmN2QyOWQ1IiwiY3VzdG9tZXJJZCI6IjEzODE0MDAwLTFkZDItMTFiMi04MDgwLTgwODA4MDgwODA4MCJ9.zv8QpJ9-p2O63FgEmjK5cBgogvTOAjgoouO1VqfSJql-c_mAp2wefqIzxrMSQhiswlTtsS4rORZrD2ijmwQGjg';
const DEVICE_ID = 'd4314760-06d7-11f0-a887-6d1a184f2bb5';
const BASE_URL = 'https://app.coreiot.io/api';

app.use(cors());
app.use(express.json());

const THRESHOLDS = {
  humidity: { min: 30, max: 90 },
  rain: { min: 0, max: 100 },
  rainfall: { min: 0, max: 100 },
  rainfull: { min: 0, max: 100 },
  temperature: { min: 5, max: 50 },
  waterlevel: { min: 10, max: 300 }
};

// Lấy dữ liệu telemetry 1 lần cho 1 key
async function getTelemetryPaged(deviceId, key, startTs, endTs, pageSize = 1000, page = 0) {
  try {
    const res = await axios.get(`${BASE_URL}/plugins/telemetry/DEVICE/${deviceId}/values/timeseries`, {
      headers: { 'X-Authorization': `Bearer ${TOKEN}` },
      params: {
        keys: key,
        startTs,
        endTs,
        limit: pageSize,
        orderBy: 'DESC',
        useStrictDataTypes: true
      }
    });
    return res.data[key] || [];
  } catch (error) {
    console.error('Error in getTelemetryPaged:', error.message);
    return [];
  }
}

// Tính thống kê đơn giản
function calculateStatistics(values) {
  if (!values || values.length === 0) return {};

  const nums = values.map(v => v.value).filter(v => !isNaN(v) && isFinite(v));
  if (nums.length === 0) return {};

  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const average = nums.reduce((a, b) => a + b, 0) / nums.length;

  // Mode - giá trị xuất hiện nhiều nhất
  const freq = {};
  let mode = nums[0];
  let maxFreq = 0;
  for (const n of nums) {
    freq[n] = (freq[n] || 0) + 1;
    if (freq[n] > maxFreq) {
      maxFreq = freq[n];
      mode = n;
    }
  }

  return { min, max, average, mode };
}

// Phân tích dữ liệu telemetry
function analyzeTelemetry(data, thresholds) {
  let alerts = [];
  let sensorErrors = {};
  let statistics = {};

  for (const key in data) {
    const values = data[key];

    sensorErrors[key] = [];
    for (const item of values) {
      if (item.value < thresholds[key].min) {
        alerts.push({ key, ts: item.ts, value: item.value, alert: 'Dưới ngưỡng thấp' });
      } else if (item.value > thresholds[key].max) {
        alerts.push({ key, ts: item.ts, value: item.value, alert: 'Vượt ngưỡng cao' });
      }
      if (isNaN(item.value) || !isFinite(item.value)) {
        sensorErrors[key].push({ ts: item.ts, value: item.value });
      }
    }

    statistics[key] = calculateStatistics(values);
  }

  return { alerts, sensorErrors, statistics };
}

// API lấy dữ liệu telemetry 2 năm (raw)
app.get('/telemetry', async (req, res) => {
  try {
    const now = new Date();
    const startDate = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());
    const endDate = now;

    const startTs = startDate.getTime();
    const endTs = endDate.getTime();

    const keys = Object.keys(THRESHOLDS);

    const dataEntries = await Promise.all(
      keys.map(async key => {
        const values = await getTelemetryPaged(DEVICE_ID, key, startTs, endTs);
        return [
          key,
          values.map(item => ({ ts: item.ts, value: parseFloat(item.value) }))
        ];
      })
    );

    const data = Object.fromEntries(dataEntries);
    res.json({ keys, data });
  } catch (err) {
    console.error('Error in /telemetry:', err);
    res.status(500).json({ error: 'Lỗi lấy dữ liệu telemetry' });
  }
});

// API lấy dữ liệu phân tích 1 năm (alerts, errors, stats)
app.get('/analyze', async (req, res) => {
  try {
    const now = new Date();
    const startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

    const startTs = startDate.getTime();
    const endTs = now.getTime();

    const keys = Object.keys(THRESHOLDS);

    const dataEntries = await Promise.all(
      keys.map(async key => {
        const values = await getTelemetryPaged(DEVICE_ID, key, startTs, endTs);
        return [
          key,
          values.map(item => ({ ts: item.ts, value: parseFloat(item.value) }))
        ];
      })
    );

    const data = Object.fromEntries(dataEntries);
    const { alerts, sensorErrors, statistics } = analyzeTelemetry(data, THRESHOLDS);

    res.json({ alerts, sensorErrors, statistics });
  } catch (err) {
    console.error('Analyze Error:', err);
    res.status(500).json({ error: 'Lỗi phân tích dữ liệu' });
  }
});

// Các API CRUD thiết bị
app.get('/devices', async (req, res) => {
  try {
    const pageSize = parseInt(req.query.pageSize) || 50;
    const page = parseInt(req.query.page) || 0;
    const response = await axios.get(`${BASE_URL}/tenant/devices`, {
      headers: { 'X-Authorization': `Bearer ${TOKEN}` },
      params: { pageSize, page }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching devices:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ error: error.response?.data || error.message });
  }
});

app.post('/devices', async (req, res) => {
  try {
    const deviceData = req.body;
    const response = await axios.post(`${BASE_URL}/device`, deviceData, {
      headers: { 'X-Authorization': `Bearer ${TOKEN}` }
    });
    res.status(201).json(response.data);
  } catch (error) {
    console.error('Error creating device:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ error: error.response?.data || error.message });
  }
});

app.put('/devices/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const deviceData = req.body;
    const response = await axios.put(`${BASE_URL}/device/${deviceId}`, deviceData, {
      headers: { 'X-Authorization': `Bearer ${TOKEN}` }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error updating device:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ error: error.response?.data || error.message });
  }
});

app.delete('/devices/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    await axios.delete(`${BASE_URL}/device/${deviceId}`, {
      headers: { 'X-Authorization': `Bearer ${TOKEN}` }
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting device:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ error: error.response?.data || error.message });
  }
});

// API lấy thông tin user
app.get('/userinfo', async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/auth/user`, {
      headers: { 'X-Authorization': `Bearer ${TOKEN}` }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching user info:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server đang chạy tại http://localhost:${PORT}`);
});
