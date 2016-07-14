'use strict';

const router = require('express').Router();
const auth = require('alphaville-auth-middleware');

router.use('/', require('./routes/index'));
router.use('/content', auth(), require('./routes/article'));
router.use('/home', require('./routes/home'));
router.use('/search', require('./routes/search'));

module.exports = router;
