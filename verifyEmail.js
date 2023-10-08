var express = require('express');
var router = express.Router();
var ldap = require('ldapjs');
var configuration = require('./configuration');
// TO DO based on requirement
router.route('/')
    .post(function (req, res) {
        res.status(200).json({ verified: true });

    });



module.exports = router;