# Diageo Wellness - Gym Booking System

Hệ thống đặt lịch phòng gym cho nhân viên Diageo với Firebase Authentication và Firestore Database.

## 🚀 Cài đặt

### 1. Cài đặt Dependencies

```bash
npm install
```

### 2. Thiết lập Firebase

#### Bước 1: Tạo Firebase Project
1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" hoặc chọn project có sẵn
3. Đặt tên project (ví dụ: `diageo-wellness`)
4. Chọn hoặc tắt Google Analytics (tùy chọn)
5. Click "Create project"

#### Bước 2: Thêm Web App
1. Trong Firebase Console, click biểu tượng **Web** (`</>`)
2. Đặt tên app (ví dụ: `Diageo Wellness`)
3. Copy các giá trị config được hiển thị

#### Bước 3: Bật Authentication
1. Vào **Authentication** > **Get started**
2. Chọn tab **Sign-in method**
3. Bật **Email/Password**
4. Click **Save**

#### Bước 4: Tạo Firestore Database
1. Vào **Firestore Database** > **Create database**
2. Chọn **Start in test mode** (hoặc production mode với rules phù hợp)
3. Chọn location (ví dụ: `asia-southeast1` cho Việt Nam)
4. Click **Enable**

#### Bước 5: Cấu hình Firestore Rules (Quan trọng!)
Vào **Firestore Database** > **Rules** và cập nhật:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Chỉ cho phép user đã đăng nhập
    match /bookings/{bookingId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if request.auth != null;
    }
  }
}
```

Click **Publish** để lưu rules.

#### Bước 6: Tạo User để đăng nhập
1. Vào **Authentication** > **Users**
2. Click **Add user**
3. Nhập email và password
4. Click **Add user**

### 3. Cấu hình Environment Variables

1. Copy file `.env.example` thành `.env`:
```bash
cp .env.example .env
```

2. Mở file `.env` và điền thông tin Firebase của bạn:

```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

**Lấy thông tin từ đâu?**
- Vào Firebase Console > Project Settings (⚙️) > General
- Scroll xuống phần "Your apps" > Web app
- Copy các giá trị từ `firebaseConfig`

### 4. Chạy ứng dụng

```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:5173` (hoặc port khác nếu 5173 đã được sử dụng)

## 📝 Cách sử dụng

### Đăng nhập
- Sử dụng email và password đã tạo trong Firebase Authentication
- Sau khi đăng nhập thành công, bạn có thể:
  - Đặt lịch booking mới
  - Xem lịch đã đặt
  - Chỉnh sửa hoặc xóa booking (trong tab Admin)

### Đăng xuất
- Click nút **Logout** ở góc trên bên phải

## 🛠️ Cấu trúc Database

### Collection: `bookings`

Mỗi document có cấu trúc:
```javascript
{
  name: "Nguyen Van A",        // Tên người đặt
  team: "CM",                  // Team/Phòng ban
  date: "2024-01-15",          // Ngày đặt (YYYY-MM-DD)
  slot: "17:00 - 18:00",       // Khung giờ
  createdAt: "2024-01-15T10:30:00.000Z",  // Thời gian tạo
  userId: "user-id-from-auth"  // ID của user đăng nhập
}
```

## 🔒 Bảo mật

- **Authentication**: Chỉ user đã đăng nhập mới có thể truy cập
- **Firestore Rules**: Đảm bảo chỉ user đã xác thực mới có thể đọc/ghi dữ liệu
- **Environment Variables**: Không commit file `.env` lên Git

## 📦 Build cho Production

```bash
npm run build
```

Files sẽ được build vào thư mục `dist/`

## 🐛 Troubleshooting

### Lỗi: "Firebase: Error (auth/invalid-api-key)"
- Kiểm tra lại các giá trị trong file `.env`
- Đảm bảo file `.env` nằm trong thư mục gốc của project

### Lỗi: "Missing or insufficient permissions"
- Kiểm tra Firestore Rules đã được cấu hình đúng chưa
- Đảm bảo user đã đăng nhập

### Lỗi: "Firebase: Error (auth/user-not-found)"
- User chưa được tạo trong Firebase Authentication
- Tạo user mới trong Firebase Console > Authentication > Users

## 📚 Tài liệu tham khảo

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Auth](https://firebase.google.com/docs/auth)
- [Cloud Firestore](https://firebase.google.com/docs/firestore)
