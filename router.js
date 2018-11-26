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
router.use('/most-popular-livefyre', require('./routes/mostPopular'));
router.use('/most-popular', function(req, res) {
	res.redirect('/');
});
router.use('/most-commented', function(req, res) {
	res.redirect('/');
});
router.use('/topic', require('./routes/topic'));
router.use('/type', require('./routes/type'));
router.use('/series', require('./routes/series'));
router.use('/alphachat', (req, res, next) => {
  res.redirect('/series/Alphachat');
});

router.use('/marketslive', require('./routes/marketslive'));
router.use('/', require('./routes/article'));
router.use('/curation', auth(), restrictedAccess, require('./routes/curation'));

router.use('/uc_longroom', auth(), require('./routes/longroom'));

module.exports = router;
