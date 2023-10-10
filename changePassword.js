var express = require('express');
var router = express.Router();
var common = require('./common');


router.route('/')
    .post(async function (req, res, next) {
        try {
            const result = await common.changePasswordWithLdap(req.body.email || req.body.username , req.body.new_password || req.body.password)
            res.status(200).json({ "status" : result});
          } catch (error) {
            next(error);
          }
        });

module.exports = router;



