const assert = require('assert');
const PlasmaJs = require('../Plasmajs');
const TestEntity = require('./Entities/TestEntity');

describe('Basic Mocha String Test', function () {
    console.log("Running tests");

    var database = new PlasmaJs();
    database.connect({
        user: 'dustinauby',
        host: 'localhost',
        database: 'nodejs',
        password: '',
        port: 5432,
    });

    database.list(TestEntity);

    database.query("select * from nodejs.test.clients", null, (err, res) => {
        console.log(res);

        database.closeConnection();
    });
});