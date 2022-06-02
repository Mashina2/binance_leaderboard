import { useEffect, useState } from "react";
import clearForm from "../helpers/clearForm";



export default function BinaceApi(props) {
  let [balance, setbalance] = useState();
  let [getkey, setkey] = useState();
  let [getsecret, setsecret] = useState();
  let [getleverage, setleverage] = useState();
  // Run on window load
  useEffect(() => {
    (async () => {

      let bal = await fetch("/api/mongo/get_binance_balance");
      bal = await bal.json();

      setbalance(bal);

      let req = await fetch("/api/mongo/get-binance-api");
      req = await req.json();
      if (req != null) {
        let api_key = req.apikey;
        let api_secret = req.apisecret;
        let leverage = req.leverage;
        
        setleverage(leverage);
        setkey(api_key);
        setsecret(api_secret);

        // document.getElementById("apikey").value = api_key;
        // document.getElementById("apisecret").value = api_secret;
        // document.getElementById("leverage").value = leverage;
      }
    })();
  }, []);

  // Helpers
  async function submitForm(e) {
    e.preventDefault();

    // let elements =  document.querySelector('#binanceApi').value;
    let elements = document.getElementById("binanceApi").elements;

    elements = Array.from(elements);

    let obj = {};

    // remove submit from array
    elements.pop();
    for (let i in elements) {

      let value = elements[i].value;
      let id = elements[i].id;

      obj[id] = value;
    }
    // console.log("elements value");
    // console.log(obj);
    let req = await fetch("/api/mongo/add-binance-api", {
      method: "POST",
      body: JSON.stringify(obj),
    });

    clearForm(elements);
    window.location.reload();
  }

  return (
    <div className="container">
      <h1>Binance Manager</h1>

      <h5 className="text-right"> USDT Balance <span >{balance}</span></h5>
      <form
        id="binanceApi"
        className="text-center w3-border w3-animate-bottom"
      >
        <h1>Binance API</h1>

        <label htmlFor="api_key">API Key</label>
        <br />
        <input
          required={true}
          id="apikey"
          name="apikey"
          className="form-control w-50 mb-2"
          type="text"
          style={{ display: "inline-block" }}
          value={getkey}
        />
        <br />
        <label htmlFor="api_key">API Secret</label>
        <br />
        <input
          required={true}
          id="apisecret"
          name="apisecret"
          className="form-control w-50"
          type="text"
          style={{ display: "inline-block" }}
          value={getsecret}
        />
        <br />
        <label htmlFor="api_key">Leverage</label>
        <br />
        <input
          required={true}
          id="leverage"
          name="leverage"
          className="form-control w-50"
          type="text"
          style={{ display: "inline-block" }}
          value={getleverage}
        />
        <br />
        <input
          className="btn btn-primary btn-sm mt-3"
          type="submit"
          style={{ width: "10%", display: "inline-block" }}
          onClick={submitForm}
        />
      </form>
    </div>
  );
}
