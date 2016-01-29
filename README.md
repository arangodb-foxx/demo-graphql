# GraphQL Demo Foxx Service

This is a GraphQL demo service for ArangoDB 2.8 and higher
using the [graphql-sync wrapper for graphql-js](https://github.com/arangodb/graphql-sync).

Note: because of a change in how module resolution was handled before 2.8
the graphql-sync module does not work with ArangoDB 2.7 and earlier.

This service implements a single API endpoint:

`POST /graphql`

The endpoint accepts well-formed GraphQL queries based on the
GraphQL Star Wars data set, e.g.:

```graphql
{
  hero(episode: "NewHope") {
    name
  }
}
```

returns:

```json
{
  "data": {
    "hero": {
      "name": "Luke Skywalker"
    }
  }
}
```

To learn more about GraphQL see [the official GraphQL spec](https://facebook.github.io/graphql/) and the [official introductory blog post](https://code.facebook.com/posts/1691455094417024/graphql-a-data-query-language/).

Check the file `schema.js` to see how GraphQL schemas can be given access to
ArangoDB collections. Check the files in the `test` folder to see examples of
GraphQL queries and their results.

# License

This demo service is licensed under the Apache 2.0 license.

The demo data set and test cases are based on the test fixtures and test suites
of the [graphql-js](https://github.com/graphql/graphql-js) project and used under
the BSD license and Facebook patent grant.
