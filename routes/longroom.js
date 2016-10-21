'use strict';

const router = require('express').Router();
const longroomCtrl = require('../lib/controllers/wpStaticCtrl')('about', 'http://ftalphaville.ft.com/longroom-under-construction/?json=1');

router.use('/', longroomCtrl);

module.exports = router;
