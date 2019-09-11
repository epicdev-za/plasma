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
            "_name": {"field":"name", "data_type":"VARCHAR", "data_length":255},
            "_deleted": {"field":"deleted", "data_type":"BOOLEAN"}
        };
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
}

module.exports = TestEntity;