'use strict';
const db = require('@arangodb').db;

db._drop(module.context.collectionName('episodes'));
db._drop(module.context.collectionName('characters'));
db._drop(module.context.collectionName('friends'));
db._drop(module.context.collectionName('appearsIn'));
