"use strict";

const router = require('express').Router();
const mostPopularCtrl = require('../lib/controllers/mostPopularCtrl');

router.get('/', mostPopularCtrl);

module.exports = router;
