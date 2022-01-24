import { injectButtons } from './button/button';
import { urbitVisor } from '@dcspark/uv-core';

let ok = false;
let keySub;
let metaSub;
let ship = '';
interface Key {
  name: string;
  entity: string;
}
let keys: Key[] = [];
let metadata;
interface UrbitChannel {
  title: string;
  type: 'post' | 'chat' | 'link' | 'publish' | null;
  group: string;
  ship: string;
  name: string;
}

function referenceMetadata(channel: any, metadata: any): UrbitChannel {
  const url: string | undefined = Object.keys(metadata).find(el =>
    el.includes(`${channel.ship}/${channel.name}`)
  );
  if (url) {
    const title = metadata[url].metadata.title;
    const type = metadata[url].metadata.config.graph;
    const group = metadata[url].group;
    const groupMetadata = metadata[`${group}/groups${group}`];
    const groupTitle = groupMetadata?.metadata?.title;
    return {
      title: title,
      type: type,
      group: groupTitle || channel.name,
      ship: channel.ship,
      name: channel.name,
    };
  } else
    return {
      title: '',
      group: '',
      type: null,
      ship: channel.ship,
      name: channel.name,
    };
}

function init() {
  urbitVisor
    .registerName('Twitter UV')
    .then(res => console.log(res, 'Twitter extension registered with Urbit Visor'));
  urbitVisor.require(['shipName', 'scry', 'subscribe', 'poke'], setData);
}

window.addEventListener("beforeunload", function (e) {
  urbitVisor.unsubscribe(keySub);
  urbitVisor.unsubscribe(metaSub);
});

async function sendToBackground(message) {
  return new Promise((res, rej) => chrome.runtime.sendMessage(message, response => res(response)));
}
function listenerFromTabToContent() {
  window.addEventListener('message', async function (e) {
    const request = e.data;
    request.origin = e.origin;
    console.log(request, "content script listening to")
    switch (request.action){
      case "check_perms": 
      window.postMessage({id: request.id+ "-res", perms_granted: ok}, window.origin)
        break;
      case "fetch_keys":
      const list = keys.map((channel: any) =>
        referenceMetadata(channel, metadata)
      );
      window.postMessage({id: request.id+ "-res", channels: list}, window.origin)
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
    .then(res => keySub = res.response);
    urbitVisor.on('sse',['metadata-update', 'associations'],updateMetadata);
  urbitVisor.subscribe({ app: 'metadata-store', path: '/all' })
  .then(res => metaSub = res.response);
}
function updateKeys(keyUpdate: Key[]) {
  keys = keyUpdate;
  console.log(keys, 'keys updated'); // lol this gives you the whole keys again, not incremental
  // and it's {name: "channel", ship: "zod" } // no tilde!
};
function updateMetadata(metadataUpdate: any){
  console.log(metadataUpdate, "metadata-update")
  metadata = metadataUpdate;
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
