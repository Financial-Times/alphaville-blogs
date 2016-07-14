"use strict";

const router = require('express').Router();
const articleCtrl = require('../lib/controllers/articleCtrl');

/* GET article page. */
router.get('/:uuid', articleCtrl);

module.exports = router;
