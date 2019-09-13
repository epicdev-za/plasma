const assert = require('assert');
const PlasmaJs = require('../PlasmaJs');
const TestEntity = require('./Entities/TestEntity');
const TestData = require("./Assets/data");

describe('Plasma database interaction tests', function () {
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
        tests.forEach(function(obj, index){
            let test = new TestEntity().initialise();
            test.name = obj.name;
            test.string_test = obj.string_test;
            test.int_test = obj.int_test;
            test.double_test = obj.double_test;

            test.save((err,res)=>{
                if(err !== undefined){
                    console.exception(err);
                }

                TestEntity.list((err,res)=>{
                    assert.equal(res.length, tests.length());
                    res.forEach(function(obj, index){
                        let test_obj = tests[index];
                        assert.equal(obj.name, test_obj.name, 'Testing read on name');
                        assert.equal(obj.string_test, test_obj.string_test, 'Testing read on string_test');
                        assert.equal(obj.int_test, test_obj.int_test, 'Testing read on int_test');
                        assert.equal(obj.double_test, test_obj.double_test, 'Testing read on double_test');
                    });
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
