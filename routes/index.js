"use strict";

const router = require('express').Router();
const indexCtrl = require('../lib/controllers/indexCtrl');

router.get('/', indexCtrl);

module.exports = router;
