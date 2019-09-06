const PlasmaJs = require('./PlasmaJs');
const uuidv4 = require('uuid/v4');

class PlasmaEntity {
    constructor(){
        this._uid = null;
        this._deleted = false;
    }

    save(callback){
        PlasmaJs.getConnection.exists(this.constructor, this.uid, (exists) => {
            if(exists){
                this.update(callback);
            }else{
                this.insert(callback);
            }
        });
    }

    insert(callback){
        const ENTITY = this.constructor.getEntity();
        const PLASMA_MAPPING = this.constructor.getPlasmaMapping();

        let query = "INSERT INTO " + ENTITY;
        let fields = Object.keys(this);
        let fields_query = " (";
        let values_query = " VALUES(";
        let parameters = Object.values(this);

        fields.forEach(function(field, index){
            if(PLASMA_MAPPING[field] !== undefined){
                field = PLASMA_MAPPING[field].field;
            }
            if(index === 0){
                fields_query += field;
                values_query += "$" + (index+1);
            }else{
                fields_query += ", " + field;
                values_query += ", $" + (index+1);
            }
        });

        query += fields_query + ")" + values_query + ");";
        PlasmaJs.getConnection.query(query, parameters, callback);
    }

    update(callback){
        const ENTITY = this.constructor.getEntity();
        const PLASMA_MAPPING = this.constructor.getPlasmaMapping();

        let query = "UPDATE " + ENTITY + " SET";
        let fields = Object.keys(this);
        let fields_query = " ";
        let parameters = Object.values(this);

        fields.forEach(function(field, index){
            if(PLASMA_MAPPING[field] !== undefined){
                field = PLASMA_MAPPING[field].field;
            }
            if(index === 0){
                fields_query += field +  " = $" + (index+1);
            }else{
                fields_query += ", " + field + " = $" + (index+1);
            }
        });

        query += fields_query + " WHERE uid like $" + (fields.length + 1);
        parameters.push(this.uid);
        PlasmaJs.getConnection.query(query, parameters, callback);
    }

    delete(callback){
        this.deleted = true;
        this.save(callback);
    }

    populateObject(object){
        const PLASMA_MAPPING = this.constructor.getPlasmaMapping();
        let fields = Object.keys(this);
        let obj = this;
        fields.forEach(function(field, index){
            let field_final = field;
            if(PLASMA_MAPPING[field] !== undefined){
                field_final = PLASMA_MAPPING[field].field;
            }
            obj[field] = object[field_final];
        });
    }

    initialise(){
        this.uid = uuidv4();
        return this;
    }

    fieldModifier(object){
        return object;
    }

    static getEntity(){
        throw "Must implement getEntity method";
    }

    static getPlasmaMapping(){
        return {};
    }

    get uid() {
        return this._uid;
    }

    set uid(value) {
        this._uid = value;
    }

    get deleted() {
        return this._deleted;
    }

    set deleted(value) {
        this._deleted = value;
    }
}
module.exports = PlasmaEntity;
