

import Binance2 from "binance-api-node";
export default async function handler(req, res) {

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
let client =   Binance2({
        apiKey: apikey,
        apiSecret: apisecret,
        useServerTime: true,
      });

    //   let positionRisk = await binance.futuresPositionRisk();
    const positionRisk = await client.futuresPositionRisk();

      let positions = [];
      for(let i in positionRisk){
          let data = positionRisk[i];
          if(data.positionAmt>0 || data.positionAmt<0){
              positions.push(data);
          }
        }

    res.status(200).json(positions);
  }
  