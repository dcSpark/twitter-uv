// code inspired by https://github.com/brave/brave-site-specific-scripts/blob/master/scripts/brave_rewards/publisher/twitter/tipping.ts;
import ReactDOM from "react-dom";
import Init from "./react/Init";
import {injectButtons}from "./button/button";
import { urbitVisor } from "@dcspark/uv-core";



async function init() {
  console.log("uv twitter extension running")
  urbitVisor.registerName("Twitter Ext").then(res => console.log("Twitter extension registered with Urbit Visor"))
  const div = document.createElement("div");
  div.id = "uv-twitter-extension-container";
  document.body.appendChild(div);
  console.log("uv twitter extension injected");
  injectButtons();
}

init();





