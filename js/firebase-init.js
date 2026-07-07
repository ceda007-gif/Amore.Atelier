/* Amore Atelier — Firebase project wiring. Config values here are public
   client identifiers (not secrets); access is enforced by Firestore/Storage
   security rules tied to the admin's Firebase Auth account. */
(function () {
  var firebaseConfig = {
    apiKey: "AIzaSyAfScSUxKQGucgu_ktukAhff5RSMq9aY-c",
    authDomain: "amore-atelier.firebaseapp.com",
    projectId: "amore-atelier",
    storageBucket: "amore-atelier.firebasestorage.app",
    messagingSenderId: "515588130978",
    appId: "1:515588130978:web:482a6700ddc2136f116ffb"
  };
  firebase.initializeApp(firebaseConfig);
  window.AA_ADMIN_EMAIL = 'ceda007@gmail.com';
  window.AA_DB = firebase.firestore();
  window.AA_AUTH = firebase.auth();
  window.AA_STORAGE = firebase.storage();
})();
