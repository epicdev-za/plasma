const PlasmaEntity = require('../../PlasmaEntity');
class TestEntity extends PlasmaEntity {
    constructor(){
        super();
        this._name = null;
    }

    static getEntity(){
        return "test.clients";
    }

    static getPlasmaMapping(){
        return {
            "_uuid": {"field":"uuid", "data_type":"VARCHAR", "data_length":255},
            "_name": {"field":"name", "data_type":"VARCHAR", "data_length":255},
            "_deleted": {"field":"deleted", "data_type":"BOOLEAN"}
        };
    }

    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
    }
}

module.exports = TestEntity;