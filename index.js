// index.js

// BASE SETUP
// =============================================================================

//define variables

var configuration = require('./configuration');
// call the packages we need

var express = require('express');        // call express
var app = express();                 // define our app using express
var bodyParser = require('body-parser');
// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
var authorization = require('./authorization');
// app.use(function (err, req, res, next) {
//     res.setHeader('Content-Type', 'application/json');
//     res.status(500).json({ error: err });
//   });

  
// This is to check that this API is called with Authorization
//app.use(authorization.jwtCheck);

//This is to check the right scope
//app.use(authorization.checkAuthorization);
var port = configuration.PORT || 80;        // set our port

// =============================================================================
var router = express.Router();              // get an instance of the express Router

app.get("/", function (req, res) {
    res.json({ message: 'Welcome to LDAP API!' });
});

router.use(authorization.jwtCheck);
router.use(authorization.checkAuthorization);

//Login
var login = require('./login');
router.use('/login', login);

//Create
var create = require('./create');
router.use('/create', create);
//Verify
var verifyEmail = require('./verifyEmail');
router.use('/set-email-verified', verifyEmail);

//Get User
var getUser = require('./getUser');
router.use('/getuser', getUser);


//Change Password
var changePassword = require('./changePassword');
router.use('/changepassword', changePassword);


//Delete
var deleteme = require('./delete');
router.use('/delete', deleteme);


// all of our routes will be prefixed with /api
app.use('/api',router);

app.use(function (err, req, res, next) {

    console.error(err);
    // Set the status code based on the error or use a default (500)
    const statusCode = err.status || err.statusCode || 500;
    // Send a JSON response with the error message
    res.status(statusCode).json({ error: err.message });
  });
  


// START THE SERVER
// =============================================================================
app.listen(port, "0.0.0.0");
console.log('LDAP API STARTED AT PORT: ' + port);
