'use strict';
const expect = require('chai').expect;
const schema = require('../schema');
const graphql = require('graphql-sync').graphql;
const Source = require('graphql-sync/node_modules/graphql/language/source').Source;
const parse = require('graphql-sync/node_modules/graphql/language/parser').parse;
const validate = require('graphql-sync/node_modules/graphql/validation/validate').validate;

function validationErrors(query) {
  const source = new Source(query, 'StarWars.graphql');
  const ast = parse(source);
  return validate(schema, ast);
}

describe('Star Wars Validation Tests', function () {
  describe('Basic Queries', function () {
    it('Validates a complex but valid query', function () {
      const query = `
        query NestedQueryWithFragment {
          hero {
            ...NameAndAppearances
            friends {
              ...NameAndAppearances
              friends {
                ...NameAndAppearances
              }
            }
          }
        }

        fragment NameAndAppearances on Character {
          name
          appearsIn {
            title
          }
        }
      `;
      expect(validationErrors(query)).to.be.empty;
    });

    it('Notes that non-existent fields are invalid', function () {
      const query = `
        query HeroSpaceshipQuery {
          hero {
            favoriteSpaceship
          }
        }
      `;
      expect(validationErrors(query)).to.not.be.empty;
    });

    it('Requires fields on objects', function () {
      const query = `
        query HeroNoFieldsQuery {
          hero
        }
      `;
      expect(validationErrors(query)).to.not.be.empty;
    });

    it('Disallows fields on scalars', function () {
      const query = `
        query HeroFieldsOnScalarQuery {
          hero {
            name {
              firstCharacterOfName
            }
          }
        }
      `;
      expect(validationErrors(query)).to.not.be.empty;
    });

    it('Disallows object fields on interfaces', function () {
      const query = `
        query DroidFieldOnCharacter {
          hero {
            name
            primaryFunction
          }
        }
      `;
      expect(validationErrors(query)).to.not.be.empty;
    });

    it('Allows object fields in fragments', function () {
      const query = `
        query DroidFieldInFragment {
          hero {
            name
            ...DroidFields
          }
        }

        fragment DroidFields on Droid {
          primaryFunction
        }
      `;
      expect(validationErrors(query)).to.be.empty;
    });

    it('Allows object fields in inline fragments', function () {
      const query = `
        query DroidFieldInFragment {
          hero {
            name
            ... on Droid {
              primaryFunction
            }
          }
        }
      `;
      expect(validationErrors(query)).to.be.empty;
    });
  });
});
