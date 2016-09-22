"use strict";

const express = require('express');
const router = new express.Router();
const curationCtrl = require('../lib/controllers/curationCtrl');
const auth = require('alphaville-auth-middleware');
const restrictedAccess = require('./lib/middlewares/restrictedAccess');

router.get('/', auth(), restrictedAccess, curationCtrl.index);

router.post('/save', restrictedAccess, curationCtrl.save);
router.post('/delete', restrictedAccess, curationCtrl.delete);

module.exports = router;
