"use strict";

const router = require('express').Router();
const mostReadCtrl = require('../lib/controllers/mostReadCtrl');

router.get('/', mostReadCtrl);

module.exports = router;
