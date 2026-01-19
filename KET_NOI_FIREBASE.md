# 🔥 HƯỚNG DẪN KẾT NỐI FIREBASE - KHÔNG CẦN ĐĂNG NHẬP

## ⚠️ QUAN TRỌNG: Tạo Firestore Database trước!

### Bước 1: Tạo Firestore Database (BẮT BUỘC - PHẢI LÀM TRƯỚC)

1. Vào Firebase Console: https://console.firebase.google.com/
2. Chọn project **"Diageo"**
3. Vào **Firestore Database** (menu bên trái)
4. Bạn sẽ thấy màn hình với nút **"Create database"** màu vàng
5. Click **"Create database"**
6. Chọn **"Start in test mode"** (để test nhanh)
7. Chọn location: **"asia-southeast1"** (Singapore - gần VN nhất) hoặc location bạn muốn
8. Click **"Enable"**
9. Đợi Firebase tạo database (khoảng 30 giây)

### Bước 2: Sửa Firestore Rules (SAU KHI TẠO DATABASE)

1. Sau khi database được tạo, bạn sẽ thấy các tab: **"Data"**, **"Rules"**, **"Indexes"**, **"Usage"**
2. Click vào tab **"Rules"**
3. Xóa code cũ và paste code này (cho phép mọi người đọc/ghi - không cần đăng nhập):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /bookings/{bookingId} {
      // Cho phép mọi người đọc và ghi (không cần đăng nhập)
      allow read, write: if true;
    }
  }
}
```

**⚠️ LƯU Ý:** Rules này cho phép mọi người truy cập database. Chỉ dùng cho môi trường nội bộ/trusted users.

5. Click **"Publish"** để lưu
6. ✅ 

---

## Bước 2: Lấy Firebase Config

1. Vẫn trong Firebase Console, click **⚙️ Project Settings** (bên cạnh "Project Overview")
2. Scroll xuống phần **"Your apps"**
3. Nếu chưa có Web app, click biểu tượng **Web** (`</>`) và tạo app mới
4. Nếu đã có, click vào Web app đó
5. Bạn sẽ thấy config như này:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "diageo-xxxxx.firebaseapp.com",
  projectId: "diageo-xxxxx",
  storageBucket: "diageo-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

6. **COPY** các giá trị này (sẽ dùng ở bước sau)

---

## Bước 3: Tạo file .env

1. Trong thư mục `C:\Users\Hp\Desktop\WEB\Diageo`
2. Tạo file mới tên `.env` (không có extension, chỉ là `.env`)
3. Mở file `.env` và paste nội dung này (thay các giá trị bằng config của bạn):

```env
VITE_FIREBASE_API_KEY=AIzaSy... (lấy từ apiKey)
VITE_FIREBASE_AUTH_DOMAIN=diageo-xxxxx.firebaseapp.com (lấy từ authDomain)
VITE_FIREBASE_PROJECT_ID=diageo-xxxxx (lấy từ projectId)
VITE_FIREBASE_STORAGE_BUCKET=diageo-xxxxx.appspot.com (lấy từ storageBucket)
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789 (lấy từ messagingSenderId)
VITE_FIREBASE_APP_ID=1:123456789:web:abc123 (lấy từ appId)
```

**Ví dụ cụ thể:**
```env
VITE_FIREBASE_API_KEY=AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz
VITE_FIREBASE_AUTH_DOMAIN=diageo-12345.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=diageo-12345
VITE_FIREBASE_STORAGE_BUCKET=diageo-12345.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=987654321
VITE_FIREBASE_APP_ID=1:987654321:web:xyz789
```

**⚠️ LƯU Ý:**
- Không có dấu ngoặc kép `"` trong file .env
- Không có khoảng trắng thừa
- Mỗi dòng là một biến

---

## Bước 4: Restart Dev Server

1. Dừng server hiện tại (nhấn `Ctrl+C` trong terminal)
2. Chạy lại:
```bash
npm run dev
```

3. Mở trình duyệt: http://localhost:5174/
4. ✅ Bạn sẽ thấy giao diện booking ngay, không cần đăng nhập!

---

## ✅ Checklist

- [ ] Đã sửa Firestore Rules và Publish (allow read, write: if true)
- [ ] Đã lấy Firebase Config từ Project Settings
- [ ] Đã tạo file `.env` với đầy đủ 6 biến
- [ ] Đã restart dev server
- [ ] Đã test: mở app và thấy giao diện booking ngay

---

## 🐛 Nếu gặp lỗi

### Lỗi: "Firebase: Error (auth/invalid-api-key)"
→ Kiểm tra lại file `.env`, đảm bảo:
- Không có dấu ngoặc kép
- Không có khoảng trắng thừa
- Các giá trị đúng từ Firebase Console

### Lỗi: "Missing or insufficient permissions"
→ Kiểm tra:
- Firestore Rules đã được Publish chưa
- Rules có đúng format không (allow read, write: if true)

### Không thấy file .env
→ Trong Windows:
- Mở File Explorer
- Vào thư mục `C:\Users\Hp\Desktop\WEB\Diageo`
- View > Show > File name extensions (bật lên)
- Tạo file mới, đặt tên `.env.` (có dấu chấm ở cuối, Windows sẽ tự bỏ extension)

---

## 📝 Lưu ý về Bảo mật

Vì app không có đăng nhập, Firestore Rules hiện tại cho phép mọi người đọc/ghi dữ liệu. Điều này phù hợp cho:
- ✅ Môi trường nội bộ (internal use)
- ✅ Trusted users only
- ✅ Development/Testing

Nếu cần bảo mật hơn sau này, có thể:
- Thêm lại tính năng đăng nhập
- Hoặc sử dụng Firebase App Check để giới hạn truy cập

---

**Sau khi hoàn thành các bước trên, app sẽ kết nối được với Firebase và sẵn sàng sử dụng! 🎉**
