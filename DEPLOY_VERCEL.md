# 🚀 Hướng dẫn Deploy lên Vercel

## Bước 1: Push code lên GitHub

1. Tạo repository mới trên GitHub:
   - Vào https://github.com/new
   - Đặt tên repository (ví dụ: `diageo-wellness`)
   - Chọn **Public** hoặc **Private**
   - **KHÔNG** check "Initialize with README" (vì đã có code rồi)
   - Click **"Create repository"**

2. Push code lên GitHub:

```bash
# Khởi tạo Git (nếu chưa có)
git init

# Thêm tất cả files
git add .

# Commit
git commit -m "Initial commit: Diageo Wellness app with Firebase"

# Thêm remote (thay YOUR_USERNAME và YOUR_REPO bằng thông tin của bạn)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push lên GitHub
git branch -M main
git push -u origin main
```

## Bước 2: Deploy lên Vercel

### Cách 1: Deploy qua Vercel Dashboard (Dễ nhất)

1. Vào https://vercel.com/
2. Đăng nhập bằng GitHub account
3. Click **"Add New Project"**
4. Import repository từ GitHub (chọn repo bạn vừa push)
5. Vercel sẽ tự động detect Vite project
6. **Quan trọng**: Thêm Environment Variables:
   - Click **"Environment Variables"**
   - Thêm các biến sau (lấy từ file `.env` của bạn):
     - `VITE_FIREBASE_API_KEY`
     - `VITE_FIREBASE_AUTH_DOMAIN`
     - `VITE_FIREBASE_PROJECT_ID`
     - `VITE_FIREBASE_STORAGE_BUCKET`
     - `VITE_FIREBASE_MESSAGING_SENDER_ID`
     - `VITE_FIREBASE_APP_ID`
   - Chọn **Production**, **Preview**, và **Development**
7. Click **"Deploy"**
8. Đợi Vercel build và deploy (khoảng 2-3 phút)
9. ✅ Xong! Bạn sẽ có link như: `https://your-app.vercel.app`

### Cách 2: Deploy qua Vercel CLI

1. Cài đặt Vercel CLI:
```bash
npm install -g vercel
```

2. Login vào Vercel:
```bash
vercel login
```

3. Deploy:
```bash
cd C:\Users\Hp\Desktop\WEB\Diageo
vercel
```

4. Làm theo hướng dẫn:
   - Link với project có sẵn? → **No**
   - Project name? → Nhập tên bạn muốn
   - Directory? → `.` (current directory)
   - Override settings? → **No**

5. Thêm Environment Variables:
```bash
vercel env add VITE_FIREBASE_API_KEY
vercel env add VITE_FIREBASE_AUTH_DOMAIN
vercel env add VITE_FIREBASE_PROJECT_ID
vercel env add VITE_FIREBASE_STORAGE_BUCKET
vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID
vercel env add VITE_FIREBASE_APP_ID
```

6. Deploy production:
```bash
vercel --prod
```

## Bước 3: Cấu hình Firebase cho Production

1. Vào Firebase Console > **Authentication** > **Settings** > **Authorized domains**
2. Thêm domain Vercel của bạn:
   - `your-app.vercel.app`
   - `your-app-git-main.vercel.app` (nếu có)
   - Domain custom của bạn (nếu có)

## Bước 4: Kiểm tra

1. Mở link Vercel của bạn
2. Thử đăng nhập với email/password đã tạo trong Firebase
3. Test các chức năng: đặt lịch, xem lịch, sửa, xóa

## 🔄 Auto Deploy

Sau khi link với GitHub, mỗi khi bạn push code lên GitHub:
- Vercel sẽ tự động build và deploy lại
- Bạn sẽ nhận được email thông báo

## 📝 Lưu ý

- ✅ File `.env` đã được thêm vào `.gitignore` (không commit lên GitHub)
- ✅ Environment Variables phải được thêm trong Vercel Dashboard
- ✅ Firebase Authorized Domains phải có domain Vercel
- ✅ File `vercel.json` đã được tạo để cấu hình routing

## 🐛 Troubleshooting

### Lỗi: "Firebase: Error (auth/invalid-api-key)"
→ Kiểm tra Environment Variables trong Vercel đã được thêm đúng chưa

### Lỗi: "This domain is not authorized"
→ Thêm domain Vercel vào Firebase Authorized Domains

### Build failed
→ Kiểm tra logs trong Vercel Dashboard > Deployments > Click vào deployment failed

---

**Chúc bạn deploy thành công! 🎉**
