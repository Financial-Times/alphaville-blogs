"use strict";

const router = require('express').Router();
const searchCtrl = require('../lib/controllers/searchCtrl');

/* GET search result page. */
router.get('/', searchCtrl);

module.exports = router;
