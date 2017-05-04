var express = require('express');
var router = express.Router();
var common = require('./common');

router.route('/')
    .post(function (req, res) {
        common.validateWithLdap(req.body.email, req.body.password, function (error, profile) {
            if (error) {
                console.log(error);
                res.statusCode = 500;
                res.json(error);
            }
            else {

                res.statusCode = 200;
                res.json(profile);
            }

        });
    });

module.exports = router;


