
var MongoClient = require('mongodb').MongoClient;
import { ObjectId } from 'mongodb';

var assert = require('assert');
var url = "mongodb://localhost:27017/";
const client = new MongoClient(url);
export default  function handler(req, res) {
     client.connect();
    const database = client.db("binance_leaderboard");
    const collection = database.collection("test");
    const collection1 = database.collection("test_details");
    var myquery = { _id: ObjectId("6291d5312713f75f7ac0f4a8") };
    var newvalues = { $set: {data: "test1" } };
    // collection.updateMany(myquery,newvalues,function(err, result) {
    //     console.log("my return result"+JSON.stringify(result));
    //     res.status(200).json({ data:result });
    // });
    let id = "6291d5312713f75f7ac0f4a8";
    collection.find({_id:ObjectId(id)}).toArray(function(err,result){
        if(result[0].amount == 12)
        var myquery = { _id: ObjectId(id)};
        var newvalues = { $set: {amount: 13 } };
    collection.updateMany(myquery,newvalues,function(err, resultd) {
        var mydata= [{test_id:ObjectId(id) ,amount:11,data:"test1"}];
        collection1.insertMany(mydata,function(err,ddd){

        });
    });
        
    });
}