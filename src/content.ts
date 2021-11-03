// code inspired by https://github.com/brave/brave-site-specific-scripts/blob/master/scripts/brave_rewards/publisher/twitter/tipping.ts;
import ReactDOM from "react-dom";
import Init from "./react/Init";
import {injectButtons}from "./button/button";



async function init() {
  console.log("uv twitter extension running")
  const div = document.createElement("div");
  div.id = "uv-twitter-extension-container";
  document.body.appendChild(div);
  ReactDOM.render(Init, div);
  console.log("uv twitter extension injected");
  injectButtons();
}

init();





