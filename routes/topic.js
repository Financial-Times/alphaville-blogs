"use strict";

const router = require('express').Router();
const topicCtrl = require('../lib/controllers/topicCtrl');

/* GET search result page. */
router.get('/:topic', topicCtrl);

module.exports = router;
