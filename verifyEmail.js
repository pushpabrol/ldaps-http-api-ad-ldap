var express = require('express');
var router = express.Router();
var ldap = require('ldapjs');
var configuration = require('./configuration');
router.route('/')
    .post(function (req, res) {

        res.statusCode = 200;
        res.json({ verified: true });

    });



module.exports = router;