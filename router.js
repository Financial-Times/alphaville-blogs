'use strict';

const Router = require('express').Router;
const router = new Router();
const auth = require('alphaville-auth-middleware');
const restrictedAccess = require('./lib/middlewares/restrictedAccess');

router.use('/', require('./routes/index'));
router.use('/home', require('./routes/home'));
router.use('/search', require('./routes/search'));
router.use('/about', require('./routes/about'));
router.use('/meet-the-team', require('./routes/meet'));
router.use('/author', require('./routes/author'));

router.use('/', require('./routes/marketslive'));
router.use('/', require('./routes/article'));
router.use('/curation', auth(), restrictedAccess, require('./routes/curation'));

module.exports = router;
