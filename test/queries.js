'use strict';
const expect = require('chai').expect;
const schema = require('../schema');
const graphql = require('graphql-sync').graphql;

describe('Star Wars Query Tests', function () {
  describe('Basic Queries', function () {
    it('Correctly identifies R2-D2 as the hero of the Star Wars Saga', function () {
      const query = `
        query HeroNameQuery {
          hero {
            name
          }
        }
      `;
      const expected = {
        hero: {
          name: 'R2-D2'
        }
      };
      const result = graphql(schema, query);
      expect(result).not.to.have.a.property('errors');
      expect(result.data).to.eql(expected);
    });

    it('Allows us to query for the ID and friends of R2-D2', function () {
      const query = `
        query HeroNameAndFriendsQuery {
          hero {
            id
            name
            friends {
              name
            }
          }
        }
      `;
      const expected = {
        hero: {
          id: '2001',
          name: 'R2-D2',
          friends: [
            {
              name: 'Luke Skywalker'
            },
            {
              name: 'Han Solo'
            },
            {
              name: 'Leia Organa'
            },
            {
              name: 'C-3PO'
            },
            {
              name: 'BB-8'
            }
          ]
        }
      };
      const result = graphql(schema, query);
      expect(result).not.to.have.a.property('errors');
      expect(result.data).to.eql(expected);
    });
  });

  describe('Nested Queries', function () {
    it('Allows us to query for the friends of friends of R2-D2', function () {
      const query = `
        query NestedQuery {
          hero {
            name
            friends {
              name
              friends {
                name
              }
            }
          }
        }
      `;
      const expected = {
        hero: {
          name: 'R2-D2',
          friends: [
            {
              name: 'Luke Skywalker',
              friends: [
                {
                  name: 'Han Solo'
                },
                {
                  name: 'Leia Organa'
                },
                {
                  name: 'C-3PO'
                },
                {
                  name: 'R2-D2'
                }
              ]
            },
            {
              name: 'Han Solo',
              friends: [
                {
                  name: 'Luke Skywalker'
                },
                {
                  name: 'Leia Organa'
                },
                {
                  name: 'Finn'
                },
                {
                  name: 'Rey'
                },
                {
                  name: 'C-3PO'
                },
                {
                  name: 'R2-D2'
                },
                {
                  name: 'BB-8'
                }
              ]
            },
            {
              name: 'Leia Organa',
              friends: [
                {
                  name: 'Luke Skywalker'
                },
                {
                  name: 'Han Solo'
                },
                {
                  name: 'Finn'
                },
                {
                  name: 'Rey'
                },
                {
                  name: 'C-3PO'
                },
                {
                  name: 'R2-D2'
                }
              ]
            },
            {
              name: 'C-3PO',
              friends: [
                {
                  name: 'Luke Skywalker'
                },
                {
                  name: 'Han Solo'
                },
                {
                  name: 'Leia Organa'
                },
                {
                  name: 'R2-D2'
                }
              ]
            },
            {
              name: 'BB-8',
              friends: [
                {
                  name: 'Han Solo'
                },
                {
                  name: 'Finn'
                },
                {
                  name: 'Rey'
                },
                {
                  name: 'R2-D2'
                }
              ]
            }
          ]
        }
      };
      const result = graphql(schema, query);
      expect(result).not.to.have.a.property('errors');
      expect(result.data).to.eql(expected);
    });
  });

  describe('Using IDs and query parameters to refetch objects', function () {
    it('Allows us to query for Luke Skywalker directly, using his ID', function () {
      const query = `
        query FetchLukeQuery {
          human(id: "1000") {
            name
          }
        }
      `;
      const expected = {
        human: {
          name: 'Luke Skywalker'
        }
      };
      const result = graphql(schema, query);
      expect(result).not.to.have.a.property('errors');
      expect(result.data).to.eql(expected);
    });

    it('Allows us to create a generic query, then use it to fetch Luke Skywalker using his ID', function () {
      const query = `
        query FetchSomeIdQuery($someId: String!) {
          human(id: $someId) {
            name
          }
        }
      `;
      const params = {
        someId: '1000'
      };
      const expected = {
        human: {
          name: 'Luke Skywalker'
        }
      };
      const result = graphql(schema, query, null, params);
      expect(result).not.to.have.a.property('errors');
      expect(result.data).to.eql(expected);
    });

    it('Allows us to create a generic query, then pass an invalid ID to get null back', function () {
      const query = `
        query humanQuery($id: String!) {
          human(id: $id) {
            name
          }
        }
      `;
      const params = {
        id: 'not a valid id'
      };
      const expected = {
        human: null
      };
      const result = graphql(schema, query, null, params);
      expect(result).not.to.have.a.property('errors');
      expect(result.data).to.eql(expected);
    });
  });

  describe('Using aliases to change the key in the response', function () {
    it('Allows us to query for Luke, changing his key with an alias', function () {
      const query = `
        query FetchLukeAliased {
          luke: human(id: "1000") {
            name
          }
        }
      `;
      const expected = {
        luke: {
          name: 'Luke Skywalker'
        },
      };
      const result = graphql(schema, query);
      expect(result).not.to.have.a.property('errors');
      expect(result.data).to.eql(expected);
    });

    it('Allows us to query for both Luke and Leia, using two root fields and an alias', function () {
      const query = `
        query FetchLukeAndLeiaAliased {
          luke: human(id: "1000") {
            name
          }
          leia: human(id: "1003") {
            name
          }
        }
      `;
      const expected = {
        luke: {
          name: 'Luke Skywalker'
        },
        leia: {
          name: 'Leia Organa'
        }
      };
      const result = graphql(schema, query);
      expect(result).not.to.have.a.property('errors');
      expect(result.data).to.eql(expected);
    });
  });

  describe('Uses fragments to express more complex queries', function () {
    it('Allows us to query using duplicated content', function () {
      const query = `
        query DuplicateFields {
          luke: human(id: "1000") {
            name
            homePlanet
          }
          leia: human(id: "1003") {
            name
            homePlanet
          }
        }
      `;
      const expected = {
        luke: {
          name: 'Luke Skywalker',
          homePlanet: 'Tatooine'
        },
        leia: {
          name: 'Leia Organa',
          homePlanet: 'Alderaan'
        }
      };
      const result = graphql(schema, query);
      expect(result).not.to.have.a.property('errors');
      expect(result.data).to.eql(expected);
    });

    it('Allows us to use a fragment to avoid duplicating content', function () {
      const query = `
        query UseFragment {
          luke: human(id: "1000") {
            ...HumanFragment
          }
          leia: human(id: "1003") {
            ...HumanFragment
          }
        }
        fragment HumanFragment on Human {
          name
          homePlanet
        }
      `;
      const expected = {
        luke: {
          name: 'Luke Skywalker',
          homePlanet: 'Tatooine'
        },
        leia: {
          name: 'Leia Organa',
          homePlanet: 'Alderaan'
        }
      };
      const result = graphql(schema, query);
      expect(result).not.to.have.a.property('errors');
      expect(result.data).to.eql(expected);
    });
  });

  describe('Using __typename to find the type of an object', function () {
    it('Allows us to verify that R2-D2 is a droid', function () {
      const query = `
        query CheckTypeOfR2 {
          hero {
            __typename
            name
          }
        }
      `;
      const expected = {
        hero: {
          __typename: 'Droid',
          name: 'R2-D2'
        },
      };
      const result = graphql(schema, query);
      expect(result).not.to.have.a.property('errors');
      expect(result.data).to.eql(expected);
    });

    it('Allows us to verify that Luke is a human', function () {
      const query = `
        query CheckTypeOfLuke {
          hero(episode: "NewHope") {
            __typename
            name
          }
        }
      `;
      const expected = {
        hero: {
          __typename: 'Human',
          name: 'Luke Skywalker'
        },
      };
      const result = graphql(schema, query);
      expect(result).not.to.have.a.property('errors');
      expect(result.data).to.eql(expected);
    });
  });
});
