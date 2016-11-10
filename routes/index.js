"use strict";

const router = require('express').Router();
const indexListCtrl = require('../lib/controllers/indexListCtrl');

router.get('/', indexListCtrl);

module.exports = router;
