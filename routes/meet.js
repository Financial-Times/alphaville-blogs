'use strict';

const router = require('express').Router();
const meetCtrl = require('../lib/controllers/meetCtrl');

router.get('/', meetCtrl.index);
router.get('/:member', meetCtrl.dedicatedPage);

module.exports = router;
