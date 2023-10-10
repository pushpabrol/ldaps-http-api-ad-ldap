var express = require('express');
var router = express.Router();
var common = require('./common');
router.route('/')
    .post(async function (req, res, next) {
        try {
        // id is required, if the id is a GUID, we compare with objectGUID otherwise we look for the value in mail, sAMAccountName or cn
        const id = req.body.id;
        const deleted = await common.deleteWithLdap(id);
        console.log(deleted);
        res.status(200).json({"success" : true});
        }
        catch(error){
            next(error)
        }

    });

module.exports = router;





