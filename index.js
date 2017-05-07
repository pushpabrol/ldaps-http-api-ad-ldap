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
app.use(authorization.jwtCheck);
app.use(authorization.checkAuthorization);
var port = configuration.PORT || 80;        // set our port

// =============================================================================
var router = express.Router();              // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.route('/').get(function (req, res) {
    res.json({ message: 'Welcome to LDAP API!' });
});


//Login
var login = require('./login');
router.use('/login', login);

//Create
var create = require('./create');
router.use('/create', create);


//Verify
var verifyEmail = require('./verifyEmail');
router.use('/verify_email', verifyEmail);

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
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port, "0.0.0.0");
console.log('LDAP API STARTED AT PORT: ' + port);
