"use strict";

const router = new (require('express')).Router();
const sectionPagesCtrl = require('../lib/controllers/sectionPagesCtrl');

router.get('/alphachat', sectionPagesCtrl.alphachat);

module.exports = router;
