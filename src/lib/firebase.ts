// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC34COqFaRIVCLlEnM0-CVC0eLJAEbOVBE",
  authDomain: "github-rag-c7280.firebaseapp.com",
  projectId: "github-rag-c7280",
  storageBucket: "github-rag-c7280.firebasestorage.app",
  messagingSenderId: "86261848308",
  appId: "1:86261848308:web:225546ac10a3f0a03ce6a1"
};


// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// // import { getAnalytics } from "firebase/analytics";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional

import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { Download } from "lucide-react";

// const firebaseConfig = {
//   apiKey: "AIzaSyC5TfAzXuWiXxocK2XsZDVbR8VlrN1Nu1o",
//   authDomain: "codesage-ai-576ed.firebaseapp.com",
//   projectId: "codesage-ai-576ed",
//   storageBucket: "codesage-ai-576ed.firebasestorage.app",
//   messagingSenderId: "207041245592",
//   appId: "1:207041245592:web:be0060026d70b4d75a3bed",
//   measurementId: "G-XYJRFMQC66"
// };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app)

export async function uploadFile(file: File, setProgress?: (progress: number) => void) {
  return new Promise((resolve, reject) => {
    try {
      const storageRef = ref(storage, file.name);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        snapshot => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          if (setProgress) setProgress(progress);
          switch (snapshot.state) {
            case 'paused':
              console.log('upload is paused');
              break;
            case 'running':
              console.log('upload is running');
              break;
          }
        },
        error => {
          reject(error);
        },()=>{
            getDownloadURL(uploadTask.snapshot.ref).then(downloadUrl=>{
                resolve(downloadUrl as string)
            })
        }
      );
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
}