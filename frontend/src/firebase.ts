import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBKMlvdvDD3ny22ILHSmap2utFz5ORk6Sw",
  authDomain: "thoughtless-v2.firebaseapp.com",
  projectId: "thoughtless-v2",
  storageBucket: "thoughtless-v2.appspot.com",
  messagingSenderId: "549296244347",
  appId: "1:549296244347:web:fdc21f5202baf98f78c4de",
  measurementId: "G-M0KHH5Z6YY"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);