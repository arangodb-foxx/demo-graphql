'use strict';
// Make sure to install "graphql" in the Foxx service's folder using
// the "npm" command-line tool and to include the "node_modules"
// folder when bundling your Foxx service for deployment.
const gql = require('graphql');
const db = require('@arangodb').db;

// Using module.context.collection allows us to use the
// collection with a common prefix based on where the service
// is mounted. This way we can have multiple copies of this
// service mounted on the same database without worrying about
// name conflicts in their collections.
const episodes = module.context.collection('episodes');
const characters = module.context.collection('characters');
const friends = module.context.collection('friends');
const appearsIn = module.context.collection('appearsIn');

let droidType, humanType, characterInterface;

// GraphQL ENUM values can be used as literals rather
// than strings but their possible values have to be
// statically defined.
const speciesType = new gql.GraphQLEnumType({
  name: 'Species',
  description: 'Species of a character: human or droid.',
  values: {
    HUMAN: {
      value: 'human', // The internal value stored in ArangoDB
      description: 'A humanoid creature in the Star Wars universe.'
    },
    DROID: {
      value: 'droid',
      description: 'A mechanical creature in the Star Wars universe.'
    }
  }
});

// In the original graphql-js test fixtures episodes
// are defined using a GraphQL ENUM type. Because we're
// in a database, it makes more sense to define them
// as an object type backed by a collection.
const episodeType = new gql.GraphQLObjectType({
  name: 'Episode',
  description: 'An episode in the Star Wars Trilogy.',
  fields() {
    return {
      id: {
        type: new gql.GraphQLNonNull(gql.GraphQLString),
        description: 'The id of the episode.',
        resolve(episode) {
          // The objects exposed by GraphQL have an "id"
          // field which corresponds to ArangoDB's "_key"
          // property. This mapping isn't strictly necessary
          // but hides the implementation of the data
          // source to make it more consistent with other
          // GraphQL APIs.
          return episode._key;
        }
      },
      // These fields directly correspond to properties
      // on the documents and thus don't need "resolve"
      // methods.
      title: {
        type: gql.GraphQLString,
        description: 'The title of the episode.'
      },
      description: {
        type: gql.GraphQLString,
        description: 'The description of the episode.'
      }
    };
  }
});

characterInterface = new gql.GraphQLInterfaceType({
  name: 'Character',
  description: 'A character in the Star Wars Trilogy',
  fields() {
    return {
      id: {
        type: new gql.GraphQLNonNull(gql.GraphQLString),
        description: 'The id of the character.'
      },
      species: {
        type: new gql.GraphQLNonNull(speciesType),
        description: 'The species of the character.'
      },
      name: {
        type: gql.GraphQLString,
        description: 'The name of the character.'
      },
      friends: {
        type: new gql.GraphQLList(characterInterface),
        description: (
          'The friends of the character, '
          + 'or an empty list if they have none.'
        ),
        args: {
          species: {
            type: speciesType,
            description: 'The species of the friends.'
          }
        }
      },
      appearsIn: {
        type: new gql.GraphQLList(episodeType),
        description: 'Which movies they appear in.'
      }
    };
  },
  resolveType(character) {
    // Droids and humans have different fields.
    // The "$type" property allows GraphQL to decide which
    // GraphQL type a document should correspond to.
    return character.$type === 'droid' ? droidType : humanType;
  }
});

humanType = new gql.GraphQLObjectType({
  name: 'Human',
  description: 'A humanoid creature in the Star Wars universe.',
  fields() {
    return {
      id: {
        type: new gql.GraphQLNonNull(gql.GraphQLString),
        description: 'The id of the human.',
        resolve(human) {
          return human._key;
        }
      },
      species: {
        type: new gql.GraphQLNonNull(speciesType),
        description: 'The species of the human.',
        resolve(human) {
          return human.$type;
        }
      },
      name: {
        type: gql.GraphQLString,
        description: 'The name of the human.'
      },
      friends: {
        type: new gql.GraphQLList(characterInterface),
        description: 'The friends of the human, or an empty list if they have none.',
        args: {
          species: {
            type: speciesType,
            description: 'The species of the friends.'
          }
        },
        resolve(human, args) {
          // We want to store friendship relations as edges in an
          // edge collection. Here we're returning the friends of
          // a character with an AQL graph traversal query, see
          // https://docs.arangodb.com/Aql/GraphTraversals.html#working-on-collection-sets
          const species = args.species || null;
          return db._query(aqlQuery`
            WITH ${characters}
            FOR friend IN ANY ${human} ${friends}
            FILTER !${species} || friend.$type == ${species}
            SORT friend._key ASC
            RETURN friend
          `).toArray();
        }
      },
      appearsIn: {
        type: new gql.GraphQLList(episodeType),
        description: 'Which movies they appear in.',
        resolve(human) {
          // This query is similar to the friends query except
          // episode appearances are directional (a character
          // appears in an episode, but an episode does not
          // appear in a character), so we are only interested
          // in OUTBOUND edges.
          return db._query(aqlQuery`
            WITH ${characters}
            FOR episode IN OUTBOUND ${human._id} ${appearsIn}
            SORT episode._key ASC
            RETURN episode
          `).toArray();
        }
      },
      homePlanet: {
        type: gql.GraphQLString,
        description: 'The home planet of the human, or null if unknown.'
      }
    };
  },
  interfaces: [characterInterface]
});

// The droid type is largely identical to the human type above.
// The "resolve" functions have to be implemented on the object
// "implementing" the GraphQL interface, so we have to repeat
// the full definition on both humans and droids.
droidType = new gql.GraphQLObjectType({
  name: 'Droid',
  description: 'A mechanical creature in the Star Wars universe.',
  fields() {
    return {
      id: {
        type: new gql.GraphQLNonNull(gql.GraphQLString),
        description: 'The id of the droid.',
        resolve(droid) {
          return droid._key;
        }
      },
      species: {
        type: new gql.GraphQLNonNull(speciesType),
        description: 'The species of the droid.',
        resolve(droid) {
          return droid.$type;
        }
      },
      name: {
        type: gql.GraphQLString,
        description: 'The name of the droid.'
      },
      friends: {
        type: new gql.GraphQLList(characterInterface),
        description: 'The friends of the droid, or an empty list if they have none.',
        args: {
          species: {
            type: speciesType,
            description: 'The species of the friends.'
          }
        },
        resolve(droid, args) {
          const species = args.species || null;
          return db._query(aqlQuery`
            WITH ${characters}
            FOR friend IN ANY ${droid} ${friends}
            FILTER !${species} || friend.$type == ${species}
            SORT friend._key ASC
            RETURN friend
          `).toArray();
        }
      },
      appearsIn: {
        type: new gql.GraphQLList(episodeType),
        description: 'Which movies they appear in.',
        resolve(droid) {
          return db._query(aqlQuery`
            FOR episode IN OUTBOUND ${droid._id} ${appearsIn}
            SORT episode._key ASC
            RETURN episode
          `).toArray();
        }
      },
      primaryFunction: {
        type: gql.GraphQLString,
        description: 'The primary function of the droid.'
      }
    };
  },
  interfaces: [characterInterface]
});

const queryType = new gql.GraphQLObjectType({
  name: 'Query',
  fields() {
    return {
      hero: {
        type: characterInterface,
        args: {
          episode: {
            description: 'If omitted, returns the hero of the whole saga. If provided, returns the hero of that particular episode.',
            type: gql.GraphQLString
          }
        },
        resolve(root, args) {
          return characters.document(
            args.episode === 'NewHope' ? '1000' :
            args.episode === 'Awakens' ? '2002' : '2001'
          );
        }
      },
      human: {
        type: humanType,
        args: {
          id: {
            description: 'id of the human',
            type: new gql.GraphQLNonNull(gql.GraphQLString)
          }
        },
        resolve(root, args) {
          // We're using firstExample to make sure we only
          // return documents with the right "$type".
          return characters.firstExample({
            _key: args.id,
            $type: 'human'
          });
        }
      },
      droid: {
        type: droidType,
        args: {
          id: {
            description: 'id of the droid',
            type: new gql.GraphQLNonNull(gql.GraphQLString)
          }
        },
        resolve(root, args) {
          return characters.firstExample({
            _key: args.id,
            $type: 'droid'
          });
        }
      }
    };
  }
});

// This is the GraphQL schema object we need to execute
// queries. See "controller.js" for an example of how it
// is used. Also see the "test" folder for more in-depth
// examples.
module.exports = new gql.GraphQLSchema({
  query: queryType
});
