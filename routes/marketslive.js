"use strict";

const Router = require('express').Router;
const router = new Router();
const marketsliveCtrl = require('../lib/controllers/marketsliveCtrl');
const marketsLiveApiCtrl = require('../lib/controllers/marketsLiveApiCtrl');
const auth = require('alphaville-auth-middleware');

router.get('/marketslive', marketsliveCtrl.index);
router.get(/^\/marketslive\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/, auth(), marketsliveCtrl.byUuid);
router.get(/^\/marketslive\/([0-9]+\-[0-9]+\-[0-9]+-?[0-9]+?\/?)$/, auth(), marketsliveCtrl.byVanity);

router.get('/marketslive/api/sessions/all', marketsLiveApiCtrl.sessions.all);
router.get('/marketslive/api/sessions/latest', marketsLiveApiCtrl.sessions.latest);
router.get('/marketslive/api/sessions/channel', marketsLiveApiCtrl.sessions.channel);

module.exports = router;
