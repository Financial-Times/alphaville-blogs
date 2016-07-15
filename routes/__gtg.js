'use strict';

const router = require('express').Router();

router.get('/__gtg', (req, res) => {
	res.sendStatus(200);
});

module.exports = router;
