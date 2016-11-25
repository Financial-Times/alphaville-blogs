"use strict";

const router = require('express').Router();
const mostCommentedCtrl = require('../lib/controllers/mostCommentedCtrl');

router.get('/', mostCommentedCtrl);

module.exports = router;
