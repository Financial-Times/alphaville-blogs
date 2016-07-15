const router = require('express').Router();
const homeCtrl = require('../lib/controllers/homeCtrl');

/**
 * Temporary route to display the index page as a list of items (instead of a grid)
 */
router.get('/', homeCtrl);

module.exports = router;
