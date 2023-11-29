"use client";
import Image from "next/image";
import dynamic from "next/dynamic";
import Head from 'next/head';
import { SetStateAction, useState, useEffect, MouseEvent } from "react";
const PrevOrders = dynamic(() => import("../components/PrevOrders"), {
  ssr: false,
});
const Alert = dynamic(() => import("../components/Alert"), {
  ssr: false,
});
export default function Home() {
  const [id, setid] = useState("");
  const [name, setname] = useState("");
  const [phone, setPhone] = useState("");
  const [update, setupdate] = useState(0);
  const [alertState, setalertState] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [orderData, setOrderData] = useState([
    {
      sr: "",
      name: "",
      qty: "",
      price: "",
    },
  ]);
  const [paid, setpaid] = useState(false);
  const [total, setTotal] = useState(0);
  const [menu, setmenu] = useState(Array());
  let fetchMenu = async () => {
    let csvToObject = (csvString: string) => {
      const lines = csvString.split("\n");
      const header = lines[0].split(",");
      const objects = [];
      for (let i = 1; i < lines.length; i++) {
        const currentLine = lines[i].split(",");
        const currentObject = Object();
        for (let j = 0; j < header.length; j++) {
          if (j == 2) {
            currentObject["price"] = Number.parseInt(
              currentLine[j]
            );
          } else {
            currentObject[header[j]] = currentLine[j];
          }
        }
        objects.push(currentObject);
      }
      return objects;
    };
    let data = await fetch("/menu.csv");
    let res = await data.text();
    let d = csvToObject(res);
    setmenu(d);
  };
  let calcTotal = () => {
    let t = 0;
    orderData.forEach((val) => {
      t += val.price != "" ? Number.parseInt(val.price) : 0;
    });
    setTotal(t);
  };
  useEffect(() => {
    fetchMenu();
  }, []);

  useEffect(() => {
    calcTotal();
  }, [orderData]);

  let nameChange = (e: { target: { value: SetStateAction<string> } }) => {
    setname(e.target.value);
  };
  let phonechange = (e: { target: { value: SetStateAction<string> } }) => {
    setPhone(e.target.value);
  };
  let changeData = (e: React.ChangeEvent<HTMLInputElement>) => {
    let arr = Array.from(orderData);
    if (e.target.id.split("-")[0] == "qty") {
      arr[Number.parseInt(e.target.id.split("-")[1])].qty = e.target.value;
    }

    if (e.target.id.split("-")[0] == "sr") {
      arr[Number.parseInt(e.target.id.split("-")[1])].sr = e.target.value;
    }
    setOrderData(arr);
  };
  let paidChange = () => {
    if (paid) {
      setpaid(false);
    } else {
      setpaid(true);
    }
  };
  let addentry = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    let arr = Array.from(orderData);
    arr.push({
      sr: "",
      name: "",
      qty: "",
      price: "",
    });
    setOrderData(arr);
  };
  let insertData = (e: React.FocusEvent<HTMLInputElement>) => {
    try {
      let srval = e.target.value;
      let row = Number.parseInt(e.target.id.split("-")[1]);
      if (srval == "") {
        let arr = Array.from(orderData);
        arr[row].name = "";
        arr[row].price = "";
        arr[row].qty = "";
        setOrderData(arr);
      } else {
        let ind = -1;
        menu.forEach((val, i) => {
          if (val.sr == srval) {
            ind = i;
          }
        });
        if (ind != -1) {
          let arr = Array.from(orderData);
          arr[row].name = menu[ind].name;
          arr[row].price = menu[ind].price;
          arr[row].qty = "1";

          setOrderData(arr);
        }
        if (ind == -1) {
          setalertState("Unable to Find order!");
          setTimeout(() => {
            setalertState("");
          }, 4000);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };
  let isEnter = (e: React.KeyboardEvent<HTMLElement>) => {
    let arr = Array.from(orderData);
    if (e.key == "Enter") {
      if (
        orderData.length ==
        Number.parseInt((e.target as HTMLInputElement).id.split("-")[1]) + 1
      ) {
        arr.push({
          sr: "",
          name: "",
          qty: "",
          price: "",
        });
        setOrderData(arr);
      }
      setTimeout(() => {
        let ele = document.getElementById(
          (e.target as HTMLInputElement).id.split("-")[0] +
            "-" +
            (Number.parseInt((e.target as HTMLInputElement).id.split("-")[1]) +
              1)
        );
        ele?.focus();
      }, 150);
    }
  };
  let preventsubmit = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key == "Enter") {
      e.preventDefault();
    }
  };
  let calcQty = (e: React.MouseEvent<HTMLElement>) => {
    let row = Number.parseInt((e.target as HTMLInputElement).id.split("-")[1]);
    let operation = (e.target as HTMLInputElement).id.split("-")[0];
    let arr = Array.from(orderData);
    let ind = -1;
    menu.forEach((val, i) => {
      if (val.sr == orderData[row].sr) {
        ind = i;
      }
    });
    if (operation == "+") {
      arr[row].qty = `${Number.parseInt(arr[row].qty) + 1}`;
      arr[row].price = String(
        Number.parseInt(arr[row].qty) * Number.parseInt(menu[ind].price)
      );
    } else {
      arr[row].qty = `${Number.parseInt(arr[row].qty) - 1}`;
      arr[row].price = String(
        Number.parseInt(arr[row].qty) * Number.parseInt(menu[ind].price)
      );
    }
    setOrderData(arr);
  };
  let saveOrder = async (e: React.MouseEvent<HTMLElement>) => {
    let arr = Array.from(orderData);
    for (let index = 0; index < arr.length; index++) {
      const element = arr[index];
      if (element.sr == "") {
        arr.splice(index, 1);
      }
    }
    e.preventDefault();
    let obj = {
      name,
      orderData: arr,
      paid,
      phone: Number.parseInt(phone),
      total,
    };
    try {
      if (id == "") {
        let res = await fetch("https://foodcourtbackend.adaptable.app/save", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(obj),
        });
        let done = await res.json();
        if (done) {
          setalertState("Saved Sucessfully!");
          setTimeout(() => {
            setalertState("");
          }, 4000);
        }
        newOrder();
        setupdate(update + 1);
      } else {
        let res = await fetch(
          `https://foodcourtbackend.adaptable.app/edit/${id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(obj),
          }
        );
        let done = await res.json();
        if (done) {
          setalertState("Updated Sucessfully!");
          setTimeout(() => {
            setalertState("");
          }, 4000);
        }
        newOrder();
        setupdate(update + 1);
      }
    } catch (err) {
      console.log(err);
    }
  };
  let newOrder = () => {
    setid("");
    setname("");
    setPhone("");
    setOrderData([
      {
        sr: "",
        name: "",
        qty: "",
        price: "",
      },
    ]);
    setpaid(false);
  };
  const updated = async (e: React.MouseEvent<HTMLElement>) => {
    try {
      let id = (e.target as HTMLInputElement).id;

      let d = await fetch(
        `https://foodcourtbackend.adaptable.app/fetchone/${id}`
      );
      let data = await d.json();
      setid(data._id);
      setname(data.name);
      setPhone(data.phone);
      setOrderData(data.orderData);
      setTotal(data.total);
    } catch (err) {
      console.log(err);
    }
  };
  let checkDetail = (e:React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    checkDetails()
  };
  let checkDetails = () => {
    let pass = process.env.NEXT_PUBLIC_LOGIN;
    if (pass) {
      let obj = JSON.parse(pass);
      if (obj[username] == password) {
        let ele = document.getElementById('loginDetails')
        if(ele){
          ele.style.display = 'none'
        }
      }else{
        let ele = document.getElementById('incorrectDetails')
        if(ele){
          ele.style.visibility = "visible";
        }
      }
    }
  };
  let handleUserChange = (e: { target: { value: SetStateAction<string> } }) => {
    setUsername(e.target.value);
  };
  let handlePassChange = (e: { target: { value: SetStateAction<string> } }) => {
    setPassword(e.target.value);
  };
  let SubmitDetails = (e: React.KeyboardEvent<HTMLElement>) => {
    if(e.key=='Enter'){

      e.preventDefault();
    checkDetails();
    }
  };
  return (
    <>
     <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </Head>
    <main className="flex justify-center sm:justify-normal">
      <div className="absolute sm:hidden top-6 left-3 cursor-pointer transition-transform duration-200 -rotate-180" id="hamburger" onClick={()=>{
        let ele = document.getElementById('sidebar')
        if(ele){
          if (ele.classList.contains('-translate-x-full')){
            ele.classList.remove('-translate-x-full')
          }else{
            ele.classList.add('-translate-x-full')
          }
        }
        let e = document.getElementById('hamburger')
        if(e){
          if (e.classList.contains('-rotate-180')){
            e.classList.remove('-rotate-180')
          }else{
            e.classList.add('-rotate-180')
          }
        }
      }}>
        <div className="w-8 bg-black h-1 my-1 rounded-md"></div>
        <div className="w-8 bg-black h-1 my-1 rounded-md"></div>
        <div className="w-8 bg-black h-1 my-1 rounded-md"></div>
      </div>
      <div className="sm:w-4/5 md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl sm:right-5 absolute mx-1">
        <h1 className="text-3xl text-gray-950 text-center font-semibold my-6 sm:my-16">
          Eat and Meet
        </h1>
        <form onKeyDown={preventsubmit}>
          <div className="my-2">
            <label htmlFor="name">Name: </label>
            <input
              value={name}
              onChange={nameChange}
              type="text"
              name="named"
              autoComplete="off"
              id="name"
              className="mx-2 py-1 px-2 focus:outline-none hover:outline-blue-500 hover:outline hover:outline-1 rounded-md focus:shadow-[0_0_5px_0px_#48abe0;]"
            />
          </div>
          <div className="my-2">
            <label htmlFor="phone">Phone: </label>
            <input
              value={phone}
              onChange={phonechange}
              type="number"
              autoComplete="off"
              name="phone"
              id="phone"
              className="mx-2 py-1 px-2 focus:outline-none hover:outline-blue-500 hover:outline hover:outline-1 rounded-md  focus:shadow-[0_0_5px_0px_#48abe0;]"
            />
          </div>
          <table
            id="example"
            className="stripe hover w-full bg-white p-10 rounded-xl border-collapse border border-slate-400 overflow-x-auto"
            border={1}
          >
            <caption className="font-bold text-2xl ">Order Information</caption>
            <thead>
              <tr>
                <th
                  className="sm:w-2/12 w-12 p-1 border border-slate-300"
                >
                  <span className="sm:hidden">Sr.</span>
  <span className="hidden sm:inline">Serial Number</span>
                </th>
                <th
                  className="sm:w-5/12 p-1 border border-slate-300"
                >
                  Name
                </th>
                <th
                  className="sm:w-2/12 w-20 p-1 border border-slate-300"
                >
                  Quantity
                </th>
                <th
                  className="sm:w-3/12 w-12 p-1 border border-slate-300"
                >
                  Price
                </th>
              </tr>
            </thead>
            <tbody>
              {orderData.map((obj, ind) => {
                return (
                  <tr key={ind}>
                    <td className=" border border-slate-300">
                      <input
                        className="w-12 py-1 px-2 focus:outline-none hover:outline-blue-500 hover:outline hover:outline-1 focus:shadow-[0_0_5px_0px_#48abe0;]"
                        type="number"
                        name="sr"
                        id={`sr-${ind}`}
                        value={obj.sr}
                        onChange={changeData}
                        onKeyDown={isEnter}
                        onBlur={insertData}
                      />
                    </td>
                    <td className=" border border-slate-300">{obj.name}</td>
                    <td className="flex justify-center items-center border border-slate-300">
                      <Image
                        src="/minusicon.png"
                        width={20}
                        height={20}
                        className="h-4 sm:h-5 cursor-pointer"
                        alt=""
                        id={`m-${ind}`}
                        onClick={calcQty}
                      />
                      <input
                        type="number"
                        name="qty"
                        id={`qty-${ind}`}
                        onKeyDown={isEnter}
                        className="w-10 py-1 px-2 focus:outline-none hover:outline-blue-500 hover:outline hover:outline-1 rounded-md  focus:shadow-[0_0_5px_0px_#48abe0;] text-center"
                        value={obj.qty}
                        onChange={changeData}
                      />
                      <Image
                        src="/addicon.png"
                        width={20}
                        height={20}
                        className="h-4 sm:h-5 cursor-pointer"
                        alt=""
                        id={`+-${ind}`}
                        onClick={calcQty}
                      />
                    </td>
                    <td className="border border-slate-300">{obj.price}</td>
                  </tr>
                );
              })}
              <tr>
                <td
                  colSpan={3}
                  className="border-t-2 border-black text-right text-xl font-semibold"
                >
                  Total:
                </td>
                <td
                  colSpan={1}
                  className="border-t-2 border-black text-xl font-semibold"
                >
                  {total}
                </td>
              </tr>
            </tbody>
          </table>
          <div className="flex justify-between py-5">
            <div className="flex content-centre">
              <div
                className="mx-1 font-semibold text-lg cursor-pointer"
                onClick={paidChange}
              >
                Paid:{" "}
              </div>

              <div
                id="paidCheck"
                className={`w-6 h-6 rounded-[50%] ${
                  paid
                    ? "bg-green-500 border border-solid border-black"
                    : "bg-white"
                } hover:outline-blue-500 hover:outline hover:outline-1 cursor-pointer`}
                onClick={paidChange}
              />
            </div>
            <button
              onClick={addentry}
              className="py-1 px-3 bg-blue-500 font-semibold rounded-md mx-5 transition-transform active:scale-75 cursor-pointer text-white hover:bg-blue-700"
            >
              New Entry
            </button>
            <button
              className="py-1 px-3 bg-green-500 hover:bg-green-700 transition-transform active:scale-75 text-white font-semibold rounded-md mx-5  cursor-pointer"
              onClick={saveOrder}
            >
              Save
            </button>
          </div>
        </form>
        <Alert message={alertState} />
      </div>
      <div className="sm:w-1/6 w-52 top-16 transition-transform duration-200 sm:top-0 absolute left-0 min-h-full bg-white -translate-x-full sm:translate-x-0" id="sidebar">
        <PrevOrders
          updatecheck={update}
          update={updated}
          neworder={newOrder}
          setAlertState={setalertState}
        />
      </div>
      <form
        className="flex backdrop-blur-md w-full h-full absolute left-0 top-0 justify-center items-center"
        onKeyDown={SubmitDetails}
        id="loginDetails"
      >
        <div className="w-[390px] bg-white flex p-4 content-center items-center rounded-md flex-col">
          <h1 className="text-2xl font-semibold my-3">
            Eat and Meet - FoodCourt
          </h1>
          <p className="text-sm my-3">
            Welcome to Eat and Meet FoodCourt. This page is meant for only staff
            use. Please enter Username and Password to continue.
          </p>

          <div>
            <label htmlFor="username">Username</label>
            <input
              className="py-1 w-11/12 px-2 focus:outline-none outline-blue-500 outline outline-1 focus:shadow-[0_0_5px_0px_#48abe0;] mb-5 rounded-sm"
              id="username"
              type="text"
              autoComplete="off"
              value={username}
              onChange={handleUserChange}
            />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input
              className="py-1 w-11/12 px-2 focus:outline-none outline-blue-500 outline outline-1 focus:shadow-[0_0_5px_0px_#48abe0;] mb-5 rounded-sm"
              id="password"
              type="password"
              autoComplete="off"
              value={password}
              onChange={handlePassChange}
            />
          </div>
          <button
            type="submit"
            className="w-11/12 bg-blue-500 hover:bg-blue-700 transition-transform active:scale-75 flex justify-center items-center h-10 text-xl text-white mx-auto my-2 rounded-lg"
            onClick={checkDetail}
          >
            Log In
          </button>
          <div id="incorrectDetails" className="text-left text-red-500 w-11/12 invisible">
            Username or password is incorrect.
          </div>
        </div>
      </form>
    </main>
    </>
  );
}
