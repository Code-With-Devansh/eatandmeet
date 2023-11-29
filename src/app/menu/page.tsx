"use client";

import { useEffect, useState } from "react";
import Fuse from "fuse.js";

export default function Page() {
  const [Search, setSearch] = useState("");
  const [Data, setData] = useState(Array());
  const [TotalData, setTotalData] = useState(Array());
  useEffect(() => {
    getData();
  }, []);
  const getData = async () => {
    // Fetch data from external API
    let csvToObject = (csvString: string) => {
      const lines = csvString.split("\n");
      const header = lines[0].split(",");
      const objects = [];
      for (let i = 1; i < lines.length; i++) {
        const currentLine = lines[i].split(",");
        const currentObject = Object();
        for (let j = 0; j < header.length; j++) {
          if (j == 2) {
            currentObject["price"] = Number.parseInt(currentLine[j]);
          } else {
            currentObject[header[j]] = currentLine[j];
          }
        }
        objects.push(currentObject);
      }
      return objects;
    };
    let d = await fetch("https://eatandmeet.vercel.app/menu.csv");
    let res = await d.text();
    let data = csvToObject(res);

    // Pass data to the page via props
    setData(data);
    setTotalData(data);
  };
  const fuseOptions: any = {
    keys: ["name"],
    includeScore: true,
    threshold: 0.4,
    tokenize: "full",
    matchAllTokens: true,
  };

  const fuse = new Fuse(TotalData, fuseOptions);
  let updateData = (empty: Boolean) => {
    if (!empty) {
      let results = fuse.search(Search);
      let a = results.map((result) => result.item);
      setData(a);
    } else {
      setData(TotalData);
    }
  };
  let calcPlace = () :string =>{
    let arr = TotalData.map((val)=>val.name)
    return arr[Math.floor(Math.random() * arr.length-1)];
    

  }
  let d = Array.from(Data);
  return (
    <div className="w-3/5 mx-auto">
      <h1 className="text-center text-3xl font-semibold my-3">
        Menu - Eat and Meet FoodCourt
      </h1>
      <div
        className="flex hover:outline-blue-500 hover:outline hover:outline-1  rounded-md items-center bg-white p-3 gap-3 my-4 cursor-text"
        onClick={(e: React.MouseEvent<HTMLDivElement>) => {
          let ele = document.getElementById("searchBox");
          if (ele) {
            ele.focus();
          }
        }}
      >
        <svg
          className="w-5 h-5 text-gray-500 dark:text-gray-400"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 20 20"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
          />
        </svg>
        <input
          placeholder={calcPlace()}
          id="searchBox"
          type="text"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setSearch(e.target.value);
            e.target.value == "" ? updateData(true) : updateData(false);
          }}
          value={Search}
          className="w-full focus:outline-none"
          onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
            let ele = e.target;
            if (ele) {
              ele.parentElement!.style.boxShadow = "0 0 5px 0px #48abe0";
            }
          }}
          onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
            let ele = e.target;
            if (ele) {
              ele.parentElement!.style.boxShadow = "";
            }
          }}
        />
      </div>
      <table className="border-collapse border border-slate-400 w-full">
        <thead>
          <tr>
            <th className="border border-slate-300 bg-white w-1/6">
              Serial Number
            </th>
            <th className="border border-slate-300 bg-white w-4/6">Name</th>
            <th className="border border-slate-300 bg-white w-1/6">Price</th>
          </tr>
        </thead>
        <tbody>
          {d.map((val) => (
            <tr key={val.sr}>
              <td className="border border-slate-300 bg-white">{val.sr}</td>
              <td className="border border-slate-300 bg-white">{val.name}</td>
              <td className="border border-slate-300 bg-white">{val.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
