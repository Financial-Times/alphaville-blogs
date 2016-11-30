"use strict";

const router = require('express').Router();
const seriesCtrl = require('../lib/controllers/seriesCtrl');

/* GET search result page. */
router.get('/:series', seriesCtrl);

module.exports = router;
