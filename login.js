import { Router } from 'express';
var router = Router();
import { validateWithLdap } from './common.js';


router.route('/')
    .post(async function (req, res, next) {
        try {
        const profile = await validateWithLdap(req.body.email || req.body.username, req.body.password);
        res.status(200).json(profile);
        }
        catch(error){
        console.log(error);
        next(error);
                
        }
    });

export default router;


