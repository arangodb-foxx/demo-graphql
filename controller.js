'use strict';
const Foxx = require('org/arangodb/foxx');
const schema = require('./schema');
const graphql = require('graphql-sync').graphql;

const ctrl = new Foxx.Controller(applicationContext);

// This is a regular Foxx HTTP API endpoint.
ctrl.post('/graphql', function (req, res) {
  // By just passing the raw body string to graphql
  // we let the GraphQL library take care of making
  // sure the query is well-formed and valid.
  // Our HTTP API doesn't have to know anything about
  // GraphQL to handle it.
  const result = graphql(schema, req.rawBody(), null, req.parameters);
  console.log(req.parameters);
  if (result.errors) {
    res.status(400);
    res.json({
      errors: result.errors
    });
  } else {
    res.json(result);
  }
})
.summary('GraphQL endpoint')
.notes('GraphQL endpoint for the Star Wars GraphQL example.');
