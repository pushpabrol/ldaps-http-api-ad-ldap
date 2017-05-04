var express = require('express');
var router = express.Router();
var common = require('./common');
router.route('/')
    .post(function (req, res) {
        
    console.log(req.body);
    var user = req.body;
   common.createWithLdap(user, function(error,profile){
if(error)
                    {

                        res.statusCode = 500;
                        res.json(error);
                    }
                    else
                    {
                        
                        res.statusCode = 200;
                        res.json(profile);
                    }

   });

    });

    module.exports = router;
   
 