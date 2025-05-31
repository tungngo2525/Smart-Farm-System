import React from 'react';
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaHome, FaInfoCircle, FaPhoneSquare } from 'react-icons/fa';

function Footer() {
  return (
    <footer style={footerStyle}>
      {/* Logo và mô tả */}
      <div style={sectionStyle}>
        <img
          src="/logo192.png"
          alt="Logo"
          style={{ height: 60, marginBottom: 20 }}
        />
        <p style={{ lineHeight: 1.6, maxWidth: 300 }}>
          SMART FARM cung cấp giải pháp IoT chuyên nghiệp, giúp giám sát và điều khiển thiết bị thông minh dễ dàng.
        </p>
      </div>

      {/* Thông tin liên hệ */}
      <div style={sectionStyle}>
        <h4 style={headingStyle}>Thông tin liên hệ</h4>
        <p style={contactItemStyle}>
          <FaMapMarkerAlt style={iconStyle} /> 123 Đường ABC, Quận 1, TP. HCM
        </p>
        <p style={contactItemStyle}>
          <FaPhoneAlt style={iconStyle} /> (028) 1234 5678
        </p>
        <p style={contactItemStyle}>
          <FaEnvelope style={iconStyle} /> support@coreiot.com
        </p>
      </div>

      {/* Liên kết nhanh */}
      <div style={sectionStyle}>
        <h4 style={headingStyle}>Liên kết nhanh</h4>
        <ul style={linkListStyle}>
          <li>
            <a href="/" style={linkStyle}>
              <FaHome style={iconLinkStyle} /> Trang chủ
            </a>
          </li>
          <li>
            <a href="/about" style={linkStyle}>
              <FaInfoCircle style={iconLinkStyle} /> Giới thiệu
            </a>
          </li>
          <li>
            <a href="/contact" style={linkStyle}>
              <FaPhoneSquare style={iconLinkStyle} /> Liên hệ
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}

const footerStyle = {
  backgroundColor: '#003366',
  color: 'white',
  padding: '50px 40px',
  marginTop: 40,
  fontSize: 15,
  display: 'flex',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  boxShadow: '0 0 15px rgba(0, 0, 0, 0.4)',
  gap: 40,
};

const sectionStyle = {
  flex: '1 1 280px',
  minWidth: 280,
};

const headingStyle = {
  fontSize: 18,
  marginBottom: 20,
  borderBottom: '2px solid #3399ff',
  paddingBottom: 5,
};

const contactItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  marginBottom: 12,
};

const iconStyle = {
  color: '#3399ff',
  minWidth: 20,
  minHeight: 20,
};

const linkListStyle = {
  listStyle: 'none',
  padding: 0,
  margin: 0,
};

const linkStyle = {
  color: 'white',
  textDecoration: 'none',
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  marginBottom: 15,
  fontWeight: 500,
  transition: 'color 0.3s ease',
};

const iconLinkStyle = {
  minWidth: 20,
  minHeight: 20,
};

export default Footer;
