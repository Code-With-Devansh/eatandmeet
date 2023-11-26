"use client";
import React, { useEffect, useState } from "react";

const PrevOrders = (props) => {
  const [data, setdata] = useState(Array());
  let getdata = async () => {
    try{
      let d = await fetch("https://foodcourtbackend.adaptable.app/prevorders");
      let res = await d.json();
      let arr = []
      for (let index = 0; index < res.length; index++) {
        const element = res[index];
        if(element.paid == false){
          arr.push(element)
        }
      }
      for (let index = 0; index < res.length; index++) {
        const element = res[index];
        if(element.paid == true){
          arr.push(element)
        }
      }
      setdata(arr);
    }catch (err){
      alert('some Error occured')
      console.log(err)
    }
    };
  useEffect(() => {
    getdata();
  }, [props.updatecheck]);

  useEffect(() => {
    getdata();
  }, []);
  let orderDelete = async(e)=>{
    console.log(e)
    try{

      let id = e.target.id;
      console.log(id)
      let res = await fetch(`https://foodcourtbackend.adaptable.app/delete/${id}`,{
        method:'DELETE'
      })
    let done = await res.json()
    if(done){
      props.setAlertState("Deleted Sucessfully!")
      setTimeout(() => {
        props.setAlertState('')
      }, 4000);
    }
    getdata()
  }catch(err){
    alert("Some Error Occured")
    console.log(err)
  }
  }
  console.log(props);
  return (
    <>
    <button className="w-11/12 bg-blue-500 hover:bg-blue-700 transition-transform active:scale-75 flex justify-center items-center h-10 text-xl text-white mx-auto my-2 rounded-lg" onClick={props.neworder}>New Order</button>
      {data.map((order) => (
        <div
          className="flex items-center flex-col"
          key={order._id}
        >
          <div className="w-11/12 m-2 border-2 border-gray-300 rounded-lg p-2">
            <div className="flex justify-end">
              <div
              id={order._id}
              onClick={orderDelete}
                className="rounded-[50%] hover:bg-red-600 text-center p-2 flex justify-center cursor-pointer"
                onMouseEnter={(e) => {
                  if(e.target.children[0]){
                    e.target.children[0].classList.add("invert");
                  }
                }}
                onMouseLeave={(e) => {
                  if(e.target.children[0]){
                    e.target.children[0].classList.remove("invert");
                  }
                }}
              >
                <img src="/delete.png" id={order._id} alt="" width={20} />
              </div>
            </div>
            <div
              className="font-semibold hover:underline cursor-pointer"
              id={order._id}
              onClick={props.update}
            >
              Name: {order.name}
            </div>
            <div className="flex justify-between">
              <div className="font-semibold">Total: {order.total}</div>
              <div className="flex gap-1 font-semibold">
                <div>Paid:</div>
                <div
                  className={`w-5 h-5 rounded-[50%]  outline-black outline ${
                    order.paid ? "bg-green-500" : ""
                  } outline-1 `}
                ></div>{" "}
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default PrevOrders;
