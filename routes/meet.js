'use strict';

const router = require('express').Router();
const meetCtrl = require('../lib/controllers/meetCtrl');
const defaultRoute = '/meet-the-team/paul-murphy';

router.get('/', (req, res) => {
	res.redirect(defaultRoute);
});
router.get('/:slug', meetCtrl);

module.exports = router;
