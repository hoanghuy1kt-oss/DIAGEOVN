// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your Firebase config - Replace with your actual config from Firebase Console
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Debug: Kiểm tra environment variables
console.log("🔧 Firebase Config Check:");
console.log("  - API Key:", firebaseConfig.apiKey ? "✅ Set" : "❌ Missing");
console.log("  - Auth Domain:", firebaseConfig.authDomain ? "✅ Set" : "❌ Missing");
console.log("  - Project ID:", firebaseConfig.projectId ? "✅ Set" : "❌ Missing");
console.log("  - Storage Bucket:", firebaseConfig.storageBucket ? "✅ Set" : "❌ Missing");
console.log("  - Messaging Sender ID:", firebaseConfig.messagingSenderId ? "✅ Set" : "❌ Missing");
console.log("  - App ID:", firebaseConfig.appId ? "✅ Set" : "❌ Missing");

// Validate config
const missingConfig = Object.entries(firebaseConfig).filter(([key, value]) => !value);
if (missingConfig.length > 0) {
  console.error("❌ Missing Firebase config:", missingConfig.map(([key]) => key).join(", "));
  console.error("⚠️ Vui lòng kiểm tra file .env và đảm bảo tất cả biến đã được set!");
}

// Initialize Firebase
let app;
let db;

try {
  app = initializeApp(firebaseConfig);
  console.log("✅ Firebase app initialized successfully");
  
  // Initialize Cloud Firestore and get a reference to the service
  db = getFirestore(app);
  console.log("✅ Firestore initialized successfully");
} catch (error) {
  console.error("❌ Error initializing Firebase:", error);
  // Không throw error để tránh crash app, chỉ log
  // Tạo một dummy db object để app vẫn chạy được
  db = null;
}

export { db };
export default app;
