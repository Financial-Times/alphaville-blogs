"use strict";

const router = require('express').Router();
const authorCtrl = require('../lib/controllers/authorCtrl');

/* GET search result page. */
router.get('/', authorCtrl);

module.exports = router;
