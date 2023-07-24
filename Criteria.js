const AND = 0;
const OR = 1;
const QUERY = 3;
const NULL_CHECK = 4;
class Criteria {
    constructor(){
        this.query = " WHERE ";
        this.queryObjects = [];
    }

    and(query){
        this.query += " AND ("+query()+")";
        return this;
    }

    or(query){
        return this;
    }

    like(field, value){
        this.queryObjects.push({QUERY, field, value});
        return this;
    }

    equals(field, value){
        this.queryObjects.push({QUERY, field, value});
        return this;
    }

    notEqual(field, value){
        this.queryObjects.push({QUERY, field, value});
        return this;
    }

    greater(field, value){
        this.queryObjects.push({QUERY, field, value});
        return this;
    }

    lessThan(field, value){
        this.queryObjects.push({QUERY, field, value});
        return this;
    }

    inNotNull(field){
        this.queryObjects.push({QUERY, field, null});
        return this;
    }

    isNull(field){
        this.queryObjects.push({QUERY, field, null});
        return this;
    }

    build(){

    }

    call(){
        this.queryObjects.forEach(function(query, index){

        });
    }
}
export default Criteria;