import { Router } from 'express';
var router = Router();
import { deleteWithLdap } from './common.js';
router.route('/')
    .post(async function (req, res, next) {
        try {
        // id is required, if the id is a GUID, we compare with objectGUID otherwise we look for the value in mail, sAMAccountName or cn
        const id = req.body.id;
        const deleted = await deleteWithLdap(id);
        console.log(deleted);
        res.status(200).json({"success" : true});
        }
        catch(error){
            next(error)
        }

    });

export default router;





