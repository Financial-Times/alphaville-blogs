"use strict";

const Router = require('express').Router;
const router = new Router();
const articleCtrl = require('../lib/controllers/articleCtrl');

router.get('/content/:uuid', articleCtrl.byUuid);
router.get(/^(\/[0-9]+\/[0-9]+\/[0-9]+\/[0-9]+\/.*)$/, articleCtrl.byVanity);

module.exports = router;
