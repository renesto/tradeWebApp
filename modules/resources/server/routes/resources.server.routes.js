'use strict';

/**
 * Module dependencies.
 */
var resourcesPolicy = require('../policies/resources.server.policy'),
  resources = require('../controllers/resources.server.controller');

module.exports = function (app) {
  // Resources collection routes
  app.route('/api/resources').all(resourcesPolicy.isAllowed)
    .get(resources.list)
    .post(resources.create);

  // Single resource routes
  app.route('/api/resources/:resourceId').all(resourcesPolicy.isAllowed)
    .get(resources.read)
    .put(resources.update)
    .delete(resources.delete);

  // Finish by binding the resource middleware
  app.param('resourceId', resources.resourceByID);
};
