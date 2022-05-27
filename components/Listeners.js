import { useEffect, useState } from "react";
import clearForm from "../helpers/clearForm";

export default function Listeners(props) {
  let [add_listeners, setListeners] = useState();
  let [edit_listeners, setEditListeners] = useState();
  let [delete_listener_table, setDeleteListenerTable] = useState();

  // Run on window load
  useEffect(() => {
    (async () => {
      // let slaves = await fetch("/api/mongo/slaves");
      // slaves = await slaves.json();

      let listeners = await fetch("/api/mongo/get_listeners");
      listeners = await listeners.json();
      
      let listener = [];
      // for (let i in listeners.data) {
          listeners = listeners;
        listener.push({ encryptedUid: listeners.encryptedUid, active: listeners.isPrimary});
      // }

      // Populate Delete Slave Table Start
      let arr = [];

      for (let j in listeners.data) {
        let list = listeners.data[j];
     
        async function deleteListener(e) {
          e.preventDefault();
             await fetch("/api/mongo/delete-listener", {
            method: "POST",
            body: JSON.stringify({
                encryptedUid: e.target.parentElement.id,
            }),
          });
        //   window.location.reload();
        }

        let active = [];

        // if (list.isPrimary) {
          active.push(
            <input
            checked={list.isPrimary}
              type="radio"
              value={list.encryptedUid}
              name="status"
              onChange={(e) => {
                console.log(e.target.parentElement.id);
                let status = e.target.checked;

                fetch("/api/mongo/change-listener-status", {
                  method: "POST",
                  body: JSON.stringify({
                    encryptedUid: e.target.parentElement.id,
                    isPrimary: status,
                  }),
                });
              }}
            />
          );
        // } else {
        //   active.push(
        //     <input
        //       type="radio"
        //       onChange={(e) => {
        //         console.log(e.target.parentElement.id);
        //         let status = e.target.checked;

        //         fetch("/api/mongo/change-listener-status", {
        //           method: "POST",
        //           body: JSON.stringify({
        //             encryptUID: e.target.parentElement.id,
        //             isPrimary: status,
        //           }),
        //         });
        //       }}
        //     />
        //   );
        // }
        // console.log(slave);
        arr.push(
          <tr
            // key={slave.name + "_edit_delete"}
            className="w3-animate-bottom"
            key={list.encryptedUid}
          >
            <td>{list.encryptedUid}</td>
            <td id={list.encryptedUid}>
              <input type="button" class="btn btn-danger btn-sm" value="X" onClick={deleteListener} />
            </td>
            <td id={list.encryptedUid}>{active}</td>
          </tr>
        );
      }
      setDeleteListenerTable(arr);

      // End

      // Populate Edit Slaves Start
      let arr2 = [];

      for (let i in listeners.data) {
          console.log("msdfjdsf");
          console.log(listeners.data[i]);
        let listener = listeners.data[i];
        // console.log(slave);
        async function submitEditListenerForm(e) {}
        arr2.push(
          <form
            key={listener.encryptedUid + "_id"}
            id={`${listener.encryptedUid}_edit_listener_form`}
            className="text-center border text-animate-bottom mt-5"
          >
            <h1>Edit {listener.encryptUID}</h1>
            <label htmlFor="uid">Encrypet UID</label>
            <br />
            <input
              readOnly={true}
              id={listener.encryptedUid + "_UID"}
              name="encryptedUid"
              className="test-center form-control border "
              type="text"
              style={{
                width: "50%",
                textAlign: "center",
                display: "inline-block",
              }}
            />
            <br />

            <input
              name={listener.encryptedUid}
              className="form-control  btn btn-primary btn-sm mt-3 mb-2"
              type="submit"
              style={{
                width: "20%",
                textAlign: "center",
                display: "inline-block",
              }}
              onClick={async (e) => {
                e.preventDefault();

                // console.log(e.target.name);
                listener.encryptedUid = e.target.encryptedUid;
                // return;
                let elements = document.getElementById(
                  `${listener.encryptedUid}_edit_listener_form`
                ).elements;
                elements = Array.from(elements);

                let obj = {};

                // remove submit from array
                elements.pop();
                for (let i in elements) {
                    console.log("elements");
                    console.log(elements);
                  let value = elements[i].value;
                  let id = elements[i].id;

                  // l;
                  let substring = listener.encryptedUid  + "_";
                  id = id.substring(substring.length);

                  obj[id] = value;
                }

                // console.log(obj);
                let req = await fetch("/api/mongo/add-listener", {
                  method: "POST",
                  body: JSON.stringify(obj),
                });

                clearForm(elements);
                // window.location.reload();
              }}
            />
          </form>
        );
      }

      // console.log(arr2);
      setEditListeners(arr2);

      // End

      // populate forms
      // let slave_names = await fetch("/api/mongo/slaves");
      // slave_names = await slave_names.json();
      // console.log(slave_names);

      for (let i in listeners.data) {
        // i == NAME
        let listener = listeners.data[i];
        document.getElementById(`${listener.encryptedUid}_UID`).value = listener.encryptedUid ;
      }
      
    })();
  }, []);

  // Helpers
  async function submitNewListenerForm(e) {
    e.preventDefault();

    let elements =  document.querySelector('#encryptedUid').value;
    // let elements = document.getElementById("new-listener-form").elements;
    console.log("elements");
    console.log(elements);

    // elements = Array.from(elements);

    // let obj = {};

    // remove submit from array
    // elements.pop();
    // for (let i in elements) {

    //   let value = elements[i].value;
    //   let id = elements[i].id;

    //   obj[id] = value;
    // }
    let req = await fetch("/api/mongo/add-listener", {
      method: "POST",
      body: elements,
    });

    clearForm(elements);
    // window.location.reload();
  }

  return (
    <div className="container">
      <h1>Listener Manager</h1>

      <form
        id="new-listener-form"
        className="text-center w3-border w3-animate-bottom"
      >
        <h1>New Listener</h1>
      
        <label htmlFor="listener_key">Encrypet UID</label>
        <br />
        <input
          required={true}
          id="encryptedUid"
          name="encryptedUid"
          className="form-control w-50"
          type="text"
          style={{  display: "inline-block" }}
        />
        <br />

        <input
          className="btn btn-primary btn-sm mt-3"
          type="submit"
          style={{ width: "10%", display: "inline-block" }}
          onClick={submitNewListenerForm}
        />
      </form>

      <h1 className="w3-center">Delete Listener </h1>

      <table
        className="table table-borderd"
        id="delete_listener_table"
      >
        <thead>
          <tr>
            <th>Encrypted UID</th>
            <th>Delete</th>
            <th>Primary Account</th>
          </tr>
        </thead>
        <tbody>{delete_listener_table}</tbody>
      </table>

      <div id="edit_listeners">{edit_listeners}</div>
      <br />
    </div>
  );
}
