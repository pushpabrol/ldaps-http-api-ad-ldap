var express = require('express');
var router = express.Router();
var common = require('./common');

router.route('/')
    .post(async function (req, res, error) {
        try {
        const profile = await common.searchWithLdap(req.body.email);
        res.status(200).json(profile);
        }
        catch(error) {
                    next(error);
                }
        
    });

module.exports = router;