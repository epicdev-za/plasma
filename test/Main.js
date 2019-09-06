const assert = require('assert');
const PlasmaJs = require('../PlasmaJs');
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

    let test = new TestEntity().initialise();
    test.name = "dustin";
    test.save((err,res)=>{
        console.log(test.uid);
        database.list(TestEntity);

        PlasmaJs.getConnection.fetch(TestEntity, "select * from nodejs.test.clients", null, (err, res) => {
            console.log(res);
            database.closeConnection();
        });

        test.delete();
    });

});