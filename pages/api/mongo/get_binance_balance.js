

import Binance from "node-binance-api";
import Binance2 from "binance-api-node";

export default async function handler(req, res) {
    let apis = await fetch("http://localhost:3000/api/mongo/get-binance-api");
    // let apis = await fetch("http://139.99.74.143:3000/api/mongo/get-binance-api");
    apis = await apis.json();
    let apikey = apis.apikey;
    let apisecret = apis.apisecret;

    // const client = new Binance().options({
    //       APIKEY: apikey,
    //       APISECRET: apisecret,
    //       useServerTime: true,
    //   });
    const binance = Binance2({
        apiKey:apikey,
        apiSecret:apisecret,
        useServerTime:true,
    });

    let acc = await binance.futuresAccountBalance();
    //   let acc = await client.futuresBalance();

      let balance ;
    for(let i in acc){
        let coin  = acc[i].asset;
        if(coin == "USDT"){
            balance = acc[i].availableBalance;
        }
    }
    res.status(200).json(balance);
  }
  