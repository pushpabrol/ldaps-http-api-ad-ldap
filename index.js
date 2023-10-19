// index.js

// BASE SETUP
// =============================================================================

//define variables

import { PORT } from './configuration.js';
// call the packages we need

import express, { Router } from 'express';        // call express
var app = express();                 // define our app using express
import pkg from 'body-parser';
const { urlencoded, json } = pkg;// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(urlencoded({ extended: true }));
app.use(json());
import { jwtCheck, checkAuthorization } from './authorization.js';
// app.use(function (err, req, res, next) {
//     res.setHeader('Content-Type', 'application/json');
//     res.status(500).json({ error: err });
//   });

  
// This is to check that this API is called with Authorization
//app.use(authorization.jwtCheck);

//This is to check the right scope
//app.use(authorization.checkAuthorization);
var port = PORT || 80;        // set our port

// =============================================================================
var router = Router();              // get an instance of the express Router

app.get("/", function (req, res) {
    res.json({ message: 'Welcome to LDAP API!' });
});

router.use(jwtCheck);
router.use(checkAuthorization);

//Login
import login from './login.js';
router.use('/login', login);

//Create
import create from './create.js';
router.use('/create', create);
//Verify
import verifyEmail from './verifyEmail.js';
router.use('/set-email-verified', verifyEmail);

//Get User
import getUser from './getUser.js';
router.use('/getuser', getUser);


//Change Password
import changePassword from './changePassword.js';
router.use('/changepassword', changePassword);


//Delete
import deleteme from './delete.js';
router.use('/delete', deleteme);


// all of our routes will be prefixed with /api
app.use('/api',router);

app.use(function (err, req, res, next) {
    console.error(err);
    // Set the status code based on the error or use a default (500)
    const statusCode = err.status || err.statusCode || 500;
    // Send a JSON response with the error message
    res.status(statusCode).json({ error: err.message, code: err.code, name: err.name });
  });

  


// START THE SERVER
// =============================================================================
app.listen(port, "0.0.0.0");
console.log('LDAP API STARTED AT PORT: ' + port);
