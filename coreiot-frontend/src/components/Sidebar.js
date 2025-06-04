// src/components/Sidebar.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const icons = {
  dashboard: (
    <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="white" style={{ marginRight: 10, flexShrink: 0 }}>
      <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8v-10h-8v10zm0-18v6h8V3h-8z" />
    </svg>
  ),
  profile: (
    <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="white" style={{ marginRight: 10, flexShrink: 0 }}>
      <path d="M12 12c2.7 0 4.9-2.2 4.9-4.9S14.7 2.2 12 2.2 7.1 4.4 7.1 7.1 9.3 12 12 12zm0 2.4c-3.3 0-9.9 1.7-9.9 5v2.4h19.8v-2.4c0-3.3-6.6-5-9.9-5z" />
    </svg>
  ),
  devices: (
    <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="white" style={{ marginRight: 10, flexShrink: 0 }}>
      <path d="M6 2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3l-3 3-3-3H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
    </svg>
  ),
  analytics: (
    <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="white" style={{ marginRight: 10, flexShrink: 0 }}>
      <path d="M3 17h2v-7H3v7zm4 0h2V7H7v10zm4 0h2v-4h-2v4zm4 0h2V4h-2v13zm4 0h2v-9h-2v9z" />
    </svg>
  ),
  tables: (
    <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="white" style={{ marginRight: 10, flexShrink: 0 }}>
      <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 8h14v-2H7v2zm0-4h14v-2H7v2zm0-6v2h14V7H7z" />
    </svg>
  ),
  plant: (
    <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" fill="white" style={{ marginRight: 10, flexShrink: 0 }} viewBox="0 0 24 24">
      <path d="M12 2C8 2 5 5 5 9c0 3.5 2.5 6.5 6 7v4H9v2h6v-2h-2v-4c3.5-.5 6-3.5 6-7 0-4-3-7-7-7z" />
    </svg>
  ),
  arrowDown: (
    <svg xmlns="http://www.w3.org/2000/svg" height="14" viewBox="0 0 24 24" width="14" fill="white" style={{ marginLeft: 'auto' }}>
      <path d="M7 10l5 5 5-5z" />
    </svg>
  ),
  arrowUp: (
    <svg xmlns="http://www.w3.org/2000/svg" height="14" viewBox="0 0 24 24" width="14" fill="white" style={{ marginLeft: 'auto' }}>
      <path d="M7 14l5-5 5 5z" />
    </svg>
  ),
};

const menuItems = [
  {
    key: 'profile',
    label: 'Hồ sơ',
    icon: icons.profile,
    subItems: [
      { key: 'profile-account', label: 'Tài khoản', href: '/userinfo' },
      { key: 'profile-devices', label: 'Thiết bị', href: '/profile/devices' },
    ],
  },
  { key: 'devices', label: 'Thiết bị', href: '/devices', icon: icons.devices },
  { key: 'deviceManage', label: 'Quản lý thiết bị', href: '/device-manage', icon: icons.devices },
  { key: 'plantManage', label: 'Quản lý cây trồng', href: '/plant-manage', icon: icons.plant },
  { key: 'analytics', label: 'Phân tích dữ liệu', href: '/analytics', icon: icons.analytics },
  { key: 'tables', label: 'Bảng dữ liệu', href: '/dashboard', icon: icons.tables },
];

function Sidebar() {
  const [openMenuKey, setOpenMenuKey] = useState(null);

  const handleToggle = (key) => {
    setOpenMenuKey(prev => (prev === key ? null : key));
  };

  return (
    <aside style={{
      backgroundColor: '#2c3e50',
      color: 'white',
      width: '250px',
      height: 'calc(100vh - 60px)',
      position: 'fixed',
      top: 60,
      left: 0,
      paddingTop: '20px',
      boxShadow: '2px 0 8px rgba(0,0,0,0.3)',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
    }}>
      <ul style={{ listStyle: 'none', padding: '20px', margin: 0, flexGrow: 1 }}>
        {menuItems.map(({ key, label, href, icon, subItems }) => (
          <li key={key} style={{ marginBottom: '10px' }}>
            {subItems ? (
              <>
                <div
                  onClick={() => handleToggle(key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    padding: '12px 15px',
                    borderRadius: '8px',
                    transition: 'all 0.3s ease',
                    userSelect: 'none',
                    fontSize: '1.1rem',
                    fontWeight: '500',
                    backgroundColor: openMenuKey === key ? 'rgba(255,255,255,0.15)' : 'transparent',
                    boxShadow: openMenuKey === key ? '0 4px 12px rgba(255,255,255,0.3)' : 'none',
                  }}
                  onMouseOver={e => {
                    if (openMenuKey !== key) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                  }}
                  onMouseOut={e => {
                    if (openMenuKey !== key) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {icon}
                  {label}
                  {openMenuKey === key ? icons.arrowUp : icons.arrowDown}
                </div>
                {openMenuKey === key && (
                  <ul style={{ listStyle: 'none', paddingLeft: 30, marginTop: 5 }}>
                    {subItems.map(({ key: subKey, label: subLabel, href: subHref }) => (
                      <li key={subKey} style={{ marginBottom: '10px' }}>
                        <Link
                          to={subHref}
                          style={{
                            color: 'white',
                            textDecoration: 'none',
                            fontSize: '1rem',
                            display: 'block',
                            padding: '8px 10px',
                            borderRadius: '6px',
                            transition: 'background-color 0.3s',
                            userSelect: 'none',
                          }}
                          onMouseOver={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)')}
                          onMouseOut={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          {subLabel}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <Link
                to={href}
                style={{
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: '1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 15px',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 0 0 transparent',
                  userSelect: 'none',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(255,255,255,0.3)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.boxShadow = '0 0 0 transparent';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {icon}
                {label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default Sidebar;
