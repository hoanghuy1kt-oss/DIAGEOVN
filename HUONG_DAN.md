# 🔥 HƯỚNG DẪN SETUP FIREBASE - TIẾNG VIỆT

## Bước 1: Tạo Firebase Project

1. Vào https://console.firebase.google.com/
2. Đăng nhập bằng tài khoản Google
3. Click **"Add project"** (hoặc chọn project có sẵn)
4. Đặt tên project: `diageo-wellness` (hoặc tên bạn muốn)
5. Click **"Continue"** → **"Continue"** → **"Create project"**
6. Đợi Firebase tạo project (khoảng 30 giây)

## Bước 2: Thêm Web App vào Firebase

1. Trong Firebase Console, click biểu tượng **Web** (`</>`)
2. Đặt tên app: `Diageo Wellness`
3. **KHÔNG** check "Also set up Firebase Hosting" (nếu không cần)
4. Click **"Register app"**
5. **COPY** các giá trị config hiển thị (sẽ dùng ở bước sau)

## Bước 3: Bật Authentication (Đăng nhập)

1. Trong menu bên trái, click **"Authentication"**
2. Click **"Get started"**
3. Chọn tab **"Sign-in method"**
4. Click vào **"Email/Password"**
5. Bật **"Enable"** → Click **"Save"**

## Bước 4: Tạo Firestore Database

1. Trong menu bên trái, click **"Firestore Database"**
2. Click **"Create database"**
3. Chọn **"Start in test mode"** (để test nhanh)
4. Chọn location: **"asia-southeast1"** (Singapore - gần VN nhất)
5. Click **"Enable"**

## Bước 5: Cấu hình Firestore Rules (Bảo mật)

1. Vẫn trong **"Firestore Database"**, click tab **"Rules"**
2. Xóa code cũ và paste code này:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /bookings/{bookingId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. Click **"Publish"**

## Bước 6: Tạo User để đăng nhập

1. Vào **"Authentication"** > **"Users"**
2. Click **"Add user"**
3. Nhập:
   - Email: `admin@diageo.com` (hoặc email bạn muốn)
   - Password: `password123` (hoặc password bạn muốn)
4. Click **"Add user"**
5. **Ghi nhớ** email và password này để đăng nhập vào app!

## Bước 7: Lấy Firebase Config

1. Vào **Project Settings** (biểu tượng ⚙️ bên cạnh "Project Overview")
2. Scroll xuống phần **"Your apps"**
3. Click vào Web app bạn đã tạo
4. Bạn sẽ thấy config như này:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "diageo-wellness.firebaseapp.com",
  projectId: "diageo-wellness",
  storageBucket: "diageo-wellness.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

## Bước 8: Cấu hình file .env

1. Trong thư mục project, copy file `.env.example` thành `.env`:
   - Windows: Copy file `.env.example` và đổi tên thành `.env`
   - Hoặc tạo file mới tên `.env`

2. Mở file `.env` và điền thông tin từ Firebase Config:

```env
VITE_FIREBASE_API_KEY=AIzaSy... (lấy từ apiKey)
VITE_FIREBASE_AUTH_DOMAIN=diageo-wellness.firebaseapp.com (lấy từ authDomain)
VITE_FIREBASE_PROJECT_ID=diageo-wellness (lấy từ projectId)
VITE_FIREBASE_STORAGE_BUCKET=diageo-wellness.appspot.com (lấy từ storageBucket)
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789 (lấy từ messagingSenderId)
VITE_FIREBASE_APP_ID=1:123456789:web:abc123 (lấy từ appId)
```

**Lưu ý:** Không có dấu ngoặc kép `"` trong file .env!

## Bước 9: Cài đặt và chạy

1. Mở Terminal/PowerShell trong thư mục project
2. Chạy lệnh:

```bash
npm install
```

3. Sau khi cài đặt xong, chạy:

```bash
npm run dev
```

4. Mở trình duyệt và vào địa chỉ hiển thị (thường là `http://localhost:5173`)

5. **Đăng nhập** bằng email và password bạn đã tạo ở Bước 6!

## ✅ Hoàn thành!

Bây giờ bạn có thể:
- ✅ Đăng nhập vào app
- ✅ Đặt lịch booking
- ✅ Xem, sửa, xóa booking
- ✅ Dữ liệu được lưu trên Firebase (không mất khi refresh trang)

## 🆘 Gặp lỗi?

### Lỗi "Firebase: Error (auth/invalid-api-key)"
→ Kiểm tra lại file `.env`, đảm bảo các giá trị đúng và không có dấu ngoặc kép

### Lỗi "Missing or insufficient permissions"
→ Kiểm tra Firestore Rules đã được cấu hình đúng chưa (Bước 5)

### Lỗi "Firebase: Error (auth/user-not-found)"
→ Tạo user mới trong Firebase Console > Authentication > Users

### Không thấy file .env
→ Tạo file mới tên `.env` (không có extension) trong thư mục gốc của project

---

**Chúc bạn thành công! 🎉**
