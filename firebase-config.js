// ============================================
// FIREBASE CONFIGURATION
// LJ Services Ticket System
// ============================================

// Your Firebase configuration (from Firebase console)
const firebaseConfig = {
  apiKey: "AIzaSyBVVBJ4RylwN5pHmggd7aXKhVD-R9cIW7M",
  authDomain: "lj-services-group.firebaseapp.com",
  databaseURL: "https://lj-services-group-default-rtdb.firebaseio.com",
  projectId: "lj-services-group",
  storageBucket: "lj-services-group.firebasestorage.app",
  messagingSenderId: "697032093546",
  appId: "1:697032093546:web:950d395f0846c65a9eff13",
  measurementId: "G-179NM33MCX"
};

// ============================================
// INITIALIZE FIREBASE
// ============================================

// Check if Firebase is loaded
if (typeof firebase === 'undefined') {
  console.error('❌ Firebase SDK not loaded. Check your script tags.');
} else {
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  console.log('✅ Firebase initialized successfully!');
  console.log('📡 Database:', firebaseConfig.databaseURL);
}

// ============================================
// MOCK USER FOR TESTING
// (Replace this with your actual Microsoft auth later)
// ============================================

window.currentUser = {
  name: "Kevin R",
  email: "kevinr@ljservicesgroup.com",
  uid: "kevin-test-user"
};

console.log('👤 Current user:', window.currentUser.email);
