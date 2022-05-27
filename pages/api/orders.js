
var MongoClient = require('mongodb').MongoClient;

var assert = require('assert');
var url = "mongodb://localhost:27017/";
const client = new MongoClient(url);
export default  function handler(req, res) {
     client.connect();
    const database = client.db("binance_leaderboard");
    const collection = database.collection("orders");
    collection.find({}).toArray(function(err, result) {
        res.status(200).json({ data:result.length });
    });
  }