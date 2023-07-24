import PlasmaJs from './PlasmaJs.js';
import { v4 as uuidv4 } from 'uuid';

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
                return this.update(callback);
            } else {
                return this.insert(callback);
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
            if(field !== "plasma_meta" && object_values[index] !== undefined) {
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

        let _this = this;
        if(callback === undefined){
            return new Promise((resolve, reject) => {
                PlasmaJs.getConnection.query(query, parameters).then((res) => {
                    let plasma_meta = _this.plasma_meta;
                    plasma_meta.exists = true;
                    _this.plasma_meta = plasma_meta;
                    resolve(res);
                }).catch((err) => {
                    reject(err);
                });
            });
        }else{
            PlasmaJs.getConnection.query(query, parameters, (err,res)=>{
                let plasma_meta = this.plasma_meta;
                plasma_meta.exists = true;
                this.plasma_meta = plasma_meta;
                if(callback !== undefined){
                    callback(err, res);
                }
            });
        }
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
                if (parameter_index === 1) {
                    fields_query += field + " = $" + parameter_index;
                } else {
                    fields_query += ", " + field + " = $" + parameter_index;
                }
                parameter_index++;
            }
        });

        query += fields_query + " WHERE uuid = $" + parameter_index;
        parameters.push(this.uuid);

        let _this = this;
        if(callback === undefined){
            return new Promise((resolve, reject) => {
                PlasmaJs.getConnection.query(query, parameters).then((res) => {
                    let plasma_meta = _this.plasma_meta;
                    plasma_meta.exists = true;
                    _this.plasma_meta = plasma_meta;
                    resolve(res);
                }).catch((err) => {
                    reject(err);
                });
            });
        }else{
            PlasmaJs.getConnection.query(query, parameters, (err,res)=>{
                let plasma_meta = this.plasma_meta;
                plasma_meta.exists = true;
                this.plasma_meta = plasma_meta;
                if(callback !== undefined){
                    callback(err, res);
                }
            });
        }
    }

    static initialiseTable(callback){
        let _this = this;
        let internal_function = function (internal_callback){
            const ENTITY = _this.getEntity();
            const PLASMA_MAPPING = _this.getPlasmaMapping();
            const ENTITY_SPLIT = ENTITY.split(".");
            const SCHEMA = ENTITY_SPLIT[0];
            const TABLE = ENTITY_SPLIT[1];

            let map_count = 0;
            for(let key in PLASMA_MAPPING){
                map_count++;
            }
            if(map_count === 1 && PLASMA_MAPPING._uuid !== undefined){
                internal_callback(new Error("Table mapping not setup"));
                return;
            }

            let query = "CREATE TABLE " + ENTITY + " (";
            let primary_keys = [];
            let unique_keys = [];
            Object.keys(PLASMA_MAPPING).forEach(function(key) {
                let obj_map= PLASMA_MAPPING[key];

                let field = obj_map.field;
                let data_type = obj_map.data_type;
                let data_length = obj_map.data_length;

                if(obj_map.primary_key !== undefined && obj_map.primary_key === true){
                    primary_keys.push(field);
                }

                if(obj_map.unique !== undefined && obj_map.unique === true){
                    unique_keys.push(field);
                }

                let entry = field + " " +data_type;
                if(data_length !== undefined){
                    entry+="("+data_length+")";
                }

                if(obj_map.default !== undefined){
                    entry += " default " + obj_map.default;
                }

                if(obj_map.nullable !== undefined && (obj_map.nullable === "not null" || obj_map.nullable === false)){
                    entry += " not null";
                }

                entry+=", ";
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

            for(let i = 0; i < unique_keys.length; i++){
                let field = unique_keys[i];
                query += " CREATE UNIQUE INDEX " + TABLE + "_" + field + "_uindex ON " + ENTITY + " (" + field + ");";
            }

            PlasmaJs.getConnection.query(query, [], (err,res)=>{
                internal_callback(err, res);
            });
        }

        if(callback !== undefined){
            internal_function(callback);
        }else{
            return new Promise((resolve, reject) => {
                internal_function((err, res) => {
                    if(err){
                        reject(err);
                    }else{
                        resolve(res);
                    }
                });
            });
        }
    }

    static tableExists(){
        return new Promise((resolve, reject) => {
            let schema_mapping = this.getEntity().split(".");
            if(schema_mapping.length === 2){
                PlasmaJs.getConnection.query("SELECT * FROM pg_tables WHERE schemaname = $1 AND tablename = $2", schema_mapping).then((res) => {
                    resolve(res.rows.length === 1);
                }).catch(reject);
            }else{
                reject(new Error("Invalid schema mapping"));
            }
        });
    }

    delete(callback){
        const ENTITY = this.constructor.getEntity();
        if(callback === undefined){
            return new Promise((resolve, reject) => {
                PlasmaJs.getConnection.query("DELETE FROM " + ENTITY + " WHERE uuid = $1;", [this.uuid]).then((res) => {
                    resolve(res);
                }).catch((err) => {
                    reject(err);
                });
            });
        }else{
            PlasmaJs.getConnection.query("DELETE FROM " + ENTITY + " WHERE uuid = $1;", [this.uuid], (err,res)=>{
                if(callback !== undefined){
                    callback(err, res);
                }
            });
        }
    }

    static count(callback){
        const ENTITY = this.getEntity();
        if(callback === undefined){
            return new Promise((resolve, reject) => {
                PlasmaJs.getConnection.query("SELECT count(uuid) as cnt FROM " + ENTITY + ";", []).then((res) => {
                    if(res.rows !== undefined && res.rows.length > 0){
                        resolve(res.rows[0].cnt);
                    }else{
                        resolve(0);
                    }
                }).catch((err) => {
                    reject(err);
                });
            });
        }else{
            PlasmaJs.getConnection.query("SELECT count(uuid) as cnt FROM " + ENTITY + ";", [], (err,res)=>{
                if(res.rows !== undefined && res.rows.length > 0){
                    callback(err, res.rows[0].cnt);
                }else{
                    callback(err, 0);
                }
            });
        }
    }

    static list(callback){
        return PlasmaJs.getConnection.list(this, callback);
    }

    static get(uuid, callback){
        return PlasmaJs.getConnection.getByUUID(this, uuid, callback);
    }

    static fetch(query, parameters, callback){
        return PlasmaJs.getConnection.fetch(this, query, parameters, callback);
    }

    static fetchOne(query, parameters, callback){
        let _this = this;
        if(callback === undefined){
            return new Promise((resolve, reject) => {
                PlasmaJs.getConnection.fetch(_this, query, parameters).then((res) => {
                    if(res.length > 0){
                        resolve(res[0]);
                    }else{
                        resolve(null);
                    }
                }).catch(reject);
            });
        }else{
            PlasmaJs.getConnection.fetch(_this, query, parameters).then((res) => {
                if(res.length > 0){
                    callback(false, res[0]);
                }else{
                    callback(false, null);
                }
            }).catch((err) => {
                callback(err);
            });
        }
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
export default PlasmaEntity;
