"use strict";

const express = require('express');
const router = new express.Router();
const curationCtrl = require('../lib/controllers/curationCtrl');

router.get('/', curationCtrl.index);
router.get('/list', curationCtrl.list);

router.post('/save', curationCtrl.save);
router.post('/delete', curationCtrl.delete);

module.exports = router;
