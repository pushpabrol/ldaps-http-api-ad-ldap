import { Router } from 'express';
var router = Router();
import { searchWithLdap } from './common.js';

router.route('/')
    .post(async function (req, res, error) {
        try {
        
        // either email or username is required - mail, cn and uid will be checked
        const input = req.body.email || req.body.username;

        const profile = await searchWithLdap(input);
        res.status(200).json(profile);
        }
        catch(error) {
                    next(error);
                }
        
    });

export default router;