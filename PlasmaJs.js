const { Pool, Client } = require('pg')


class PlasmaJs{

    /**
     * Query method with callback
     * @param query
     * @param parameters
     * @param callback
     */
    query(query, parameters, callback){
        if(parameters !== undefined && parameters !== null && parameters.length > 0){
            this.pool.query(query, parameters, (err, res) => {
                if(callback !== undefined){
                    callback(err, res);
                }
            })
        }else{
            this.pool.query(query, (err, res) => {
                if(callback !== undefined){
                    callback(err, res);
                }
            })
        }
    }

    fetch(entity, query, parameters, callback){
        this.query(query, parameters, (err,res)=>{
            let objects = [];
            if(res.rows !== undefined && res.rows.length > 0){
                res.rows.forEach(function(object, index){
                    let tmp = new entity();
                    tmp.populateObject(object);
                    objects.push(tmp);
                });
            }
            callback(err, objects);
        });
    }

    list(entity){
        let query = "SELECT * FROM " + entity.getEntity();
        this.query(query, [], (err,res)=>{

        });
    }

    exists(entity, uid, callback){
        const query = "SELECT uid FROM " + entity.getEntity() + " WHERE uid = $1 LIMIT 1;";
        this.query(query, [uid], (err, res)=>{
            if(res.rows !== undefined && res.rows.length > 0){
                callback(true);
            }else{
                callback(false);
            }
        });
    }

    /**
     * Connect method starts connection pool
     * @param config
     */
    connect(config){
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
    }

    /**
     * closeConnection must be called before closing the script to free up connection on server
     */
    closeConnection(){
        this.pool.end();
    }

    static get getConnection(){
        return this.connection;
    }

    static set setConnection(connection){
        this.connection = connection;
    }
}

module.exports = PlasmaJs;