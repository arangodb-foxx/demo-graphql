'use strict';
const db = require('@arangodb').db;

// Based on the GraphQL-js Star Wars test fixtures available at
// https://github.com/graphql/graphql-js/blob/v0.4.14/src/__tests__/starWarsData.js
// https://github.com/graphql/graphql-js/blob/v0.4.14/src/__tests__/starWarsSchema.js

const episodesCollectionName = module.context.collectionName('episodes');
if (!db._collection(episodesCollectionName)) {
  const episodes = db._createDocumentCollection(episodesCollectionName);
  [
    {_key: 'NewHope', title: 'A New Hope', description: 'Released in 1977.'},
    {_key: 'Empire', title: 'The Empire Strikes Back', description: 'Released in 1980.'},
    {_key: 'Jedi', title: 'Return of the Jedi', description: 'Released in 1983.'},
    {_key: 'Awakens', title: 'The Force Awakens', description: 'Released in 2015.'}
  ].forEach(function (episode) {
    episodes.save(episode);
  });
} else if (module.context.isProduction) {
  console.warn(`collection ${episodesCollectionName} already exists. Leaving it untouched.`);
}

const charactersCollectionName = module.context.collectionName('characters');
if (!db._collection(charactersCollectionName)) {
  const characters = db._createDocumentCollection(charactersCollectionName);
  characters.ensureSkiplist('$type');
  [
    {_key: '1000', $type: 'human', name: 'Luke Skywalker', homePlanet: 'Tatooine'},
    {_key: '1001', $type: 'human', name: 'Darth Vader', homePlanet: 'Tatooine'},
    {_key: '1002', $type: 'human', name: 'Han Solo'},
    {_key: '1003', $type: 'human', name: 'Leia Organa', homePlanet: 'Alderaan'},
    {_key: '1004', $type: 'human', name: 'Wilhuff Tarkin'},
    {_key: '1005', $type: 'human', name: 'Finn'},
    {_key: '1006', $type: 'human', name: 'Rey', homePlanet: 'Jakku'},
    {_key: '1007', $type: 'human', name: 'Kylo Ren'},
    {_key: '2000', $type: 'droid', name: 'C-3PO', primaryFunction: 'Protocol'},
    {_key: '2001', $type: 'droid', name: 'R2-D2', primaryFunction: 'Astromech'},
    {_key: '2002', $type: 'droid', name: 'BB-8', primaryFunction: 'Astromech'}
  ].forEach(function (character) {
    characters.save(character);
  });
} else if (module.context.isProduction) {
  console.warn(`collection ${charactersCollectionName} already exists. Leaving it untouched.`);
}

const friendsCollectionName = module.context.collectionName('friends');
if (!db._collection(friendsCollectionName)) {
  const friends = db._createEdgeCollection(friendsCollectionName);
  [
    ['1000', '1002'], ['1000', '1003'], ['1000', '2000'], ['1000', '2001'],
    ['1001', '1004'], ['1001', '1007'],
    ['1002', '1003'], ['1002', '1005'], ['1002', '1006'], ['1002', '2000'], ['1002', '2001'], ['1002', '2002'],
    ['1003', '1005'], ['1003', '1006'], ['1003', '2000'], ['1003', '2001'],
    ['1005', '1006'], ['1005', '2002'],
    ['1006', '2002'],
    ['2000', '2001'],
    ['2001', '2002']
  ].forEach(function (pair) {
    friends.save(
      charactersCollectionName + '/' + pair[0],
      charactersCollectionName + '/' + pair[1],
      {}
    );
  });
} else if (module.context.isProduction) {
  console.warn(`collection ${friendsCollectionName} already exists. Leaving it untouched.`);
}

const appearsInCollectionName = module.context.collectionName('appearsIn');
if (!db._collection(appearsInCollectionName)) {
  const appearsIn = db._createEdgeCollection(appearsInCollectionName);
  [
    ['1000', ['NewHope', 'Empire', 'Jedi', 'Awakens']],
    ['1001', ['NewHope', 'Empire', 'Jedi', 'Awakens']],
    ['1002', ['NewHope', 'Empire', 'Jedi', 'Awakens']],
    ['1003', ['NewHope', 'Empire', 'Jedi', 'Awakens']],
    ['1004', ['NewHope']],
    ['1005', ['Awakens']],
    ['1006', ['Awakens']],
    ['1007', ['Awakens']],
    ['2000', ['NewHope', 'Empire', 'Jedi', 'Awakens']],
    ['2001', ['NewHope', 'Empire', 'Jedi', 'Awakens']],
    ['2002', ['Awakens']]
  ].forEach(function (relation) {
    relation[1].forEach(function (episode) {
      appearsIn.save(
        charactersCollectionName + '/' + relation[0],
        episodesCollectionName + '/' + episode,
        {}
      );
    });
  });
} else if (module.context.isProduction) {
  console.warn(`collection ${appearsInCollectionName} already exists. Leaving it untouched.`);
}
