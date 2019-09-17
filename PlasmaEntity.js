const PlasmaJs = require('./PlasmaJs');
const uuidv4 = require('uuid/v4');

class PlasmaEntity {

    constructor(){
        this._uuid = null;
        this.plasma_meta ={};
    }

    clean(){
        if(!this.uuid.match(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/)){
            throw new Error("Invalid UUID");
        }
    }

    save(callback){
        if(this.plasma_meta.hasOwnProperty("readonly") && this.plasma_meta.readonly === true) {
            throw "Cannot save object it is readonly";
        }else{
            this.clean();
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
        let obj = this;
        fields.forEach(function(field, index){
            if(field !== "plasma_meta") {
                field = obj.constructor.fieldModifier(field);
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
        let obj = this;
        let parameter_index = 1;
        fields.forEach(function(field, index){
            if(field !== "plasma_meta") {
                field = obj.constructor.fieldModifier(field);
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

    static initialiseTable(callback){
        const ENTITY = this.getEntity();
        const PLASMA_MAPPING = this.getPlasmaMapping();
        let query = "CREATE TABLE " + ENTITY + " (";
        let primary_keys = [];
        Object.keys(PLASMA_MAPPING).forEach(function(key) {
            let obj_map= PLASMA_MAPPING[key];

            let field = obj_map.field;
            let data_type = obj_map.data_type;
            let data_length = obj_map.data_length;

            if(obj_map.primary_key !== undefined){
                primary_keys.push(field);
            }

            let entry = field + " " +data_type;
            if(data_length !== undefined){
                entry+="("+data_length+")";
            }
            entry+=",";
            query+=entry;
        });
        let primary_key_entry = "PRIMARY KEY (";
        primary_keys.forEach(function(field, index){
            if (index === 0) {
                primary_key_entry += field;
            } else {
                primary_key_entry += ", " + field;
            }
        });
        primary_key_entry+=")";
        query+=primary_key_entry + ");";
        PlasmaJs.getConnection.query(query, [], (err,res)=>{
            if(callback !== undefined){
                callback(err, res);
            }
        });
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

    static list(callback){
        PlasmaJs.getConnection.list(this, callback);
    }

    static get(uuid, callback){
        PlasmaJs.getConnection.getByUUID(this, uuid, callback);
    }

    populateObject(object, readonly){
        const PLASMA_MAPPING = this.constructor.getPlasmaMapping();
        let fields = Object.keys(this);
        let obj = this;
        fields.forEach(function(field, index){
            field = obj.constructor.fieldModifier(field);
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

    static fieldModifier(object){
        return object.replace(/^_/, '');
    }

    static getEntity(){
        throw "Must implement getEntity method";
    }

    static getPlasmaMapping(){
        return {"_uuid": {"field":"uuid", "data_type":"VARCHAR", "data_length":36, "nullable":"not null", "primary_key":true}};
    }

    get uuid() {
        return this._uuid;
    }

    set uuid(value) {
        this._uuid = value;
    }
}
module.exports = PlasmaEntity;
