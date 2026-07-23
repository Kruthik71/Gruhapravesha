import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase web configuration is public by design. Access is protected by
// Firestore security rules, not by hiding these identifiers.
const firebaseConfig = {
  apiKey: 'AIzaSyBd42w3ShY24-f5FoSw6NY64NgCBFbq4YQ',
  authDomain: 'gruhapravesha-ea7fb.firebaseapp.com',
  projectId: 'gruhapravesha-ea7fb',
  storageBucket: 'gruhapravesha-ea7fb.firebasestorage.app',
  messagingSenderId: '29469168225',
  appId: '1:29469168225:web:332e3266266ddd0e37d020',
};

export const db = getFirestore(initializeApp(firebaseConfig));
