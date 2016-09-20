"use strict";

const express = require('express');
const router = new express.Router();
const curationCtrl = require('../lib/controllers/curationCtrl');
const authS3O = require('s3o-middleware');

router.get('/', authS3O, curationCtrl.index);
router.post('/', authS3O, curationCtrl.index);
router.get('/list', authS3O.authS3ONoRedirect, curationCtrl.list);

router.post('/save', authS3O.authS3ONoRedirect, curationCtrl.save);
router.post('/delete', authS3O.authS3ONoRedirect, curationCtrl.delete);

module.exports = router;
