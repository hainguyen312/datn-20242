const admin = require('firebase-admin');
require('dotenv').config();

const setupFirebase = () => {
    try {
        if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
            throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set');
        }

        let serviceAccount;
        try {
            serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        } catch (parseError) {
            throw new Error('Invalid JSON in FIREBASE_SERVICE_ACCOUNT environment variable');
        }

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            storageBucket: 'gs://chath-c213e.firebasestorage.app'
        });
        console.log("Firebase established successfully");
    } catch (error) {
        console.error("Firebase initialization failed:", error.message);
        process.exit(1); // Thoát chương trình nếu không thể kết nối Firebase
    }
};

setupFirebase();
const Firestore = admin.firestore();

const FirebaseStorage = admin.storage();

module.exports = { Firestore, FirebaseStorage };