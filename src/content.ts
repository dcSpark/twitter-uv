import { injectButtons } from './button/button';
import { urbitVisor } from '@dcspark/uv-core';

let ok = false;
let ship = '';
interface Key {
  name: string;
  entity: string;
}
let keys: Key[] = [];
function init() {
  urbitVisor
    .registerName('Twitter UV')
    .then(res => console.log(res, 'Twitter extension registered with Urbit Visor'));
  urbitVisor.require(['shipName', 'scry', 'subscribe', 'poke'], setData);
}

async function sendToBackground(message) {
  return new Promise((res, rej) => chrome.runtime.sendMessage(message, response => res(response)));
}
function listenerFromTabToContent() {
  window.addEventListener('message', async function (e) {
    const request = e.data;
    request.origin = e.origin;
    switch (request.action){
      case "check_perms": 
      window.postMessage({id: request.id+ "-res", perms_granted: ok}, window.origin)
        break;
      case "fetch_keys": 
      window.postMessage({keys: keys}, window.origin)
      break;
    }
    return;
  });
}

function setData() {
  ok = true;
  console.log('setting data');
  urbitVisor.getShip().then(res => {
    ship = res.response;
    console.log('sending ship to background');
    sendToBackground({ ship: ship });
  });
  urbitVisor.on('sse', ['graph-update', 'keys'], updateKeys);
  urbitVisor
    .subscribe({ app: 'graph-store', path: '/keys' })
    .then(res => console.log(res, 'subscribed to keys'));
}
function updateKeys(keyUpdate: Key[]) {
  keys = keyUpdate;
  console.log(keys, 'keys updated'); // lol this gives you the whole keys again, not incremental
  // and it's {name: "channel", ship: "zod" } // no tilde!
}

async function inject() {
  console.log('uv twitter extension running');
  const div = document.createElement('div');
  div.id = 'uv-twitter-extension-container';
  document.body.appendChild(div);
  console.log('uv twitter extension injected');
  injectButtons();
}
init();
inject();
listenerFromTabToContent();
