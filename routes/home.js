const router = require('express').Router();
const indexListCtrl = require('../lib/controllers/indexListCtrl');

/**
 * Temporary route to display the index page as a list of items (instead of a grid)
 */
router.get('/', indexListCtrl);

module.exports = router;
