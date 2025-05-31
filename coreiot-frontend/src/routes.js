// src/AppRoutes.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';

import Dashboard from './pages/Dashboard';
import Devices from './pages/Devices';          
import DeviceManage from './pages/DeviceManage';
import PlantManage from './pages/PlantManage';  // Trang quản lý cây trồng mới
import UserInfo from './pages/UserInfo';
import AnalyticsPage from './pages/AnalyticsPage';
import Login from './Login';

function RequireAuth({ loggedIn }) {
  if (!loggedIn) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function AppRoutes() {
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <Router>
      <Routes>
        {/* Route công khai */}
        <Route path="/login" element={<Login onLoginSuccess={() => setLoggedIn(true)} />} />

        {/* Các route yêu cầu đăng nhập */}
        <Route element={<RequireAuth loggedIn={loggedIn} />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/devices" element={<Devices />} />
          <Route path="/device-manage" element={<DeviceManage />} />
          <Route path="/plant-manage" element={<PlantManage />} />   {/* Route mới */}
          <Route path="/userinfo" element={<UserInfo />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Route>

        {/* Redirect tất cả các đường dẫn khác về login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default AppRoutes;
