import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc } from 'firebase/firestore/lite';
import { getStorage, uploadBytes } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyCDd1N_lFsNX4VTkJ8psLiHv5WXfRnMo5U',
  authDomain: 'zackpi-314.firebaseapp.com',
  projectId: 'zackpi-314',
  storageBucket: 'zackpi-314.appspot.com',
  messagingSenderId: '284710809686',
  appId: '1:284710809686:web:d9e83a3d2080b43e6a8bf7',
  measurementId: 'G-9EVL8RHFC5',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

export default app;
export { analytics, auth, firestore, storage };
