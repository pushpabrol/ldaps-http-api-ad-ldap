import { Router } from 'express';
var router = Router();
// TO DO based on requirement
router.route('/')
    .post(function (req, res) {
        res.status(200).json({ verified: true });

    });



export default router;