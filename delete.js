var express = require('express');
var router = express.Router();
var common = require('./common');
router.route('/')
    .post(async function (req, res, next) {
        try {
        var cnOrId = req.body.cn || req.body.id;
        const deleted = await common.deleteWithLdap(cnOrId);
        console.log(deleted);
        res.status(200).json({"success" : true});
        }
        catch(error){
            next(error)
        }

    });

module.exports = router;





