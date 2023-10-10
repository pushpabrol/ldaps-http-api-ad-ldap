var express = require('express');
var router = express.Router();
var common = require('./common');

router.route('/')
    .post(async function (req, res, error) {
        try {
        
        // either email or username is required - mail, cn and uid will be checked
        const input = req.body.email || req.body.username;

        const profile = await common.searchWithLdap(input);
        res.status(200).json(profile);
        }
        catch(error) {
                    next(error);
                }
        
    });

module.exports = router;