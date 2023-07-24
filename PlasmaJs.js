import pkg from 'pg';
const { Pool } = pkg;

class PlasmaJs{

    /**
     * Query method with callback
     * @param query
     * @param parameters
     * @param callback
     */
    query(query, parameters, callback){
        const currentStack = new Error();

        let _this = this;
        let internal_query = function(query, parameters, callback){
            if(parameters !== undefined && parameters !== null && parameters.length > 0){
                _this.pool.query(query, parameters, (err, res) => {
                    if(err){
                        console.error(query);
                        console.error(currentStack.stack);
                    }
                    if(callback !== undefined){
                        callback(err, res);
                    }
                })
            }else{
                _this.pool.query(query, (err, res) => {
                    if(err){
                        console.error(query);
                        console.error(currentStack.stack);
                    }
                    if(callback !== undefined){
                        callback(err, res);
                    }
                })
            }
        };

        if(callback === undefined){
            return new Promise((resolve, reject) => {
                internal_query(query, parameters, (err, res) => {
                    if(err){
                        reject(err);
                    }else{
                        resolve(res);
                    }
                });
            });
        }else{
            internal_query(query, parameters, callback);
        }
    }

    fetch(entity, query, parameters, callback){
        let _this = this;
        if(callback === undefined){
            return new Promise((resolve, reject) => {
                _this.query(query, parameters).then((res) => {
                    let objects = [];
                    if (res !== undefined && res.rows !== undefined && res.rows.length > 0) {
                        res.rows.forEach(function (object, index) {
                            let tmp = new entity();
                            tmp.populateObject(object);
                            objects.push(tmp);
                        });
                    }
                    resolve(objects);
                }).catch((err) => {
                    reject(err);
                });
            });
        }else {
            this.query(query, parameters, (err, res) => {
                let objects = [];
                if (res !== undefined && res.rows !== undefined && res.rows.length > 0) {
                    res.rows.forEach(function (object, index) {
                        let tmp = new entity();
                        tmp.populateObject(object);
                        objects.push(tmp);
                    });
                }
                callback(err, objects);
            });
        }
    }

    getByUUID(entity, uuid, callback){
        let _this = this;
        if(callback === undefined){
            return new Promise((resolve, reject) => {
                _this.fetch(entity, "SELECT * FROM " + entity.getEntity() + " WHERE uuid = $1 LIMIT 1", [uuid]).then((res) => {
                    let object = undefined;
                    if (res !== undefined && res.length > 0) {
                        object = res[0];
                    }
                    resolve(object);
                }).catch((err) => {
                    reject(err);
                });
            });
        }else {
            this.fetch(entity, "SELECT * FROM " + entity.getEntity() + " WHERE uuid = $1 LIMIT 1", [uuid], (err, res) => {
                let object = undefined;
                if (res !== undefined && res.length > 0) {
                    object = res[0];
                }
                callback(err, object);
            });
        }
    }

    /**
     * Allows queries to retrieve only desired fields, object will return with a readonly flag and cannot be saved
     * @param entity
     * @param query
     * @param parameters
     * @param callback
     */
    fetchPartial(entity, query, parameters, callback){
        let _this = this;
        if(callback === undefined){
            return new Promise((resolve, reject) => {
                _this.query(query, parameters).then((res) => {
                    let objects = [];
                    if(res !== undefined && res.rows !== undefined && res.rows.length > 0){
                        res.rows.forEach(function(object, index){
                            let tmp = new entity();
                            tmp.populateObject(object, true);
                            objects.push(tmp);
                        });
                    }
                    resolve(objects);
                }).catch((err) => {
                    reject(err);
                });
            });
        }else{
            this.query(query, parameters, (err,res)=>{
                let objects = [];
                if(res !== undefined && res.rows !== undefined && res.rows.length > 0){
                    res.rows.forEach(function(object, index){
                        let tmp = new entity();
                        tmp.populateObject(object, true);
                        objects.push(tmp);
                    });
                }
                callback(err, objects);
            });
        }
    }

    list(entity, callback){
        let query = "SELECT * FROM " + entity.getEntity();
        return this.fetch(entity, query, [], callback);
    }

    exists(entity, uuid, callback){
        let _this = this;
        const query = "SELECT uuid FROM " + entity.getEntity() + " WHERE uuid = $1 LIMIT 1;";
        if(callback === undefined){
            return new Promise((resolve, reject) => {
                _this.query(query, [uuid], (err, res)=>{
                    if(res !== undefined && res.rows !== undefined && res.rows.length > 0){
                        resolve(true);
                    }else{
                        resolve(false);
                    }
                });
            });
        }else{
            this.query(query, [uuid], (err, res)=>{
                if(res !== undefined && res.rows !== undefined && res.rows.length > 0){
                    callback(true);
                }else{
                    callback(false);
                }
            });
        }
    }

    /**
     * Connect method starts connection pool
     * @param config
     */
    connect(config){
        configIsset(config, 'user');
        configIsset(config, 'host');
        configIsset(config, 'database');
        configIsset(config, 'password');
        configIsset(config, 'port');
        configIsset(config, 'schema');

        this.config = config;
        let postgre_config = {
            user: config.user,
            host: config.host,
            database: config.database,
            password: config.password,
            port: config.port,
        };
        this.pool = new Pool(postgre_config);
        PlasmaJs.setConnection = this;
        PlasmaJs.setSchema = this.config.schema;

        return this.pool.connect();
    }

    /**
     * closeConnection must be called before closing the script to free up connection on server
     */
    closeConnection(){
        this.pool.end();
    }

    static get getSchema(){
        return this.schema;
    }

    static get getConnection(){
        return this.connection;
    }

    static set setConnection(connection){
        this.connection = connection;
    }

    static set setSchema(schema){
        this.schema = schema;
    }
}
export default PlasmaJs;

/* PRIVATE */

function configIsset(object, key){
    if(object[key] === undefined){
        throw new Error("Missing required parameter '" + key + "'");
    }
}
