var Binance2 = require('binance-api-node').default;
const TelegramBot = require("node-telegram-bot-api");
const master_token = "5096471511:AAHyjFk4NpXrm66XIZDQ67JaKlTuCi3SjLA";
const TELEGRAM_MASTER_CHANNEL = "-1001789460971";
const pnlManager = require('binance-leaderboard-listener/libs/pnlManager');
const ObjectId = require("mongodb").ObjectId;
const MongoClient = require('mongodb').MongoClient;
const date = require('date-and-time');
const { responseSymbol } = require('next/dist/server/web/spec-compliant/fetch-event');
// const {sendTelegramMaster} = require('./helpers/telegram_helper');
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: false,
}
console.log('ccccccccccccccccccccccccccccccccccccccccc');




var url = "mongodb://localhost:27017";

// const url = "mongodb+srv://copier:qwerty12345@copier.hvpnm.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(url);
// require('dotenv').config()
console.log('fffffffffffffffffffffffffffffffff');
const DELAY = 5000;


const now = new Date();
var currentDatetime = date.format(now, 'YYYY-MM-DD HH:mm:ss');
// sendTelegramMaster(
//     `test message from http://139.99.74.143:3000`
// );

async function sendTelegramMaster(message) {
    const bot = new TelegramBot(master_token, { polling: false });

    // bot.sendMessage(process.env.TELEGRAM_MASTER_CHANNEL, message);
    bot.sendMessage(TELEGRAM_MASTER_CHANNEL, message);
}

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
                valstr = parseInt((valstr.length + 1));
                // valstr = parseInt((valstr.length));
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


async function getOrders() {

    let orders_count = await fetch("http://139.99.74.143:3000/api/mongo/get_orders");
    // let orders_count = await fetch("http://localhost:3000/api/mongo/get_orders");
    orders_count = await orders_count.json();

    let listeners = await fetch("http://139.99.74.143:3000/api/mongo/get_listeners");
    // let listeners = await fetch("http://localhost:3000/api/mongo/get_listeners");
    listeners = await listeners.json();
    listeners = listeners.data;

    let exchangeInfo = await fetch("https://api.binance.com/api/v3/exchangeInfo");
    exchangeInfo = await exchangeInfo.json();

    return orders_count;

}


async function setLeverage(symbol, value) {
    // let apis = await fetch("http://localhost:3000/api/mongo/get-binance-api");
    let apis = await fetch("http://139.99.74.143:3000/api/mongo/get-binance-api");
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


async function closeTrade(symbol) {

    // let apis = await fetch("http://localhost:3000/api/mongo/get-binance-api");
    let apis = await fetch("http://139.99.74.143:3000/api/mongo/get-binance-api");
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
                            // reduceOnly: true,
                            // closePosition: true
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
                            // reduceOnly: true,
                            // closePosition: true
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
    // let apis = await fetch("http://localhost:3000/api/mongo/get-binance-api");
    let apis = await fetch("http://139.99.74.143:3000/api/mongo/get-binance-api");
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

async function calStepsize(symbol) {

    let exchangeInfo = await fetch("https://api.binance.com/api/v3/exchangeInfo");
    exchangeInfo = await exchangeInfo.json();


    let stepsize;
    for (let j in exchangeInfo.symbols) {
        let symbols = exchangeInfo.symbols[j];
        if (symbols.symbol == symbol) {
            stepsize = symbols.filters[2].stepSize;
        }
    }
    return stepsize;

}

(async () => {

    //connect with binance api

    // let apis = await fetch("http://localhost:3000/api/mongo/get-binance-api");
    let apis = await fetch("http://139.99.74.143:3000/api/mongo/get-binance-api");
    apis = await apis.json();
    let apikey = apis.apikey;
    let apisecret = apis.apisecret;

    let leverage = apis.leverage;


    let clients = Binance2({
        apiKey: apikey,
        apiSecret: apisecret,
        useServerTime: true,
    });



    let orders_count = await fetch("http://139.99.74.143:3000/api/mongo/get_orders");
    // let orders_count = await fetch("http://localhost:3000/api/mongo/get_orders");
    orders_count = await orders_count.json();

    let listeners = await fetch("http://139.99.74.143:3000/api/mongo/get_listeners");
    // let listeners = await fetch("http://localhost:3000/api/mongo/get_listeners");
    listeners = await listeners.json();
    listeners = listeners.data;

    let exchangeInfo = await fetch("https://api.binance.com/api/v3/exchangeInfo");
    exchangeInfo = await exchangeInfo.json();


    // console.log("exchangeInfo "+JSON.stringify(exchangeInfo));
    let symbol;

    let listener_id;
    let listener_name;
    for (let i in listeners) {
        let list = listeners[i];
        if (list.isPrimary == true) {
            listener_id = list.encryptedUid;
            listener_name = list.Name;
        }
    }




    await client.connect();
    const database = client.db("binance_leaderboard");
    // const database = client.db("GRIFFIN");
    const Orders = database.collection("orders");
    const Orders_Details = database.collection("order_details");
    const lists = database.collection("leaderboard_uid");

    //disable trade on restart server;

    // let query = { isPrimary: true };
    // let status = { $set: { enable: false } }
    // lists.updateOne(query, status, { upsert: true });


    const listener = pnlManager.listen({
        encryptedUid: listener_id,
        delay: DELAY,
        tradeType: "PERPETUAL"
    });

    listener.on('update', (data) => {
        // getOrders().then(response => {
        //     let listeners = response.listeners;
        //     let orders_count = response.orders_count;
        //     let exchangeInfo = response.exchangeInfo;

        //     console.log("listenersssssssssss " + JSON.stringify(listeners));
        //     console.log("orders counttttttttttttt" + JSON.stringify(orders_count));
        //     console.log("exchange infooooooooooooooooo" + JSON.stringify(exchangeInfo));
        // });
        let lbsymbols = [];

        lists.find({ isPrimary: true }).toArray(function (err, result) {
            console.log("list results " + JSON.stringify(result));
            let traderStatus = result[0].enable;
            if (traderStatus == true) {

                // return false;
                let type = "Buy";
                // let total_orders = orders_count.length;
                // let orders = orders_count.data;
                let status = 0;
                let lblength = data.length;
                let lengthloop = lblength;

                for (let i = 0; i < lblength; i++) {
                    //new encrypted id data insert
                    lbsymbols.push(data[i].symbol);

                    let lbsymbol = data[i].symbol;

                    // let mgorders = orders_count.data;

                    // let uid = orders_count.uid;


                    // let mgsymbol = mgorders[lbsymbol];
                    // let mguid = uid[listener_id];

                    // convert leaderboard amount to usdt with entry price

                    let lbamt = data[i].amount;
                    let lbentryprice = data[i].entryPrice;


                    let lbamount = lbamt * lbentryprice;




                    let stepsize;

                    for (let j in exchangeInfo.symbols) {
                        let symbols = exchangeInfo.symbols[j];
                        if (symbols.symbol == lbsymbol) {
                            stepsize = symbols.filters[2].stepSize;
                        }
                    }


                    let quan = decimalCount(stepsize);

                    let lbquan = decimalCount(stepsize);

                    // let quantity = 35;

                    let quantity = 50;

                    let final_quan = quantity / data[i].markPrice;

                    let final_quantity = splitData(final_quan, quan);

                    let final_lbamount = splitData(lbamount, lbquan);


                    console.log("final_lbamount" + final_lbamount);


                    if (data[i].amount < 0) {
                        final_quantity = -final_quantity;
                        // final_lbamount = -final_lbamount;
                    }

                    //For open order new code 
                    if (data.length > 0) {

                        console.log("new code workking");
                        let alldata = {};
                        alldata.symbol = data[i].symbol;
                        // alldata.quantity = 35;
                        alldata.quantity = 10;

                        quantity = final_quantity;
                        alldata.quantity = final_quantity;
                        let type = "Buy";
                        alldata.type = "Buy";
                        if (data[i].amount < 0) {
                            type = "Sell";
                            alldata.type = "Sell";
                        }

                        Orders.find({ $and: [{ symbol: lbsymbol }, { encryptedUid: listener_id }, { status: 0 }] }).toArray(function (req, res) {
                            // //open order code

                            // data is already exist in mongodb with open order than size match with leaderboard and mongodb
                            if (res.length > 0) {
                                // size check for update order new code rr

                                let lbsize = data[i].amount;
                                let mgsize = res[0].lbsize;
                                let preqt = res[0].amount;

                                console.log("***********************************************");
                                console.log(mgsize);

                                let mgsym = lbsymbol;

                                let order_id = res[0]._id;

                                //if leaderboard size less than 0 than set type sell otherwise buy
                                if (lbsize < 0) {
                                    type = "Sell";
                                }
                                else {
                                    type = "Buy";
                                }

                                // leaderboard size is greater than mongodb size and type Buy

                                if (lbsize > mgsize && type == "Buy") {

                                    let differ = lbsize - mgsize;
                                    let percecal = (differ * 100) / mgsize;


                                    let differcal = (percecal / 100) * preqt;
                                    let updatecoin;
                                    if ((differcal*data[i].markPrice) < 11 ) {

                                        let quantity1 = 10;
                                        let final_quan1 = quantity1 / data[i].markPrice;
                                         updatecoin = splitData(final_quan1, quan);
                                         updatecoin = Number(updatecoin);

                                    }else{
                                            updatecoin = splitData(differcal, quan);
                                            updatecoin = Number(updatecoin);
                                    }

                                   

                                    sendTelegramMaster(
                                        `${updatecoin} DCA of Asset calculated ${lbsymbol}`
                                    );
                                    sendTelegramMaster(
                                        `${final_quantity} DCA of Asset  ${lbsymbol}`
                                    );

                                    // preqt = parseInt(preqt);

                                    let size = (preqt) + (+updatecoin);

                                    // futureTrade(alldata).then(response => {

                                    // var updateData = { symbol: mgsym };
                                    var updateData = { _id: ObjectId(order_id) };
                                    var newValue = { $set: { amount: size, status: 0, isCredit: 1, orderStatus: "success", lbamount: final_lbamount, lbentryPrice: data[i].entryPrice, lbsize: lbsize } };

                                    Orders.updateMany(updateData, newValue, function (err, res) {

                                        Orders_Details.find({ orderId: ObjectId(order_id) }).toArray(function (req, res) {
                                            var orderDetails = { orderId: res[0].orderId, symbol: res[0].symbol, closePrice: res[0].closePrice, price: res[0].price, pnl: res[0].pnl, roe: res[0].roe, amount: updatecoin, updateTimeStamp: res[0].updateTimeStamp, openDateTime: datetime(res[0].updateTimeStamp), closeDateTime: currentDatetime, status: 0, type: type, isCredit: 1, orderStatus: "success", lbamount: final_lbamount, lbentryPrice: data[i].entryPrice, lbsize: lbsize };

                                            Orders_Details.insertOne(orderDetails, function (err, res) {
                                            });
                                        });

                                    });

                                    // sendTelegramMaster(
                                    //     `${res[0].symbol} DCA Trade of ${type} ${lbsize}`
                                    // );

                                    // sendTelegramMaster(
                                    //     `New order made: ${type} ${size} of ${res[0].symbol} for ${listener_name}`
                                    // );
                                    // console.log("order placed size increase of previous order" + JSON.stringify(response));
                                    // }).catch(err => {
                                    //     var updateData = { symbol: mgsym };
                                    //     var newValue = { $set: { amount: lbsize, status: 0, isCredit: 1, orderStatus: "failed" } };
                                    //     Orders.updateMany(updateData, newValue, function (err, res) {

                                    //         Orders_Details.find({ orderId: ObjectId(order_id) }).toArray(function (req, res) {
                                    //             var orderDetails = { orderId: res[0].orderId, symbol: res[0].symbol, closePrice: res[0].closePrice, price: res[0].price, pnl: res[0].pnl, roe: res[0].roe, amount: size, updateTimeStamp: res[0].updateTimeStamp, openDateTime: datetime(res[0].updateTimeStamp), closeDateTime: currentDatetime, status: 0, type: type, isCredit: 1 };
                                    //             Orders_Details.insertOne(orderDetails, function (err, res) {
                                    //             });
                                    //         });
                                    //     });

                                    //     sendTelegramMaster(
                                    //         `Error on ${type} ${size} of ${res[0].symbol} for ${listener_name}`
                                    //     );http://139.99.74.143:3000/
                                    //     console.log("Error in size increase of previous order" + JSON.stringify(err));
                                    // })
                                }


                                // leaderboard size is greater than mongodb size and type Sell
                                if (lbsize < mgsize && type == "Sell") {

                                //     let differ = (lbsize) - (mgsize);
                                //     let percecal = (differ * 100) / mgsize;


                                //     let differcal = (percecal / 100) * preqt;
                                //     let updatecoin;
                                //     if ((differcal*data[i].markPrice) < 11 ) {

                                //         let quantity1 = 10;
                                //         let final_quan1 = quantity1 / data[i].markPrice;
                                //         updatecoin = splitData(final_quan1, quan);
                                //         updatecoin = Number(updatecoin);

                                //    }else{
                                //            updatecoin = splitData(differcal, quan);
                                //            updatecoin = Number(updatecoin);
                                //    }

                                //     sendTelegramMaster(
                                //         `${updatecoin} local differce Trade of`
                                //     );


                                //     let size = (preqt) + (+updatecoin);


                                //     // let size = final_quantity;
                                //     // futureTrade(alldata).then(response => {
                                //     var updateData = { symbol: mgsym };
                                //     // var updateData = { id: ObjectId(order_id) };
                                //     // var newValue = { $set: { amount: lbsize, status: 0, isCredit: 1, orderStatus: "success" ,lbamount:final_lbamount,lbentryPrice:data[i].entryPrice} };
                                //     var newValue = { $set: { amount: size, status: 0, isCredit: 1, orderStatus: "success", lbamount: final_lbamount, lbentryPrice: data[i].entryPrice, lbsize: lbsize } };
                                //     Orders.updateMany(updateData, newValue, function (err, res) {
                                //         Orders_Details.find({ orderId: ObjectId(order_id) }).toArray(function (req, res) {
                                //             console.log("ressssssssssssssssssssssssssssssssssssss " + JSON.stringify(res));
                                //             if (res[0].lbsize != lbsize) {
                                //                 var orderDetails = { orderId: res[0].orderId, symbol: res[0].symbol, closePrice: res[0].closePrice, price: res[0].price, pnl: res[0].pnl, roe: res[0].roe, amount: size, updateTimeStamp: res[0].updateTimeStamp, openDateTime: datetime(res[0].updateTimeStamp), closeDateTime: currentDatetime, status: 0, type: type, isCredit: 1, orderStatus: "success", lbamount: final_lbamount, lbentryPrice: data[i].entryPrice, lbsize: lbsize };
                                //                 Orders_Details.insertOne(orderDetails, function (err, res) {
                                //                 });
                                //             }
                                //         });
                                //     });
                                    // sendTelegramMaster(
                                    //     `${res[0].symbol} DCA Trade of ${type} ${lbsize}`
                                    // );
                                    // sendTelegramMaster(
                                    //     `New order made: ${type} ${size} of ${res[0].symbol} for ${listener_name}`
                                    // );

                                    // console.log("order placed size increase of previous order" + JSON.stringify(response));
                                    // }).catch(err => {
                                    //     var updateData = { symbol: mgsym };
                                    //     var newValue = { $set: { amount: lbsize, status: 0, isCredit: 1, orderStatus: "failed" } };
                                    //     Orders.updateMany(updateData, newValue, function (err, res) {

                                    //         Orders_Details.find({ orderId: ObjectId(order_id) }).toArray(function (req, res) {
                                    //             var orderDetails = { orderId: res[0].orderId, symbol: res[0].symbol, closePrice: res[0].closePrice, price: res[0].price, pnl: res[0].pnl, roe: res[0].roe, amount: size, updateTimeStamp: res[0].updateTimeStamp, openDateTime: datetime(res[0].updateTimeStamp), closeDateTime: currentDatetime, status: 0, type: type, isCredit: 1 };
                                    //             Orders_Details.insertOne(orderDetails, function (err, res) {
                                    //             });
                                    //         });
                                    //     });

                                    //     sendTelegramMaster(
                                    //         `Error on ${type} ${size} of ${res[0].symbol} for ${listener_name}`
                                    //     );
                                    //     console.log("Error in size increase of previous order" + JSON.stringify(err));
                                    // })
                                }

                            } else {
                                // Open order new code rr

                                // setLeverage(lbsymbol, leverage).then(res => {
                                //     console.log("all_data " + JSON.stringify(alldata));
                                //     futureTrade(alldata).then(response => {
                                //if trade succssfully placed then insert in mongo db
                                // if (response.symbol = data[i].symbol) {
                                var orderData = [{ encryptedUid: listener_id, symbol: data[i].symbol, startPrice: data[i].entryPrice, endPrice: data[i].markPrice, pnl: data[i].pnl, roe: data[i].roe, amount: quantity, updateTimeStamp: data[i].updateTimeStamp, openDateTime: datetime(data[i].updateTimeStamp), closeDateTime: currentDatetime, status: status, type: type, profitType: "", PlAmount: "", isCredit: 1, orderStatus: "success", lbsize: data[i].amount }];
                                Orders.insertMany(orderData, function (err, res) {
                                    if (err) throw err;

                                    var id = res.insertedIds[0];
                                    var orderDetails = { orderId: id, symbol: data[i].symbol, closePrice: data[i].entryPrice, price: data[i].markPrice, pnl: data[i].pnl, roe: data[i].roe, amount: quantity, updateTimeStamp: data[i].updateTimeStamp, openDateTime: datetime(data[i].updateTimeStamp), closeDateTime: currentDatetime, status: status, type: type, isCredit: 1, orderStatus: "success", lbsize: data[i].amount };
                                    Orders_Details.insertOne(orderDetails, function (err, res) {
                                        if (err) throw err;

                                        // sendTelegramMaster(
                                        //     `${data[i].symbol} Opened Trade of ${type} ${data[i].amount}`
                                        // );
                                        // sendTelegramMaster(
                                        //     `New order made: ${type} ${quantity} of ${data[i].symbol} for ${listener_name}`
                                        // );
                                    });
                                });

                                // console.log("order placed" + JSON.stringify(response));
                                // }
                                //     }).catch(err => {

                                //         //error in order placed

                                //         var orderData = [{ encryptedUid: listener_id, symbol: data[i].symbol, startPrice: data[i].entryPrice, endPrice: data[i].markPrice, pnl: data[i].pnl, roe: data[i].roe, amount: quantity, updateTimeStamp: data[i].updateTimeStamp, openDateTime: datetime(data[i].updateTimeStamp), closeDateTime: currentDatetime, status: status, type: type, profitType: "", PlAmount: "", isCredit: 1, orderStatus: "failed" }];
                                //         Orders.insertMany(orderData, function (err, res) {
                                //             if (err) throw err;

                                //             var id = res.insertedIds[0];
                                //             var orderDetails = { orderId: id, symbol: data[i].symbol, closePrice: data[i].entryPrice, price: data[i].markPrice, pnl: data[i].pnl, roe: data[i].roe, amount: quantity, updateTimeStamp: data[i].updateTimeStamp, openDateTime: datetime(data[i].updateTimeStamp), closeDateTime: currentDatetime, status: status, type: type, isCredit: 1, orderStatus: "failed" };
                                //             Orders_Details.insertOne(orderDetails, function (err, res) {
                                //                 if (err) throw err;

                                //             });
                                //         });
                                //         sendTelegramMaster(
                                //             `Error on ${type} for ${listener_name} on ${data[i].symbol} for ${quantity}`
                                //         );

                                //         console.log("error while order place" + JSON.stringify(err));
                                //     });

                                // });
                            }

                        });

                    }


                }


                //close order code
                Orders.find({ status: 0 }).toArray(function (req, res) {
                    console.log("order close code *******************");
                    for (let i in res) {
                        let order_symbol = res[i].symbol;
                        let order_id = res[i]._id;

                        let encryptedUid = res[i].encryptedUid;

                        // let lbsymbol = data[i].symbol;

                        if (!lbsymbols.includes(order_symbol) && encryptedUid == listener_id) {
                            // closeTrade(order_symbol).then(response => {

                            //order update if order successfully placed with binance

                            // if (response.symbol == order_symbol) {
                            console.log("sssssssresult symbolsssssss" + order_symbol);
                            // var updateData = { symbol: order_symbol };
                            var updateData = { _id: ObjectId(order_id) };
                            var newValue = { $set: { status: 1, isCredit: 0, orderStatus: "success" } };
                            Orders.updateMany(updateData, newValue, function (err, res) {

                                Orders_Details.find({ $and: [{ orderId: ObjectId(order_id) }, { symbol: order_symbol }] }).toArray(function (req, data) {
                                    var orderDetails = { orderId: data[0].orderId, symbol: data[0].symbol, closePrice: data[0].closePrice, price: data[0].price, pnl: data[0].pnl, roe: data[0].roe, amount: data[0].amount, updateTimeStamp: data[0].updateTimeStamp, openDateTime: datetime(data[0].updateTimeStamp), closeDateTime: currentDatetime, status: 1, type: data[0].type, isCredit: 0, orderStatus: "success" };
                                    Orders_Details.insertOne(orderDetails, function (err, res) {

                                        // sendTelegramMaster(
                                        //     `${data[0].symbol} Closed Trade of ${data[0].type} ${data[0].amount}`
                                        // );
                                        // sendTelegramMaster(
                                        //     `New order made: ${data[0].type} ${data[0].amount} of ${data[0].symbol} for ${listener_name}`
                                        // );
                                    });
                                    // }
                                    // }
                                });

                            });

                            // console.log("close order " + response);
                            // }
                            // }).catch(err => {
                            //     var updateData = { symbol: order_symbol };
                            //     var newValue = { $set: { status: 1, isCredit: 0, orderStatus: "failed" } };
                            //     Orders.updateMany(updateData, newValue, function (err, res) {

                            //         Orders_Details.find({ $and: [{ orderId: ObjectId(order_id) }, { symbol: order_symbol }] }).toArray(function (req, data) {
                            //             var orderDetails = { orderId: data[0].orderId, symbol: data[0].symbol, closePrice: data[0].closePrice, price: data[0].price, pnl: data[0].pnl, roe: data[0].roe, amount: data[0].amount, updateTimeStamp: data[0].updateTimeStamp, openDateTime: datetime(data[0].updateTimeStamp), closeDateTime: currentDatetime, status: 1, type: data[0].type, isCredit: 0, orderStatus: "failed" };
                            //             Orders_Details.insertOne(orderDetails, function (err, res) {
                            //             });
                            //             sendTelegramMaster(
                            //                 `Error on ${data[0].type} for ${listener_name} on ${data[0].symbol} for ${data[0].type}`
                            //             );
                            //         });

                            //     });

                            //     console.log("close order err " + err);
                            // });

                        }
                        else {
                        }
                    }

                });

            }

        });

    });
})();




module.exports = nextConfig


