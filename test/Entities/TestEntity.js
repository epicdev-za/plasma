const PlasmaEntity = require('../../PlasmaEntity');
class TestEntity extends PlasmaEntity {
    constructor(){
        super();
        this._name = null;
        this._string_test= null;
        this._int_test= null;
        this._double_test= null;
        this._deleted = false;
    }

    static getEntity(){
        return "test.tests";
    }

    static getPlasmaMapping(){
        return {...super.getPlasmaMapping(), ...{
                "_name": {"field":"name", "data_type":"VARCHAR", "data_length":255},
                "_string_test": {"field":"string_test", "data_type":"VARCHAR", "data_length":255},
                "_int_test": {"field":"int_test", "data_type":"INTEGER"},
                "_double_test": {"field":"double_test", "data_type":"double precision"},
                "_deleted": {"field":"deleted", "data_type":"BOOLEAN"}
               }};
    }

    clean() {
        super.clean();
        this.name = this.name.replace(/[^a-zA-Z0-9 ]/g, '');
    }

    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
    }

    get string_test() {
        return this._string_test;
    }

    set string_test(value) {
        this._string_test = value;
    }

    get int_test() {
        return this._int_test;
    }

    set int_test(value) {
        this._int_test = value;
    }

    get double_test() {
        return this._double_test;
    }

    set double_test(value) {
        this._double_test = value;
    }

    get deleted() {
        return this._deleted;
    }

    set deleted(value) {
        this._deleted = value;
    }
}

module.exports = TestEntity;
