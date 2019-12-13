"use strict";

const Router = require('express').Router;
const router = new Router();
const marketsliveCtrl = require('../lib/controllers/marketsliveCtrl');
const marketsLiveApiCtrl = require('../lib/controllers/marketsLiveApiCtrl');
const auth = require('alphaville-auth-middleware');

router.get('/', marketsliveCtrl.index);
router.get('/about', marketsliveCtrl.about);
router.get(/^\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/, auth(), marketsliveCtrl.byUuid);
router.get("/:date([0-9]+\-[0-9]+\-[0-9]+-?[0-9]+?)", auth(), marketsliveCtrl.byVanity);

router.get('/api/sessions/all', marketsLiveApiCtrl.sessions.all);
router.get('/api/sessions/latest', marketsLiveApiCtrl.sessions.latest);
router.get('/api/sessions/channel', marketsLiveApiCtrl.sessions.channel);

module.exports = router;
