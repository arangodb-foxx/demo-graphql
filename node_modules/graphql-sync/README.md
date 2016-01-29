# GraphQL-sync

This is a promise-free wrapper of [GraphQL.js](https://github.com/graphql/graphql-js) for [ArangoDB](https://www.arangodb.com) that replaces all asynchronous code with synchronous equivalents.

## Getting Started

An overview of GraphQL in general is available in the
[README](https://github.com/facebook/graphql/blob/master/README.md) for the
[Specification for GraphQL](https://github.com/facebook/graphql). That overview
describes a simple set of GraphQL examples that exist as [tests](src/__tests__)
in this repository. A good way to get started with this repository is to walk
through that README and the corresponding tests in parallel.

### Using GraphQL-sync

Install GraphQL-sync from npm

```sh
npm install --save graphql-sync
```

GraphQL-sync provides two important capabilities: building a type schema, and
serving queries against that type schema.

First, build a GraphQL type schema which maps to your code base.

```js
import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString
} from 'graphql-sync';

var schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      hello: {
        type: GraphQLString,
        resolve() {
          return 'world';
        }
      }
    }
  })
});
```

This defines a simple schema with one type and one field, that resolves
to a fixed value. A more complex example is included in the top level
[tests](src/__tests__) directory.

Then, serve the result of a query against that type schema.

```js
var query = '{ hello }';

var result = graphql(schema, query);
// Prints
// {
//   data: { hello: "world" }
// }
console.log(result);
```

This runs a query fetching the one field defined. The `graphql` function will
first ensure the query is syntactically and semantically valid before executing
it, reporting errors otherwise.

```js
var query = '{ boyhowdy }';

var result = graphql(schema, query);
// Prints
// {
//   errors: [
//     { message: 'Cannot query field boyhowdy on RootQueryType',
//       locations: [ { line: 1, column: 3 } ] }
//   ]
// }
console.log(result);
```

### License

GraphQL is [BSD-licensed](https://github.com/graphql/graphql-js/blob/master/LICENSE).
Facebook also provides an additional [patent grant](https://github.com/graphql/graphql-js/blob/master/PATENTS).