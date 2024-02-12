'use strict';
const schema = require('./schema');
const gql = require('graphql');
const graphql = gql.graphql;
const formatError = gql.formatError;
const createGraphqlRouter = require('@arangodb/foxx/graphql');

// This is a regular Foxx router.
const router = createGraphqlRouter({schema, graphql: gql, graphiql: true})
.summary('GraphQL endpoint')
.description('GraphQL endpoint for the Star Wars GraphQL example.');

module.context.use(router);
