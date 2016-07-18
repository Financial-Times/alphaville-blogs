'use strict';

const router = require('express').Router();
const aboutCtrl = require('../lib/controllers/aboutCtrl');

router.use('/', aboutCtrl);

module.exports = router;
