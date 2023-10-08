const express = require('express');
const router = express.Router();
const common = require('./common');
const util = require('util');

router.route('/')
  .post(async function (req, res, next) {
    const user = req.body;

    try {
      const profile = await common.createWithLdap(user);
      res.status(201).json(profile || { "status" : "Created successfully!"});
    } catch (error) {
      next(error);
    }
  });

module.exports = router;
