# 🔍 HƯỚNG DẪN DEBUG - TẠI SAO DỮ LIỆU KHÔNG HIỂN THỊ

## ✅ Đã sửa các vấn đề:

1. ✅ Sửa lỗi import console.log ở sai vị trí
2. ✅ Thêm error handling cho Firebase initialization
3. ✅ Thêm logging chi tiết để debug
4. ✅ Kiểm tra environment variables

## 📋 Các bước kiểm tra:

### Bước 1: Kiểm tra Console Logs

1. Mở Developer Console (F12)
2. Refresh trang (F5)
3. Kiểm tra các log sau (theo thứ tự):

```
🔧 Firebase Config Check:
  - API Key: ✅ Set hoặc ❌ Missing
  - Auth Domain: ✅ Set hoặc ❌ Missing
  - Project ID: ✅ Set hoặc ❌ Missing
  ...
```

Nếu thấy "❌ Missing" → **Vấn đề:** Environment variables chưa được load
→ **Giải pháp:** Kiểm tra file `.env`

---

```
🔍 Firebase DB object: [Firestore object]
🔍 Firebase DB type: object
```

Nếu thấy `undefined` → **Vấn đề:** Firebase chưa được khởi tạo
→ **Giải pháp:** Kiểm tra file `firebase.js` và `.env`

---

```
🚀 Bắt đầu kết nối Firestore...
📦 Database object: [object]
📝 Query created: [Query object]
✅ onSnapshot listener đã được thiết lập
```

Nếu KHÔNG thấy các log này → **Vấn đề:** useEffect không chạy hoặc có lỗi
→ **Giải pháp:** Kiểm tra React DevTools

---

```
📥 Snapshot received: [Snapshot]
📊 Snapshot size: X
📄 Snapshot docs: X
📋 Document ID: [id] Data: [data]
🔥 Đã tải: X bookings Source: Server hoặc Local Cache
✅ Setting registrations: [array]
```

Nếu thấy:
- `Snapshot size: 0` → **Vấn đề:** Không có dữ liệu trong Firestore HOẶC Rules chặn đọc
- `Error fetching bookings` → **Vấn đề:** Lỗi kết nối hoặc permission
- Không thấy log này → **Vấn đề:** onSnapshot không được gọi

---

```
👥 AdminView - Total registrations: X
👥 AdminView - Registrations data: [array]
🔍 AdminView - Filtered registrations: X
```

Nếu thấy:
- `Total registrations: 0` nhưng trong Firestore có dữ liệu → **Vấn đề:** Dữ liệu không được load vào state
- `Filtered registrations: 0` nhưng `Total registrations: > 0` → **Vấn đề:** Filter đang active

---

### Bước 2: Kiểm tra Firestore Rules

1. Vào Firebase Console: https://console.firebase.google.com/
2. Chọn project "Diageo"
3. Vào **Firestore Database** > tab **Rules**
4. Đảm bảo rules như sau:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /bookings/{bookingId} {
      allow read, write: if true;
    }
  }
}
```

5. **QUAN TRỌNG:** Click **"Publish"** để lưu rules!

---

### Bước 3: Kiểm tra Environment Variables

1. Mở file `.env` trong thư mục project
2. Đảm bảo có đầy đủ 6 biến:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

3. **QUAN TRỌNG:** Sau khi sửa `.env`, phải **restart dev server**:
   - Dừng server (Ctrl+C)
   - Chạy lại: `npm run dev`

---

### Bước 4: Kiểm tra Dữ liệu trong Firestore

1. Vào Firebase Console > Firestore Database > tab **Data**
2. Kiểm tra collection `bookings` có dữ liệu không
3. Kiểm tra format dữ liệu:
   - `date`: Format phải là "YYYY-MM-DD" (ví dụ: "2026-01-19")
   - `slot`: Format có thể là "11:00-12:00" hoặc "11:00 - 12:00"
   - `name`: String
   - `team`: String (optional)

---

### Bước 5: Kiểm tra Network Tab

1. Mở Developer Console (F12)
2. Vào tab **Network**
3. Refresh trang
4. Tìm các request đến Firebase:
   - Tìm request có domain `firestore.googleapis.com`
   - Kiểm tra Status Code:
     - `200` = OK
     - `403` = Permission denied (kiểm tra Rules)
     - `404` = Not found (kiểm tra collection name)
     - Khác = Lỗi khác

---

## 🐛 Các lỗi thường gặp và cách sửa:

### Lỗi 1: "Missing Firebase config"
**Nguyên nhân:** Environment variables chưa được set
**Giải pháp:** 
1. Kiểm tra file `.env`
2. Restart dev server

### Lỗi 2: "Permission denied"
**Nguyên nhân:** Firestore Rules chặn đọc/ghi
**Giải pháp:**
1. Vào Firebase Console > Firestore > Rules
2. Đảm bảo có: `allow read, write: if true;`
3. Click "Publish"

### Lỗi 3: Dữ liệu có trong Firestore nhưng không hiển thị
**Nguyên nhân có thể:**
- onSnapshot không được gọi
- Dữ liệu không được set vào state
- Filter đang active

**Giải pháp:**
1. Kiểm tra console logs
2. Kiểm tra xem có filter nào đang active không
3. Clear filters và thử lại

### Lỗi 4: "Snapshot size: 0" nhưng có dữ liệu trong Firestore
**Nguyên nhân:** 
- Rules chặn đọc
- Query sai collection name
- Dữ liệu ở database khác

**Giải pháp:**
1. Kiểm tra Rules
2. Kiểm tra collection name trong code: `collection(db, 'bookings')`
3. Kiểm tra database ID trong Firebase Console

---

## 📞 Nếu vẫn không được:

1. Copy TẤT CẢ logs từ Console
2. Chụp màn hình Firestore Rules
3. Chụp màn hình Firestore Data
4. Gửi cho tôi để kiểm tra tiếp

---

## ✅ Checklist cuối cùng:

- [ ] Console hiển thị "✅ Firebase app initialized successfully"
- [ ] Console hiển thị "✅ Firestore initialized successfully"
- [ ] Console hiển thị "✅ onSnapshot listener đã được thiết lập"
- [ ] Console hiển thị "🔥 Đã tải: X bookings"
- [ ] Console hiển thị "👥 AdminView - Total registrations: X" (với X > 0)
- [ ] Firestore Rules đã được Publish
- [ ] File `.env` có đầy đủ 6 biến
- [ ] Dev server đã được restart sau khi sửa `.env`
