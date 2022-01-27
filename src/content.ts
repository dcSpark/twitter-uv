import { injectButtons, injectUnrollButton } from './button/button';
import { urbitVisor } from '@dcspark/uv-core';
import React from 'react';
import ReactDOM from 'react-dom';
import App2 from './react/App2';

let ok = false;
let keySub;
let metaSub;

let keys: Key[] = [];
let metadata;
interface Key {
  name: string;
  entity: string;
}
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
  require(['shipName', 'scry', 'subscribe', 'poke']);
}

function wipeData() {
  ok = null;
  keySub = null;
  metaSub = null;
  keys = [];
  metadata = {};
}

function require(perms) {
  const sub = urbitVisor.on('connected', [], () => require(perms));
  const sub2 = urbitVisor.on('disconnected', [], () => {
    wipeData();
    require(perms);
  });
  urbitVisor.isConnected().then(res => {
    if (res.response) {
      urbitVisor.off(sub);
      urbitVisor.on('permissions_granted', [], setData);
      urbitVisor.authorizedPermissions().then(res => {
        const ok = ['shipName', 'scry', 'subscribe', 'poke'].every(perm =>
          res.response.includes(perm)
        );
        if (ok) setData();
        else showWelcomeScreen();
      });
    } else urbitVisor.promptConnection();
  });
}

window.addEventListener('beforeunload', function (e) {
  urbitVisor.unsubscribe(keySub);
  urbitVisor.unsubscribe(metaSub);
});

function showWelcomeScreen() {
  const div = document.getElementById('uv-twitter-extension-container');
  const react = React.createElement(App2);
  ReactDOM.render(react, div);
}

function listenerFromTabToContent() {
  window.addEventListener('message', async function (e) {
    const request = e.data;
    request.origin = e.origin;
    switch (request.action) {
      case 'check_perms':
        window.postMessage({ id: request.id + '-res', perms_granted: ok }, window.origin);
        break;
      case 'fetch_keys':
        const list = keys.map((channel: any) => referenceMetadata(channel, metadata));
        window.postMessage({ id: request.id + '-res', channels: list }, window.origin);
        break;
    }
    return;
  });
}

function setData() {
  ok = true;
  urbitVisor.getShip().then(res => {
    ship = res.response;
  });
  urbitVisor.on('sse', ['graph-update', 'keys'], updateKeys);
  urbitVisor.subscribe({ app: 'graph-store', path: '/keys' }).then(res => (keySub = res.response));
  urbitVisor.on('sse', ['metadata-update', 'associations'], updateMetadata);
  urbitVisor.subscribe({ app: 'metadata-store', path: '/all' }).then(res => {
    metaSub = res.response;
    injectButtons();
    injectUnrollButton();
  });
}
function updateKeys(keyUpdate: Key[]) {
  keys = keyUpdate; // this gives you the whole keys again, not incremental
  urbitVisor.unsubscribe(keySub);
  console.log('keys set');
}
function updateMetadata(metadataUpdate: any) {
  metadata = metadataUpdate;
  urbitVisor.unsubscribe(metaSub);
  console.log('metadata set');
}

async function inject() {
  console.log('uv twitter extension running');
  const div = document.createElement('div');
  div.id = 'uv-twitter-extension-container';
  document.body.appendChild(div);
  console.log('uv twitter extension injected');
}
init();
inject();
listenerFromTabToContent();
