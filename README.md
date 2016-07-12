# GraphQL Demo Foxx Service

This is a GraphQL demo service for ArangoDB 3.1 and higher
using the [graphql-sync wrapper for graphql-js](https://github.com/arangodb/graphql-sync)
and the [Foxx GraphQL extensions for ArangoDB](https://docs.arangodb.com/3.1/Manual/Foxx/GraphQL.html).

This service implements two API endpoints:

`POST /graphql`

and

`GET /graphql`

The endpoint accepts well-formed GraphQL queries based on the
GraphQL Star Wars data set, e.g.:

```graphql
{
  hero(episode: "NewHope") {
    name
    friends(species: DROID) {
      name
    }
  }
}
```

returns:

```json
{
  "data": {
    "hero": {
      "name": "Luke Skywalker",
      "friends": [
        {
          "name": "C-3PO"
        },
        {
          "name": "R2-D2"
        }
      ]
    }
  }
}
```

The request body can also be a JSON object with a `query` attribute.

Open the endpoint in the browser to explore the data set and schema using [the GraphiQL explorer](https://github.com/graphql/graphiql).

To learn more about GraphQL see [the official GraphQL spec](https://facebook.github.io/graphql/) and the [official introductory blog post](https://code.facebook.com/posts/1691455094417024/graphql-a-data-query-language/).

Check the file `schema.js` to see how GraphQL schemas can be given access to
ArangoDB collections. Check the files in the `test` folder to see examples of
GraphQL queries and their results.

# License

This demo service is licensed under the Apache 2.0 license.

The demo data set and test cases are based on the test fixtures and test suites
of the [graphql-js](https://github.com/graphql/graphql-js) project and used under
the BSD license and Facebook patent grant.
