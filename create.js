import { Router } from 'express';
const router = Router();
import { createWithLdap } from './common.js';
import util from 'util';

router.route('/')
  .post(async function (req, res, next) {
    const user = req.body;

    try {
      const profile = await createWithLdap(user);
      res.status(201).json(profile || { "status" : "Created successfully!"});
    } catch (error) {
      next(error);
    }
  });

export default router;
