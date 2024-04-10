var express = require('express');
var fs = require('fs');
var site = require('../config.js');

module.exports = (app) => {
  for (uri in site.pages) {
    let page = site.pages[uri]
    console.log(uri, page)

    app.get(uri, function(req, res, next) {
      page.title = page.title || site.title
      page.url = page.url || site.url
      page.description = page.description || site.description
      page.lang = page.lang || site.lang

      let content = fs.readFileSync(page.location, { encoding: 'utf-8', flag: 'r' });
      page.content = content

      res.render('page', page);
    });
  }
};
