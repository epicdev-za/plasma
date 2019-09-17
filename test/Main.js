const assert = require('assert');
const PlasmaJs = require('../PlasmaJs');
const TestEntity = require('./Entities/TestEntity');
const TestData = require("./Assets/data");
let test_confirm = {};
let test_count;
let config = {
    user: "dustinauby",
    host: "localhost",
    database: "nodejs",
    port: 5432,
    password: "",
};

describe('Plasma database interaction tests', function () {
    console.log("Running tests");

    let database;
    before(function() {
        database = new PlasmaJs();
        database.connect(config);
    });

    it('testing database write', function (done) {
        TestEntity.initialiseTable( (err,res)=>{
            if(err !== undefined){
                console.error(err);
                done(err);
            }else{
                const tests = TestData.test_entity;
                test_count = tests.length;
                savetests(tests, ()=>{
                    done();
                });
            }
        });
    });

    it('testing database read and data comparison', function (done) {
        TestEntity.list((err,res)=>{
            assert.equal(Object.keys(res).length, test_count, 'Testing write count');
            let cnt = 0;
            res.forEach(function(obj, index){
                let test_obj = test_confirm[obj.uuid];
                assert.equal(obj.name, test_obj.name, 'Testing read on name');
                assert.equal(obj.string_test, test_obj.string_test, 'Testing read on string_test');
                assert.equal(obj.int_test, test_obj.int_test, 'Testing read on int_test');
                assert.equal(obj.double_test, test_obj.double_test, 'Testing read on double_test');
                cnt++;
            });
            done();
        });
    });

    after(function() {
        database.query("drop table " + TestEntity.getEntity(), [], (err,res)=>{
            if(err === undefined){
                console.log("Cleaned test database successfully");
            }else{
                console.error("Failed to clean test database successfully");
                console.error(err);
            }
            database.closeConnection();
        });
    });
});

function savetests(tests, callback){
    let inc = 1;
    tests.forEach(function(obj, index){
        let test = new TestEntity().initialise();
        test_confirm[test.uuid]=obj;
        test.name = obj.name;
        test.string_test = obj.string_test;
        test.int_test = obj.int_test;
        test.double_test = obj.double_test;

        test.save((err,res)=>{
            if(err !== undefined){
                console.error(err);
            }
            if(inc === tests.length){
                callback();
            }
            inc++;
        });
    });
}

function loadConfig() {
    let len = process.argv;
    for(let i= 2; i < len; i++){
        let arg = process.argv[i];
        console.log(arg);
        if(arg.includes("u=")){
            config.user= arg.replace("u=", "");
        }else if(arg.includes("h=")){
            config.host= arg.replace("h=", "");
        }else if(arg.includes("d=")){
            config.database= arg.replace("d=", "");
        }else if(arg.includes("pw=")){
            config.password= arg.replace("pw=", "");
        }else if(arg.includes("p=")){
            config.port= arg.replace("p=", "");
        }
    }
}

