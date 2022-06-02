import nextConnect from "next-connect";
import middleware from "../middleware/database";
import pnlManager from "binance-leaderboard-listener/libs/pnlManager";
import Binance2 from "binance-api-node";
import Binance from "node-binance-api";


import { ObjectId } from "mongodb";
import { parse } from "url";
var MongoClient = require('mongodb').MongoClient;
// const encryptedUid = "E183C1EC8742EEDF845E581699D129E3";
const DELAY = 10000;
const handler = nextConnect();
handler.use(middleware);
const crypto = require('crypto');


var assert = require('assert');
var url = "mongodb://localhost:27017";
// var url = "mongodb+srv://copier:qwerty12345@copier.hvpnm.mongodb.net/test?retryWrites=true&w=majority";

const client = new MongoClient(url);

const date = require('date-and-time');
const now = new Date();
var currentDatetime = date.format(now, 'YYYY-MM-DD HH:mm:ss');

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

function splitData(num, val) {
    let numStr = String(num);
    if (numStr.includes('.')) {
        let str = numStr.split('.');
        let str1 = str[0];
        if (str[1] != '' || str[1] != undefined || str[1] != 0) {
            str = str[1].slice(0, val);
            if (str != '' || str != undefined || str != 0) {
                str = str1 + "." + str;
            } else {
                str = str1;
            }
        } else {
            str = str1;
        }
        if (val == 0) {
            str = str1;
        }


        // console.log("str "+str);
        return str;
    }
    return numStr;
}

let decimalCount = num => {
    let numStr = String(num);
    if (numStr.includes('.') || numStr != 1) {
        let str = numStr.split('.');
        let valstr;
        if (str[1] == undefined || str[0] == 1) {
            valstr = 0;
        } else {
            if (str[1] != undefined || str[1].includes('1')) {
                console.log("if");
                str = str[1].split('1');
                valstr = str[0];
                console.log("valstrlength" + valstr.length);
                // valstr = parseInt((valstr.length+1));
                valstr = parseInt((valstr.length));
            } else {
                console.log("else");
                valstr = 0;
            }
        }

        console.log("valstr" + valstr);

        return valstr;
    };
    return 0;
}


async function setLeverage(symbol, value) {
    let apis = await fetch("http://localhost:3000/api/mongo/get-binance-api");
    // let apis = await fetch("http://139.99.74.143:3000/api/mongo/get-binance-api");
    apis = await apis.json();
    let apikey = apis.apikey;
    let apisecret = apis.apisecret;

    // let binance =  new Binance().options({
    //     APIKEY: apikey,
    //     APISECRET: apisecret,
    //     useServerTime: true,
    //   });
    let client = Binance2({
        apiKey: apikey,
        apiSecret: apisecret,
        useServerTime: true,
    });

    //   let data = await binance.futuresLeverage(symbol,value);
    let data = await client.futuresLeverage({ symbol: symbol, leverage: value });
    return data;
}

export async function getPosition() {
    let apis = await fetch("http://localhost:3000/api/mongo/get-binance-api");
    // let apis = await fetch("http://139.99.74.143:3000/api/mongo/get-binance-api");
    apis = await apis.json();
    let apikey = apis.apikey;
    let apisecret = apis.apisecret;

    let order = false;
    // let binance =  new Binance().options({
    //     APIKEY: apikey,
    //     APISECRET: apisecret,
    //     useServerTime: true,
    //   });
    let client = Binance2({
        apiKey: apikey,
        apiSecret: apisecret,
        useServerTime: true,
    });

    //   let positionRisk = await binance.futuresPositionRisk();
    const positionRisk = await client.futuresPositionRisk();

    let positions = [];
    for (let i in positionRisk.positions) {
        let data = positionRisk.positions[i];
        if (data.positionAmt > 0 || data.positionAmt < 0) {
            console.log("positions " + data);
            positions.push(data);
        }
    }
    // return positions;
}

async function closeTrade(symbol) {

    let apis = await fetch("http://localhost:3000/api/mongo/get-binance-api");
    // let apis = await fetch("http://139.99.74.143:3000/api/mongo/get-binance-api");
    apis = await apis.json();
    let apikey = apis.apikey;
    let apisecret = apis.apisecret;

    let order = false;
    // let binance =  new Binance().options({
    //     APIKEY: apikey,
    //     APISECRET: apisecret,
    //     useServerTime: true,
    //   });

    let client = Binance2({
        apiKey: apikey,
        apiSecret: apisecret,
        useServerTime: true,
    });

    let ticker = await client.prices();

    let exchangeInfo = await fetch("https://fapi.binance.com/fapi/v1/exchangeInfo");
    exchangeInfo = await exchangeInfo.json();

    //   let positionRisk = await binance.futuresPositionRisk(symbol);
    let positionRisk = await client.futuresPositionRisk({ symbol: symbol });

    for (let i in positionRisk) {
        let data = positionRisk[i];
        if (data.positionAmt > 0 || data.positionAmt < 0) {
            console.log("positionamt" + data.positionAmt);
            if (data.symbol == symbol) {
                let quantity = data.positionAmt;
                let symbol = data.symbol;
                let side = "BUY";
                if (quantity > 0) {
                    side = "SELL";
                }
                if (quantity < 0) {
                    quantity = -(quantity);
                }
                if (side == "BUY") {

                    try {
                        // order =  await client.futuresMarketBuy(
                        //     symbol,
                        //     quantity
                        //   );
                        order = await client.futuresOrder({
                            symbol: symbol,
                            quantity: quantity,
                            side: side,
                            type: "MARKET",
                            reduceOnly: true,
                            closePosition: true
                        });

                        console.log("order" + order);
                        console.log(
                            `New order made: Buy ${data.quantity} of ${data.symbol}`
                        );
                        if (order.msg) {
                            console.log(
                                `Error on purchase  on ${data.symbol} for ${data.quantity}`
                            );
                        }
                    }
                    catch (e) {
                        console.log("some error in order" + e);
                    }
                }
                else {
                    console.log("quantity " + quantity);
                    try {
                        //    order= await client.futuresMarketSell(
                        //         symbol,
                        //         quantity
                        //       );
                        order = await client.futuresOrder({
                            symbol: symbol,
                            quantity: quantity,
                            side: side,
                            type: "MARKET",
                            reduceOnly: true,
                            closePosition: true
                        });
                        console.log("order" + order);
                        if (order.msg) {
                            console.log(
                                `Error on sell on ${data.symbol} for ${data.quantity}`
                            );
                        }
                        console.log(
                            `New order made: Sell ${data.quantity} of ${data.symbol}  `
                        );
                    }
                    catch (e) {
                        console.log("some error in order" + e);
                    }
                }


            }
        }
    }
    return order;
}

async function futureTrade(data) {
    let apis = await fetch("http://localhost:3000/api/mongo/get-binance-api");
    // let apis = await fetch("http://139.99.74.143:3000/api/mongo/get-binance-api");
    apis = await apis.json();
    let apikey = apis.apikey;
    let apisecret = apis.apisecret;

    let client = Binance2({
        apiKey: apikey,
        apiSecret: apisecret,
        useServerTime: true,
    });
    console.log("datadsfsdf" + JSON.stringify(data));


    let order = false;
    // let binance =  new Binance().options({
    //     APIKEY: apikey,
    //     APISECRET: apisecret,
    //     useServerTime: true,
    //   });

    if (data.type == "Buy") {
        let side = "BUY";
        // order =  await binance.futuresMarketBuy(
        //     data.symbol,
        //     data.quantity
        //   );
        order = await client.futuresOrder({
            symbol: data.symbol,
            quantity: data.quantity,
            side: side,
            type: "MARKET"
        });

        console.log(
            `New order made: Buy ${data.quantity} of ${data.symbol}`
        );
        if (order.msg) {
            console.log(
                `Error on purchase  on ${data.symbol} for ${data.quantity}`
            );
        }
    }
    else {
        let side = "SELL";
        //    order=  await binance.futuresMarketSell(
        //         data.symbol,
        //         data.quantity
        //       );
        order = await client.futuresOrder({
            symbol: data.symbol,
            quantity: data.quantity,
            side: side,
            type: "MARKET"
        });
        if (order.msg) {
            console.log(
                `Error on sell on ${data.symbol} for ${data.quantity}`
            );
        }
        console.log(
            `New order made: Sell ${data.quantity} of ${data.symbol}  `
        );
    }
    return order;

}




export default async function createOrder() {


    //connect with binance api

    let apis = await fetch("http://localhost:3000/api/mongo/get-binance-api");
    // let apis = await fetch("http://139.99.74.143:3000/api/mongo/get-binance-api");
    apis = await apis.json();
    let apikey = apis.apikey;
    let apisecret = apis.apisecret;


    let clients = Binance2({
        apiKey: apikey,
        apiSecret: apisecret,
        useServerTime: true,
    });



    // let orders_count = await fetch("http://139.99.74.143:3000/api/mongo/get_orders");
    let orders_count = await fetch("http://localhost:3000/api/mongo/get_orders");
    orders_count = await orders_count.json();

    // let listeners = await fetch("http://139.99.74.143:3000/api/mongo/get_listeners");
    let listeners = await fetch("http://localhost:3000/api/mongo/get_listeners");
    listeners = await listeners.json();
    listeners = listeners.data;

    let exchangeInfo = await fetch("https://api.binance.com/api/v3/exchangeInfo");
    exchangeInfo = await exchangeInfo.json();

    let ticker = await clients.prices();

    // console.log("exchangeInfo "+JSON.stringify(exchangeInfo));
    let symbol;



    let listener_id;
    for (let i in listeners) {
        let list = listeners[i];
        if (list.isPrimary == true) {
            listener_id = list.encryptedUid;
        }
    }


    await client.connect();
    const database = client.db("binance_leaderboard");
    // const database = client.db("GRIFFIN");
    const Orders = database.collection("orders");
    const Orders_Details = database.collection("order_details");
    const Reviews = database.collection("reviews");

    const listener = pnlManager.listen({
        encryptedUid: listener_id,
        delay: DELAY,
        tradeType: "PERPETUAL"
    })

    listener.on('update', (data) => {

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





            //new encrypted id data insert



            lbsymbols.push(data[i].symbol);
            let lbsymbol = data[i].symbol;
            let mgorders = orders_count.data;
            let uid = orders_count.uid;


            let mgsymbol = mgorders[lbsymbol];
            let mguid = uid[listener_id];


            let quantity = 35;

            let final_quantity = quantity / data[i].markPrice;
            final_quantity = final_quantity;

            let stepsize;
            for (let j in exchangeInfo.symbols) {
                let symbols = exchangeInfo.symbols[j];
                if (symbols.symbol == lbsymbol) {
                    stepsize = symbols.filters[2].stepSize;
                }
            }
            console.log("stepsize" + stepsize);
            let quan = decimalCount(stepsize);
            final_quantity = splitData(final_quantity, quan);
            console.log("lbsymbol" + lbsymbol);
            console.log("price" + ticker[lbsymbol]);
            console.log("final_quantity " + final_quantity);
            //    let response =  await client.marketBuy(side,lbsymbol,quantity).catch((e) => {
            //             console.log("Error on order Buy");
            //             });


            //For open order new code
            if (data.length > 0) {

                console.log("new code workking");
                let alldata = {};
                alldata.symbol = data[i].symbol;
                alldata.quantity = 35;
                // alldata.quantity = 10;

                quantity = final_quantity;
                alldata.quantity = final_quantity;
                let type = "Buy";
                alldata.type = "Buy";
                if (data[i].amount < 0) {
                    type = "Sell";
                    alldata.type = "Sell";
                }
                // if(type == "Buy"){
                // }

                // //open order code
                // Orders.find({ symbol: lbsymbol }).toArray(function (req, res) {
                Orders.find({ $and: [{ symbol: lbsymbol }, { encryptedUid: listener_id },{ status: 0 }] }).toArray(function (req, res) {
                    if (res.length > 0) {
                        // size check for update order new code rr

                    } else {
                        // Open order new code rr

                        // setLeverage(lbsymbol, 20).then(res => {
                        console.log("all_data " + JSON.stringify(alldata));
                        futureTrade(alldata).then(response => {
                            //if trade succssfully placed then insert in mongo db

                            if (response.symbol = data[i].symbol) {
                                var orderData = [{ encryptedUid: listener_id, symbol: data[i].symbol, startPrice: data[i].entryPrice, endPrice: data[i].markPrice, pnl: data[i].pnl, roe: data[i].roe, amount: quantity, updateTimeStamp: data[i].updateTimeStamp, openDateTime: datetime(data[i].updateTimeStamp), closeDateTime: currentDatetime, status: status, type: type, profitType: "", PlAmount: "", isCredit: 1 }];
                                Orders.insertMany(orderData, function (err, res) {
                                    if (err) throw err;

                                    // var Review = { encryptedUid: listener_id, symbol: data[i].symbol, startPrice: data[i].entryPrice, endPrice: data[i].markPrice, pnl: data[i].pnl, roe: data[i].roe, amount: data[i].amount, updateTimeStamp: data[i].updateTimeStamp, openDateTime: datetime(data[i].updateTimeStamp), closeDateTime: currentDatetime, status: status, type: type, profitType: "", PlAmount: "", isCredit: 1,review:" insert record open order with new symbol and new encrypted id in orders table" };
                                    // Reviews.insertOne(Review,function(err,res){});
                                    // console.log("orders  created");
                                    var id = res.insertedIds[0];
                                    var orderDetails = { orderId: id, symbol: data[i].symbol, closePrice: data[i].entryPrice, price: data[i].markPrice, pnl: data[i].pnl, roe: data[i].roe, amount: quantity, updateTimeStamp: data[i].updateTimeStamp, openDateTime: datetime(data[i].updateTimeStamp), closeDateTime: currentDatetime, status: status, type: type, isCredit: 1 };
                                    Orders_Details.insertOne(orderDetails, function (err, res) {
                                        if (err) throw err;

                                        // var Review = { orderId: id, symbol: data[i].symbol, closePrice: data[i].entryPrice, price: data[i].markPrice, pnl: data[i].pnl, roe: data[i].roe, amount: data[i].amount, updateTimeStamp: data[i].updateTimeStamp, openDateTime: datetime(data[i].updateTimeStamp), closeDateTime: currentDatetime, status: status, type: type, isCredit: 1,review:" insert record open order with new symbol and new encrypted id in orders details table" };
                                        // Reviews.insertOne(Review,function(err,res){});
                                        // console.log("order details created");
                                    });
                                });

                                console.log("order placed" + JSON.stringify(response));
                            }
                        }).catch(err => {

                            //error in order placed

                            console.log("error while order place" + JSON.stringify(err));
                        });
                        // }).catch(err => {
                        //     console.log("there are some errors" + JSON.stringify(err));
                        // });




                    }

                    // console.log(res.length);
                });

            }



            //     if (mgsymbol != undefined && mguid != undefined) {

            //         console.log(" (mgsymbol != undefined && mguid != undefined)");
            //         let lbsize = data[i].amount;
            //         let mgsize = mgsymbol.amount;
            //         let mgsym = mgsymbol.symbol;
            //         let order_id = mgsymbol._id;



            //         if (lbsize > mgsize) {
            //             console.log("mgsym" + mgsym);
            //             console.log("lbsize > mgsize");
            //             let size = lbsize - mgsize;
            //             if (lbsize < 0) {
            //                 size = lbsize - (mgsize);
            //                 type = "Sell";
            //             }

            //             var updateData = { symbol: mgsym };
            //             var newValue = { $set: { amount: lbsize, status: 0, isCredit: 1 } };
            //             Orders.updateMany(updateData, newValue, function (err, res) {
            //                 // var Review = { orderId: res[0].orderId, symbol: res[0].symbol, closePrice: res[0].entryPrice, price: res[0].markPrice, pnl: res[0].pnl, roe: res[0].roe, amount: size, openDateTime: datetime(res[0].updateTimeStamp), closeDateTime: currentDatetime, status: 0, type: type, isCredit: 1,review:"update record with larger lbsize in orders table" };
            //                 //     Reviews.insertOne(Review,function(err,res){});

            //                 Orders_Details.find({ orderId: ObjectId(order_id) }).toArray(function (req, res) {
            //                     // for (let i in res) {

            //                     Orders_Details.insertOne(orderDetails, function (err, res) {
            //                         // console.log("order details updated with less size");
            //                         var Review = { orderId: res[0].orderId, symbol: res[0].symbol, closePrice: res[0].entryPrice, price: res[0].markPrice, pnl: res[0].pnl, roe: res[0].roe, amount: size, openDateTime: datetime(res[0].updateTimeStamp), closeDateTime: currentDatetime, status: 0, type: type, isCredit: 1, review: " insert record with larger lbsize in orders details table" };
            //                         Reviews.insertOne(Review, function (err, res) { });
            //                     });
            //                     // }
            //                 });
            //             });

            //         }
            //         else if (lbsize < mgsize) {
            //             console.log("mgsym" + mgsym);
            //             console.log("lbsize < mgsize");

            //             let size = mgsize - lbsize;
            //             if (lbsize < 0) {
            //                 size = mgsize - (lbsize);
            //                 type = "Sell";
            //             }
            //             console.log("lbsize" + lbsize);

            //             var updateData = { symbol: mgsym };
            //             var newValue = { $set: { amount: lbsize, status: 0, isCredit: 1 } };
            //             Orders.updateMany(updateData, newValue, function (err, res) {
            //                 // console.log("order updated with less size");

            //                 // var Review = { orderId: res[0].orderId, symbol: res[0].symbol, closePrice: res[0].entryPrice, price: res[0].markPrice, pnl: res[0].pnl, roe: res[0].roe, amount: size, openDateTime: datetime(res[0].updateTimeStamp), closeDateTime: currentDatetime, status: 0, type: type, isCredit: 1,review:" update record with small lbsize in orders  table" };
            //                 // Reviews.insertOne(Review,function(err,res){});

            //                 Orders_Details.find({ orderId: ObjectId(order_id) }).toArray(function (req, res) {
            //                     // for (let i in res) {
            //                     var orderDetails = { orderId: res[0].orderId, symbol: res[0].symbol, closePrice: res[0].closePrice, price: res[0].price, pnl: res[0].pnl, roe: res[0].roe, amount: size, updateTimeStamp: res[0].updateTimeStamp, openDateTime: datetime(res[0].updateTimeStamp), closeDateTime: currentDatetime, status: 0, type: type, isCredit: 1 };

            //                     Orders_Details.insertOne(orderDetails, function (err, res) {

            //                         // var Review = { orderId: res[0].orderId, symbol: res[0].symbol, closePrice: res[0].entryPrice, price: res[0].markPrice, pnl: res[0].pnl, roe: res[0].roe, amount: size, openDateTime: datetime(res[0].updateTimeStamp), closeDateTime: currentDatetime, status: 0, type: type, isCredit: 1,review:" insert record with small lbsize in orders details table" };
            //                         // Reviews.insertOne(Review,function(err,res){});
            //                         // console.log("order details updated with less size");
            //                     });
            //                     // }
            //                 });
            //             });
            //         }

            //     } else if (mgsymbol == undefined && mguid == undefined) {
            //         console.log("mgsymbol == undefined && mguid == undefined");

            //         let alldata = {};

            //         alldata.symbol = data[i].symbol;
            //         alldata.quantity = 10;
            //         if (data[i].amount < 0) {
            //             alldata.type = "Sell";
            //         }
            //         else {
            //             alldata.type = "Buy";
            //         }


            //         type = "Buy";

            //         if (data[i].amount < 0) {
            //             type = "Sell";
            //         }

            //         // //open order code
            //         // Orders.find({ symbol: lbsymbol }).toArray(function (req, res) {
            //         Orders.find({ $and: [{ symbol: lbsymbol }, { encryptedUid: listener_id }] }).toArray(function (req, res) {
            //             if (res.length > 0) {
            //             } else {

            //                 // console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%Symbold not exist");
            //                 setLeverage(lbsymbol, 20).then(res => {
            //                     console.log("all_data " + JSON.stringify(alldata));
            //                     futureTrade(alldata).then(data => {
            //                         console.log("order placed" + JSON.stringify(data));
            //                     }).catch(err => {
            //                         console.log("error while order place" + JSON.stringify(err));
            //                     })
            //                 }).catch(err => {
            //                     console.log("there are some errors" + JSON.stringify(err));
            //                 });



            //                 var orderData = [{ encryptedUid: listener_id, symbol: data[i].symbol, startPrice: data[i].entryPrice, endPrice: data[i].markPrice, pnl: data[i].pnl, roe: data[i].roe, amount: data[i].amount, updateTimeStamp: data[i].updateTimeStamp, openDateTime: datetime(data[i].updateTimeStamp), closeDateTime: currentDatetime, status: status, type: type, profitType: "", PlAmount: "", isCredit: 1 }];
            //                 Orders.insertMany(orderData, function (err, res) {
            //                     if (err) throw err;

            //                     // var Review = { encryptedUid: listener_id, symbol: data[i].symbol, startPrice: data[i].entryPrice, endPrice: data[i].markPrice, pnl: data[i].pnl, roe: data[i].roe, amount: data[i].amount, updateTimeStamp: data[i].updateTimeStamp, openDateTime: datetime(data[i].updateTimeStamp), closeDateTime: currentDatetime, status: status, type: type, profitType: "", PlAmount: "", isCredit: 1,review:" insert record open order with new symbol and new encrypted id in orders table" };
            //                     // Reviews.insertOne(Review,function(err,res){});
            //                     // console.log("orders  created");
            //                     var id = res.insertedIds[0];
            //                     var orderDetails = { orderId: id, symbol: data[i].symbol, closePrice: data[i].entryPrice, price: data[i].markPrice, pnl: data[i].pnl, roe: data[i].roe, amount: data[i].amount, updateTimeStamp: data[i].updateTimeStamp, openDateTime: datetime(data[i].updateTimeStamp), closeDateTime: currentDatetime, status: status, type: type, isCredit: 1 };
            //                     Orders_Details.insertOne(orderDetails, function (err, res) {
            //                         if (err) throw err;

            //                         // var Review = { orderId: id, symbol: data[i].symbol, closePrice: data[i].entryPrice, price: data[i].markPrice, pnl: data[i].pnl, roe: data[i].roe, amount: data[i].amount, updateTimeStamp: data[i].updateTimeStamp, openDateTime: datetime(data[i].updateTimeStamp), closeDateTime: currentDatetime, status: status, type: type, isCredit: 1,review:" insert record open order with new symbol and new encrypted id in orders details table" };
            //                         // Reviews.insertOne(Review,function(err,res){});
            //                         // console.log("order details created");
            //                     });
            //                 });
            //             }

            //             // console.log(res.length);
            //         });

            //     }

            //     else if (mgsymbol == undefined && mguid != undefined) {
            //         console.log("mgsymbol == undefined && mguid != undefined");
            //         let alldata = {};

            //         alldata.symbol = data[i].symbol;
            //         alldata.quantity = 10;
            //         if (data[i].amount < 0) {
            //             alldata.type = "Sell";
            //         }
            //         else {
            //             alldata.type = "Buy";
            //         }


            //         type = "Buy";
            //         if (data[i].amount < 0) {
            //             type = "Sell";
            //         }

            //         //open order code
            //         Orders.find({ $and: [{ encryptedUid: { $ne: listener_id } }, { lbsymbol: lbsymbol }] }).toArray(function (req, res) {
            //             if (res.length > 0) {
            //             } else {
            //                 setLeverage(lbsymbol, 10).then(res => {
            //                     console.log("all_data " + JSON.stringify(alldata));
            //                     futureTrade(alldata).then(data => {
            //                         console.log("order placed" + JSON.stringify(data));
            //                     }).catch(err => {
            //                         console.log("error while order place" + JSON.stringify(err));
            //                     })
            //                 }).catch(err => {
            //                     console.log("there are some errors" + JSON.stringify(err));
            //                 });

            //                 // console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%Symbold not exist");

            //                 var orderData = [{ encryptedUid: listener_id, symbol: data[i].symbol, startPrice: data[i].entryPrice, endPrice: data[i].markPrice, pnl: data[i].pnl, roe: data[i].roe, amount: data[i].amount, updateTimeStamp: data[i].updateTimeStamp, openDateTime: datetime(data[i].updateTimeStamp), closeDateTime: currentDatetime, status: status, type: type, profitType: "", PlAmount: "", isCredit: 1 }];
            //                 Orders.insertMany(orderData, function (err, res) {
            //                     // var Review = { encryptedUid: listener_id, symbol: data[i].symbol, startPrice: data[i].entryPrice, endPrice: data[i].markPrice, pnl: data[i].pnl, roe: data[i].roe, amount: data[i].amount, updateTimeStamp: data[i].updateTimeStamp, openDateTime: datetime(data[i].updateTimeStamp), closeDateTime: currentDatetime, status: status, type: type, profitType: "", PlAmount: "", isCredit: 1,review:" insert record open order with new symbol in orders  table" };
            //                     // Reviews.insertOne(Review,function(err,res){});
            //                     if (err) throw err;
            //                     // console.log("orders  created");
            //                     var id = res.insertedIds[0];
            //                     var orderDetails = { orderId: id, symbol: data[i].symbol, closePrice: data[i].entryPrice, price: data[i].markPrice, pnl: data[i].pnl, roe: data[i].roe, amount: data[i].amount, updateTimeStamp: data[i].updateTimeStamp, openDateTime: datetime(data[i].updateTimeStamp), closeDateTime: currentDatetime, status: status, type: type, isCredit: 1 };
            //                     Orders_Details.insertOne(orderDetails, function (err, res) {
            //                         if (err) throw err;

            //                         // var Review = { orderId: id, symbol: data[i].symbol, closePrice: data[i].entryPrice, price: data[i].markPrice, pnl: data[i].pnl, roe: data[i].roe, amount: data[i].amount, updateTimeStamp: data[i].updateTimeStamp, openDateTime: datetime(data[i].updateTimeStamp), closeDateTime: currentDatetime, status: status, type: type, isCredit: 1,review:" insert record open order with new symbol in orders  details table" };
            //                         // Reviews.insertOne(Review,function(err,res){});
            //                         // console.log("order details created");
            //                     });
            //                 });
            //             }

            //             // console.log(res.length);
            //         });

            //     }
            //     else if (mgsymbol != undefined && mguid == undefined) {
            //         console.log("mgsymbol != undefined && mguid == undefined");
            //         let alldata = {};

            //         alldata.symbol = data[i].symbol;
            //         alldata.quantity = 10;
            //         if (data[i].amount < 0) {
            //             alldata.type = "Sell";
            //         }
            //         else {
            //             alldata.type = "Buy";
            //         }



            //         type = "Buy";
            //         if (data[i].amount < 0) {
            //             type = "Sell";
            //         }

            //         //open order code
            //         Orders.find({ $and: [{ symbol: { $ne: lbsymbol } }, { encryptedUid: listener_id }] }).toArray(function (req, res) {
            //             if (res.length > 0) {
            //             } else {

            //                 setLeverage(lbsymbol, 10).then(res => {
            //                     console.log("all_data " + JSON.stringify(alldata));
            //                     futureTrade(alldata).then(data => {
            //                         console.log("order placed" + JSON.stringify(data));
            //                     }).catch(err => {
            //                         console.log("error while order place" + JSON.stringify(err));
            //                     })
            //                 }).catch(err => {
            //                     console.log("there are some errors" + JSON.stringify(err));
            //                 });

            //                 // console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%Symbold not exist");

            //                 var orderData = [{ encryptedUid: listener_id, symbol: data[i].symbol, startPrice: data[i].entryPrice, endPrice: data[i].markPrice, pnl: data[i].pnl, roe: data[i].roe, amount: data[i].amount, updateTimeStamp: data[i].updateTimeStamp, openDateTime: datetime(data[i].updateTimeStamp), closeDateTime: currentDatetime, status: status, type: type, profitType: "", PlAmount: "", isCredit: 1 }];
            //                 Orders.insertMany(orderData, function (err, res) {
            //                     if (err) throw err;

            //                     // var Review = { encryptedUid: listener_id, symbol: data[i].symbol, startPrice: data[i].entryPrice, endPrice: data[i].markPrice, pnl: data[i].pnl, roe: data[i].roe, amount: data[i].amount, updateTimeStamp: data[i].updateTimeStamp, openDateTime: datetime(data[i].updateTimeStamp), closeDateTime: currentDatetime, status: status, type: type, profitType: "", PlAmount: "", isCredit: 1,review:" insert record open order with new encypted id in orders  table" };
            //                     // Reviews.insertOne(Review,function(err,res){});
            //                     // console.log("orders  created");
            //                     var id = res.insertedIds[0];
            //                     var orderDetails = { orderId: id, symbol: data[i].symbol, closePrice: data[i].entryPrice, price: data[i].markPrice, pnl: data[i].pnl, roe: data[i].roe, amount: data[i].amount, updateTimeStamp: data[i].updateTimeStamp, openDateTime: datetime(data[i].updateTimeStamp), closeDateTime: currentDatetime, status: status, type: type, isCredit: 1 };
            //                     Orders_Details.insertOne(orderDetails, function (err, res) {
            //                         if (err) throw err;
            //                         // var Review = { orderId: id, symbol: data[i].symbol, closePrice: data[i].entryPrice, price: data[i].markPrice, pnl: data[i].pnl, roe: data[i].roe, amount: data[i].amount, updateTimeStamp: data[i].updateTimeStamp, openDateTime: datetime(data[i].updateTimeStamp), closeDateTime: currentDatetime, status: status, type: type, isCredit: 1,review:" insert record open order with new encrypted id in orders  details table" };
            //                         // Reviews.insertOne(Review,function(err,res){});
            //                         // console.log("order details created");
            //                     });
            //                 });
            //             }

            //             // console.log(res.length);
            //         });

            //     }
            // }


            //close order code
            Orders.find({ status: 0 }).toArray(function (req, res) {

                for (let i in res) {
                    let order_symbol = res[i].symbol;
                    let order_id = res[i]._id;
                    
                    let encryptedUid = res[i].encryptedUid;
                    if (!lbsymbols.includes(order_symbol) && encryptedUid == listener_id) {
                        closeTrade(order_symbol).then(response => {
                            
                            //order update if order successfully placed with binance
                            
                            if (response.symbol == order_symbol) {
                                console.log("sssssssresult symbolsssssss"+order_symbol);
                                var updateData = { symbol: order_symbol };
                                var newValue = { $set: { status: 1, isCredit: 0 } };
                                Orders.updateMany(updateData, newValue, function (err, res) {

                                    // var Review = { orderId: data[0].orderId, symbol: data[0].symbol, closePrice: data[0].closePrice, price: data[0].price, pnl: data[0].pnl, roe: data[0].roe, amount: data[0].amount, updateTimeStamp: data[0].updateTimeStamp, openDateTime: datetime(data[0].updateTimeStamp), closeDateTime: currentDatetime, status: 1, type: data[0].type, isCredit: 0,review:" insert record close order in orders  table" };
                                    // Reviews.insertOne(Review,function(err,res){});
                                    // console.log("order closed");
                                    // console.log("order_id"+ObjectId(order_id));
                                    // Orders_Details.find({ orderId: id }).toArray(function (req, res) {
                                    Orders_Details.find({ $and: [{ orderId: ObjectId(order_id) }, { symbol: order_symbol }] }).toArray(function (req, data) {
                                        if (data.length == 1) {

                                            // console.log("find res"+JSON.stringify(data.length));
                                            // for (let i in data) {
                                            var orderDetails = { orderId: data[0].orderId, symbol: data[0].symbol, closePrice: data[0].closePrice, price: data[0].price, pnl: data[0].pnl, roe: data[0].roe, amount: data[0].amount, updateTimeStamp: data[0].updateTimeStamp, openDateTime: datetime(data[0].updateTimeStamp), closeDateTime: currentDatetime, status: 1, type: data[0].type, isCredit: 0 };
                                            Orders_Details.insertOne(orderDetails, function (err, res) {

                                                // var Review = { orderId: data[0].orderId, symbol: data[0].symbol, closePrice: data[0].closePrice, price: data[0].price, pnl: data[0].pnl, roe: data[0].roe, amount: data[0].amount, updateTimeStamp: data[0].updateTimeStamp, openDateTime: datetime(data[0].updateTimeStamp), closeDateTime: currentDatetime, status: 1, type: data[0].type, isCredit: 0,review:" insert record close order in orders details table" };
                                                // Reviews.insertOne(Review,function(err,res){});
                                                // console.log("order details closed");
                                            });
                                            // }
                                        }
                                    });

                                });

                                console.log("close order " + response);
                            }
                        }).catch(err => {
                            console.log("close order err " + err);
                        });



                        // console.log("symbol data not exist");
                    }
                    else {
                        // console.log(order_symbol);
                        // console.log("symbol data  exist");
                    }
                }


                // console.log("active records");
                // console.log(res);
            });

        }
    });

}