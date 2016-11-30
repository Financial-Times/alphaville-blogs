"use strict";

const router = require('express').Router();
const typeCtrl = require('../lib/controllers/typeCtrl');

/* GET search result page. */
router.get('/:type', typeCtrl);

module.exports = router;
