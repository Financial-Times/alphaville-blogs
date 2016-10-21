'use strict';

const router = require('express').Router();
const aboutCtrl = require('../lib/controllers/wpStaticCtrl')('about', 'http://ftalphaville.ft.com/about-alphaville-2/?json=1');

router.use('/', aboutCtrl);

module.exports = router;
