'use strict';

const router = require('express').Router();
const meetCtrl = require('../lib/controllers/meetCtrl');

router.get('/', meetCtrl);

module.exports = router;
