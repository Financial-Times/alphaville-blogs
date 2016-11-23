'use strict';

const router = require('express').Router();

router.get('/', function (req, res, next) {
  if (req.query.view === 'list') {
    res.append('Set-Cookie', 'index=list; Path=/');
    res.redirect('/')
    return;

  } else if (req.query.view === 'grid') {
    res.append('Set-Cookie', 'index=grid; Path=/');
    res.redirect('/home')
    return;
  }
});

module.exports = router;
