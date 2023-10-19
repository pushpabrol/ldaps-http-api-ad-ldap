import { Router } from 'express';
var router = Router();
import { changePasswordWithLdap } from './common.js';


router.route('/')
    .post(async function (req, res, next) {
        try {
            const result = await changePasswordWithLdap(req.body.email || req.body.username , req.body.new_password || req.body.password)
            res.status(200).json({ "status" : result});
          } catch (error) {
            next(error);
          }
        });

export default router;



