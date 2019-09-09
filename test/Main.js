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
        console.log(test.uuid);
        TestEntity.get(test.uuid, (err,res)=>{
            console.log(res);
            database.closeConnection();
        });

        //database.list(TestEntity);

        // PlasmaJs.getConnection.fetch(TestEntity, "select * from nodejs.test.clients", null, (err, res) => {
        //     test.softDelete((err, count)=>{
        //         console.log(res);
        //         console.log("WILL COUNT");
        //         TestEntity.count(false,(err, count)=>{
        //             console.log(err);
        //             console.log("COUNT :" + count);
        //
        //             database.closeConnection();
        //         });
        //     });
        // });
    });

});