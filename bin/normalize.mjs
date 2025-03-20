#!/usr/bin/env node

import axios from "axios"
import fs from 'fs'
import path from 'path'

export const normalize = async (url, fun = JSON.parse) => {
  let nurl, pth, output;
  if (url.indexOf("http") === 0) {
    nurl = url;
  } else if (url.indexOf("@") === 0) {
    const cmp = url.substring(1).split("/");
    cmp.splice(1, 0, "main");
    console.log();
    nurl = `https://raw.githubusercontent.com/t-i-f/` + cmp.join("/");
  } else {
    pth = url
  }

  if (nurl) {
    try {
      const response = await axios.get(nurl, {responseType: fun ? "json" : "text"});
      return response.data; // JSON data as JS object
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  } else {
    try {
      output = fs.readFileSync(path.resolve(pth), {encoding: "utf-8"});
    } catch (err) {
      output = "{}";
    }
    return  fun ? fun(output) : output;
  }
}