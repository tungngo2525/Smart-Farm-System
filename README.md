# Smart Farm System

Hệ thống quản lý nông nghiệp thông minh sử dụng IoT (Internet of Things) để thu thập, giám sát và phân tích dữ liệu môi trường nhằm nâng cao hiệu quả tưới tiêu và chăm sóc cây trồng.

---

## Mục tiêu dự án

- Thu thập dữ liệu thời gian thực từ các cảm biến như độ ẩm đất, nhiệt độ, mực nước, lượng mưa, ...
- Xử lý và phân tích dữ liệu để phát hiện các giá trị bất thường và cảnh báo kịp thời.
- Đề xuất các hành động tự động hoặc hỗ trợ con người như tưới cây khi cần thiết.
- Xây dựng giao diện dashboard web trực quan để giám sát và quản lý thiết bị IoT.
- Quản lý và cấu hình thiết bị dễ dàng thông qua nền tảng CoreIoT.

---

## Công nghệ sử dụng

- **Backend:** Node.js, Express, Axios (giao tiếp API với CoreIoT)
- **Frontend:** ReactJS, HTML, CSS (giao diện người dùng)
- **Nền tảng IoT:** CoreIoT để quản lý thiết bị và dữ liệu telemetry
- **Quản lý mã nguồn:** Git, GitHub

---

## Hướng dẫn cài đặt và chạy dự án

### Backend

1. Clone repository và chuyển vào thư mục backend
   ```bash
   git clone https://github.com/tungngo2525/Smart-Farm-System.git
   cd Smart-Farm-System/backend
   node index.js 

2. Chạy thư mục frontend
   npm start
   Dự án sẽ chạy trên http://localhost/3001
