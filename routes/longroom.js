'use strict';

const router = require('express').Router();
const longroomCtrl = require('../lib/controllers/wpStaticCtrl')('about', 'longroom-under-construction', 'long.room', 'Long Room');

router.use('/', longroomCtrl);

module.exports = router;
