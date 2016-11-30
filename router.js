'use strict';

const Router = require('express').Router;
const router = new Router();
const auth = require('alphaville-auth-middleware');
const restrictedAccess = require('./lib/middlewares/restrictedAccess');

router.use('/', require('./routes/index'));
router.use('/home', require('./routes/home'));
router.use('/indexViewToggler', require('./routes/indexViewToggler'));

router.use('/search', require('./routes/search'));
router.use('/about', require('./routes/about'));
router.use('/meet-the-team', require('./routes/meet'));
router.use('/author', require('./routes/author'));
router.use('/', require('./routes/sectionPages'));
router.use('/most-popular-livefyre', require('./routes/mostPopular'));
router.use('/most-popular', require('./routes/mostRead'));
router.use('/most-commented', require('./routes/mostCommented'));
router.use('/topic', require('./routes/topic'));
router.use('/type', require('./routes/type'));

router.use('/marketslive', require('./routes/marketslive'));
router.use('/', require('./routes/article'));
router.use('/curation', auth(), restrictedAccess, require('./routes/curation'));

router.use('/uc_longroom', require('./routes/longroom'));

module.exports = router;
