const router = require('express').Router();
const indexGridCtrl = require('../lib/controllers/indexGridCtrl');

/**
 * Temporary route to display the index page as a list of items (instead of a grid)
 */
router.get('/', indexGridCtrl);

module.exports = router;
