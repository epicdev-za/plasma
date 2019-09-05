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
                callback(err, res);
            })
        }else{
            this.pool.query(query, (err, res) => {
                callback(err, res);
            })
        }
    }

    list(entity){
        console.log(entity.name);
    }

    /**
     * Connect method starts connection pool
     * @param config
     */
    connect(config){
        this.pool = new Pool(config);
    }

    /**
     * closeConnection must be called before closing the script to free up connection on server
     */
    closeConnection(){
        this.pool.end();
    }
}

module.exports = PlasmaJs;