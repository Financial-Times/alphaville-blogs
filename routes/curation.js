"use strict";

const express = require('express');
const router = new express.Router();
const curationCtrl = require('../lib/controllers/curationCtrl');

router.get('/', curationCtrl.index);

router.get('/save', curationCtrl.save);
router.get('/delete', curationCtrl.delete);
router.get('/standfirst-char-limit', curationCtrl.standfirstCharLimit);

module.exports = router;
