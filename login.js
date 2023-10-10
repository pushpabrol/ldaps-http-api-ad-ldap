var express = require('express');
var router = express.Router();
var common = require('./common');


router.route('/')
    .post(async function (req, res, next) {
        try {
        const profile = await common.validateWithLdap(req.body.email || req.body.email, req.body.password);
        res.status(200).json(profile);
        }
        catch(error){
        next(error);
                
        }
    });

module.exports = router;


