'use strict';

const Router = require('express').Router;
const router = new Router();
const auth = require('alphaville-auth-middleware');

router.use('/', require('./routes/index'));
router.use('/home', require('./routes/home'));
router.use('/search', require('./routes/search'));
router.use('/about', require('./routes/about'));
router.use('/meet-the-team', require('./routes/meet'));

router.use('/', auth(), require('./routes/marketslive'));
router.use('/', auth(), require('./routes/article'));

module.exports = router;
