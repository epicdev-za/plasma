const PlasmaJs = require('./PlasmaJs');
const uuidv4 = require('uuid/v4');

class PlasmaEntity {
    constructor(){
        this._uuid = null;
        this._deleted = false;
        this.plasma_meta ={};
    }

    save(callback){
        if(this.plasma_meta.hasOwnProperty("readonly") && this.plasma_meta.readonly === true) {
            throw "Cannot save object it is readonly";
        }else{
            if (this.plasma_meta.hasOwnProperty("exists") && this.plasma_meta.exists === true) {
                this.update(callback);
            } else {
                this.insert(callback);
            }
        }
    }

    insert(callback){
        const ENTITY = this.constructor.getEntity();
        const PLASMA_MAPPING = this.constructor.getPlasmaMapping();

        let query = "INSERT INTO " + ENTITY;
        let fields = Object.keys(this);
        let fields_query = " (";
        let values_query = " VALUES(";
        let object_values = Object.values(this);
        let parameters = [];
        let parameter_index = 1;
        fields.forEach(function(field, index){
            if(field !== "plasma_meta") {
                parameters.push(object_values[index]);
                if (PLASMA_MAPPING[field] !== undefined) {
                    field = PLASMA_MAPPING[field].field;
                }
                if (parameter_index === 1) {
                    fields_query += field;
                    values_query += "$" + parameter_index;
                } else {
                    fields_query += ", " + field;
                    values_query += ", $" + parameter_index;
                }
                parameter_index++;
            }
        });

        query += fields_query + ")" + values_query + ");";
        PlasmaJs.getConnection.query(query, parameters, (err,res)=>{
            let plasma_meta = this.plasma_meta;
            plasma_meta.exists = true;
            this.plasma_meta = plasma_meta;
            if(callback !== undefined){
                callback(err, res);
            }
        });
    }

    update(callback){
        const ENTITY = this.constructor.getEntity();
        const PLASMA_MAPPING = this.constructor.getPlasmaMapping();

        let query = "UPDATE " + ENTITY + " SET";
        let fields = Object.keys(this);
        let fields_query = " ";
        let object_values = Object.values(this);
        let parameters = [];

        let parameter_index = 1;
        fields.forEach(function(field, index){
            if(field !== "plasma_meta") {
                parameters.push(object_values[index]);
                if (PLASMA_MAPPING[field] !== undefined) {
                    field = PLASMA_MAPPING[field].field;
                }
                if (index === 1) {
                    fields_query += field + " = $" + parameter_index;
                } else {
                    fields_query += ", " + field + " = $" + parameter_index;
                }
                parameter_index++;
            }
        });

        query += fields_query + " WHERE uuid like $" + parameter_index;
        parameters.push(this.uuid);
        PlasmaJs.getConnection.query(query, parameters, (err,res)=>{
            let plasma_meta = this.plasma_meta;
            plasma_meta.exists = true;
            this.plasma_meta = plasma_meta;
            if(callback !== undefined){
                callback(err, res);
            }
        });
    }

    softDelete(callback){
        this.deleted = true;
        this.save(callback);
    }

    delete(callback){
        const ENTITY = this.constructor.getEntity();
        PlasmaJs.getConnection.query("DELETE FROM " + ENTITY + " WHERE uuid = $1;", [this.uuid], (err,res)=>{
            if(callback !== undefined){
                callback(err, res);
            }
        });
    }

    static count(include_deleted, callback){
        const ENTITY = this.getEntity();
        PlasmaJs.getConnection.query("SELECT count(uuid) as cnt FROM " + ENTITY + " WHERE deleted = false;", [], (err,res)=>{
            if(res.rows !== undefined && res.rows.length > 0){
                callback(err, res.rows[0].cnt);
            }else{
                callback(err, 0);
            }
        });
    }

    static get(uuid, callback){
        PlasmaJs.getConnection.getByUUID(this, uuid, callback);
    }

    populateObject(object, readonly){
        const PLASMA_MAPPING = this.constructor.getPlasmaMapping();
        let fields = Object.keys(this);
        let obj = this;
        fields.forEach(function(field, index){
            if(field !== "plasma_meta"){
                let field_final = field;
                if(PLASMA_MAPPING[field] !== undefined){
                    field_final = PLASMA_MAPPING[field].field;
                }
                obj[field] = object[field_final];
            }
        });

        let plasma_meta = obj.plasma_meta;
        plasma_meta.exists = true;
        if(readonly !== undefined && readonly === true){
            plasma_meta.readonly = true;
        }
        obj.plasma_meta = plasma_meta;
    }

    initialise(){
        this.uuid = uuidv4();
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

    get uuid() {
        return this._uuid;
    }

    set uuid(value) {
        this._uuid = value;
    }

    get deleted() {
        return this._deleted;
    }

    set deleted(value) {
        this._deleted = value;
    }
}
module.exports = PlasmaEntity;
