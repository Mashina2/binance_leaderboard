const encryptedUid = "E183C1EC8742EEDF845E581699D129E3";
const DELAY = 10000;

import nextConnect from "next-connect";
import middleware from "../middleware/database";
const handler = nextConnect();
handler.use(middleware);
import axios from "axios";

import pnlManager from "binance-leaderboard-listener/libs/pnlManager";

var MongoClient = require('mongodb').MongoClient;

var assert = require('assert');
var url = "mongodb://localhost:27017/";
const client = new MongoClient(url);

const date = require('date-and-time');
const now = new Date();
var currentDatetime = date.format(now, 'YYYY-MM-DD HH:mm:ss');

let flag = 0;
function datetime(t) {
    // var dt = new Date(t*1000);
    var tm = new Date(t);

    var day = tm.getDate();
    if (day < 10) {
        day = "0" + day;
    }
    var month = tm.getMonth() + 1;
    if (month < 10) {
        month = "0" + month;
    }
    var year = tm.getFullYear();
    var hr = tm.getHours();
    if (hr < 10) {
        hr = "0" + hr;
    }
    var m = "0" + tm.getMinutes();
    var s = "0" + tm.getSeconds();
    return year + "-" + month + "-" + day + " " + hr + ':' + m.substr(-2) + ':' + s.substr(-2);
}

export default async function createOrder() {

    // let orders_count = await fetch("http://localhost:3000/api/mongo/get_orders");
    // orders_count = await orders_count.json();



    await client.connect();
    const database = client.db("binance_leaderboard");
    const Orders = database.collection("orders");
    const Orders_Details = database.collection("order_details");

    const listener = pnlManager.listen({
        encryptedUid: encryptedUid,
        delay: DELAY,
        tradeType: "PERPETUAL"
    })
    listener.on('update', (data) => {

        // console.log(new Date());
        //   console.log(data);
        //   return false;
        // MongoClient.connect(url, function(err, db){
        //     assert.equal(null,err);
        //     var dbo = db.db("binance_leaderboard");
        //         var myquery = { encryptedUid: encryptedUid };
        //         dbo.collection("orders").deleteMany(myquery, function(err, obj) {
        //             if (err) throw err;
        //             console.log(" document(s) deleted");
        //             // db.close();
        //         });
        //         var myquery = { type: "Buy"};
        //         dbo.collection("order_details").deleteMany(myquery, function(err, obj) {
        //             if (err) throw err;
        //             console.log(" document(s) deleted");
        //             // db.close();
        //         });
        //     });

        // return false;



        let type = "Buy";
        let total_orders = orders_count.length;
        let orders = orders_count.data;
        let status = 0;
        // console.log("total_orders "+total_orders);
        let lblength = data.length;
        // console.log("total orders" + total_orders);
        // console.log("lblength" + lblength);
        let lengthloop = lblength;

        let lbsymbols = [];
        for (let i = 0; i < lblength; i++) {
            
            lbsymbols.push(data[i].symbol);
            let lbsymbol = data[i].symbol;
            let mgorders = orders_count.data;
            let mgsymbol = mgorders[lbsymbol];

            if (mgsymbol != undefined) {

                let lbsize = data[i].amount;
                let mgsize = mgsymbol.amount;
                let mgsym = mgsymbol.symbol;
                if (lbsize > mgsize) {
                    let size = lbsize + mgsize;
                    if(lbsize < 0){
                        size = lbsize - (mgsize);
                    }

                    var updateData = {symbol:mgsym};
                    var newValue = { $set:{amount:size}};
                    Orders.updateMany(updateData, newValue,function (err, res) {
                        // console.log("order updated with greater size");
                    Orders_Details.updateMany(updateData, newValue,function (err, res) {
                        // console.log("order details updated with greater size");
                    });
                    });

                }
                else if (lbsize < mgsize) {
                    let size = lbsize - mgsize;
                    if(lbsize < 0){
                        size = lbsize + (mgsize);
                    }

                    var updateData = {symbol:mgsym};
                    var newValue = { $set:{amount:size}};
                    Orders.updateMany(updateData, newValue,function (err, res) {
                        // console.log("order updated with less size");
                    Orders_Details.updateMany(updateData, newValue,function (err, res) {
                        // console.log("order details updated with less size");
                    });
                    });
                }

            } else if (mgsymbol == undefined) {
                if (data[i].amount < 0) {
                    type = "Sell";
                }

                //open order code
                Orders.find({ symbol: lbsymbol }).toArray(function (req, res) {
                    if (res.length > 0) {
                    } else {

                        // console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%Symbold not exist");

                        var orderData = [{ encryptedUid: encryptedUid, symbol: data[i].symbol, startPrice: data[i].entryPrice, endPrice: data[i].markPrice, pnl: data[i].pnl, roe: data[i].roe, amount: data[i].amount, updateTimeStamp: data[i].updateTimeStamp, openDateTime: datetime(data[i].updateTimeStamp), closeDateTime: currentDatetime, status: status, type: type, profitType: "", PlAmount: "" ,isCredit:1 }];
                        Orders.insertMany(orderData, function (err, res) {
                            if (err) throw err;
                            // console.log("orders  created");
                            var id = res.insertedIds[0];
                            var orderDetails = [{ orderId: id, symbol: data[i].symbol, closePrice: data[i].entryPrice, price: data[i].markPrice, pnl: data[i].pnl, roe: data[i].roe, amount: data[i].amount, updateTimeStamp: data[i].updateTimeStamp, openDateTime: datetime(data[i].updateTimeStamp), closeDateTime: currentDatetime, status: status, type: type ,isCredit:1}];
                            Orders_Details.insertMany(orderDetails, function (err, res) {
                                if (err) throw err;
                                // console.log("order details created");
                            });
                        });
                    }

                    // console.log(res.length);
                });

            }
        }

            //close order code
            Orders.find({ status: 0 }).toArray(function (req, res) {
                for(let i in res){
                    let order_symbol = res[i].symbol;
                    if(!lbsymbols.includes(order_symbol)){
                        var updateData = {symbol:order_symbol};
                        var newValue = { $set:{status:1,isCredit:0}};
                        Orders.updateMany(updateData, newValue,function (err, res) {
                            // console.log("order closed");
                            Orders_Details.updateMany(updateData, newValue,function (err, res) {
                                // console.log("order details closed");
                            });
                        });
                        // console.log("symbol data not exist");
                    }
                    else{
                        // console.log(order_symbol);
                        // console.log("symbol data  exist");
                    }
                }


                // console.log("active records");
                // console.log(res);
            });

    })

}