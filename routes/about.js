'use strict';

const router = require('express').Router();
const aboutCtrl = require('../lib/controllers/wpStaticCtrl')('about', 'about-ft-alphaville', false, 'About FTAV');

router.use('/', aboutCtrl);

module.exports = router;
