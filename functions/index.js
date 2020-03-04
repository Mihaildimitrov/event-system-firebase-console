const functions = require('firebase-functions');
const admin = require('firebase-admin');
const request = require('request');
const express = require('express');
const cors = require('cors');

const serviceAccount = require('./event-system-49b35-firebase-adminsdk-kl7dr-ce2f9f4d4e.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "event-system-49b35.appspot.com"
});

const db = admin.firestore();
const bucket = admin.storage().bucket();


// =================
// COMMON FUNCTIONS:
function catchError(error, message) {
    return {
        msgCode: error.code,
        message: message,
        data: error
    }
}

function resolveSuccess(data, message, code) {
    return {
        msgCode: code,
        message: message,
        data: data
    }
}

// const testGetRequest = express();
// testGetRequest.use(cors({
//     origin: true
// }));
// testGetRequest.get('/', (req, res) => {
//     console.log('|-----> TEST GET REQUEST <-----|');
//     console.log(req.body);

//     res.send(resolveSuccess({}, 'Successfully get data', "success/message"));
//     // res.send(catchError('Error getting data', error));
// });
// exports.testGet = functions.https.onRequest(testGetRequest);

// const testPostRequest = express();
// testPostRequest.use(cors({
//     origin: true
// }));
// testPostRequest.post('/', (req, res) => {
//     console.log('|-----> TEST POST REQUEST <-----|');
//     console.log(req.body);

//     res.send(resolveSuccess({}, 'Successfully post data', "success/message"));
//     // res.send(catchError('Error postting data', error));
// });
// exports.testPost = functions.https.onRequest(testPostRequest);

// =============================
// AUTH API:

const signUpUserRequest = express();
signUpUserRequest.use(cors({
    origin: true
}));
signUpUserRequest.post('/', (req, res) => {
    console.log('|-----> Sign Up User Request <-----|');
    console.log(req.body);

    let userEmail = req.body.userEmail;
    let userPassword = req.body.userPassword;
    let userFirstName = req.body.userFirstName;
    let userLastName = req.body.userLastName;
    let userRole = req.body.userRole;
    let userImageUrl = req.body.userImageUrl;
    let createdUser = {
        uid: '',
        email: userEmail,
        first_name: userFirstName,
        last_name: userLastName,
        role: userRole,
        user_image: userImageUrl
    };

    return admin.auth().createUser({
        email: userEmail,
        password: userPassword
    }).then((user) => {
        createdUser['uid'] = user.uid;
        return admin.auth().setCustomUserClaims(user.uid, {
            user_role: userRole
        });
    }).then(() => {
        return addNewUserIntoFirestoreCollection(createdUser).then((data) => {
            return res.send(resolveSuccess(createdUser, "Successfully created new user", "success/message"));
        }).catch((error) => {
            return res.send(catchError(error, 'Unsuccessfully creating new user!'));
        });
    }).catch((error) => {
        console.log('error', error);
        return res.send(catchError(error, 'Unsuccessfully creating new user!'));
    });
});
exports.signUpUser = functions.https.onRequest(signUpUserRequest);

function addNewUserIntoFirestoreCollection(userObject) {
    return new Promise((resolve, reject) => {
        db.collection("users").doc(userObject.uid).set(userObject).then(res => { return resolve(true); }).catch(err => { return reject(new Error(err)); });
    });
}

// END AUTH API:
// =============================