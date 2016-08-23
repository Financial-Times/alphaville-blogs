"use strict";

const Router = require('express').Router;
const router = new Router();
const articleCtrl = require('../lib/controllers/articleCtrl');

router.get(/^\/content\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/, articleCtrl.byUuid);
router.get(/^(\/[0-9]+\/[0-9]+\/[0-9]+\/[0-9]+\/.*)$/, articleCtrl.byVanity);

module.exports = router;
