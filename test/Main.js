const assert = require('assert');
const PlasmaJs = require('../PlasmaJs');
const TestEntity = require('./Entities/TestEntity');
const TestData = require("./Assets/data");

describe('Basic Mocha String Test', function () {
    console.log("Running tests");
    let database;
    before(function() {
        database = new PlasmaJs();
        database.connect({
            user: 'dustinauby',
            host: 'localhost',
            database: 'nodejs',
            password: '',
            port: 5432,
        });
    });

    it('testing database read and write', function () {
        let tests = TestData.test_entity;
        tests.forEach(function(field, index){
            let test = new TestEntity().initialise();
            test.name = field.name;
            test.string_test = field.string_test;
            test.int_test = field.int_test;
            test.double_test = field.double_test;

            test.save((err,res)=>{
                if(err !== undefined){
                    console.exception(err);
                }

                TestEntity.list((err,res)=>{
                    assert.equal(res.rows.length, tests.length());
                });
            });
        });
    });

    after(function() {
        database.query("delete * from " + TestEntity.getEntity(), [], (err,res)=>{
            if(err === undefined){
                console.log("Cleaned test database successfully");
            }else{
                console.error("Failed to clean test database successfully");
            }
        });
        database.closeConnection();
    });
});
