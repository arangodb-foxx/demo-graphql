'use strict';
const db = require('org/arangodb').db;

db._drop(applicationContext.collectionName('episodes'));
db._drop(applicationContext.collectionName('characters'));
db._drop(applicationContext.collectionName('friends'));
db._drop(applicationContext.collectionName('appearsIn'));
