'use strict';

const router = require('express').Router();
const aboutCtrl = require('../lib/controllers/wpStaticCtrl')('about', 'about-alphaville-2');

router.use('/', aboutCtrl);

module.exports = router;
