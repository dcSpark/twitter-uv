import React from 'react';
import { unmountComponentAtNode } from 'react-dom';
import { useEffect, useState, useRef } from 'react';
import { TwitterProps } from './App';
import { urbitVisor } from '@dcspark/uv-core';
import { getTweet, getThread, Tweet, Poll } from '../api/client';
import {
  titleFromTweet,
  tweetToGraphStore,
  threadToGraphStore,
  pollOptions,
} from '../utils/parsing';
import { buildDM, buildChatPost, buildCollectionPost, buildNotebookPost } from '../utils/utils';

import Preview from './Preview';
import Channels from './Channels';
import mainLogo from './icon128.png';

interface UrbitChannel {
  title: string;
  type: 'post' | 'chat' | 'link' | 'publish' | null;
  group: string;
  ship: string;
  name: string;
}
const placeholder = {
  children: [],
  parent: {
    author: {
      name: '',
      handle: '',
      avatar: '',
    },
    pics: [],
    time: '1d',
    video: null,
    text: '',
    quote: null,
    poll: null,
  },
};
interface ModalProps extends TwitterProps {
  sendPoke: (data) => void;
}

export default function ShareModal(props: ModalProps) {
  const ref = useRef();
  useEffect(() => {
    let leakingMemory = true;
    urbitVisor.getShip().then(res => {
      if (leakingMemory) setShip(res.response);
    });
    getThread(`${props.id}`).then(tweet => {
      if (leakingMemory) {
        // error handling here, shit happens
        setTweet(tweet);
        setPreview(<Preview tweet={tweet.parent} />);
        setTitle('Tweet ' + titleFromTweet(tweet.parent));
        setLoading(false);
      }
    });

    const checkIfClickedOutside = e => {
      if (ref.current && !ref.current.contains(e.target)) quit();
    };
    document.addEventListener('mousedown', checkIfClickedOutside);
    return () => {
      document.removeEventListener('mousedown', checkIfClickedOutside);
      leakingMemory = false;
    };
  }, []);

  const [loading, setLoading] = useState(true);
  const [tweet, setTweet] = useState<Tweet>(placeholder);
  const [title, setTitle] = useState('');
  const [payload, setPayload] = useState(`[${props.url.href}](${props.url.href})`);
  const [ship, setShip] = useState<string>(null);
  const [selected, setSelected] = useState<UrbitChannel[]>([]);
  const [channelFilters, setChannelFilters] = useState([]);

  const fullTweet = <Preview tweet={tweet.parent} />;
  const [preview, setPreview] = useState(<div>...loading...</div>);

  function quit() {
    unmountComponentAtNode(document.getElementById('uv-twitter-extension-container'));
  }
  document.addEventListener(
    'keydown',
    function (e) {
      if (e.key == 'Escape' || e.key == 'Esc') {
        e.preventDefault();
        quit();
      }
    },
    true
  );

  function setFullTweet() {
    setChannelFilters(['link']);
    setPreview(fullTweet);
    setTitle('Tweet ' + titleFromTweet(tweet.parent));
    setPayload(tweetToGraphStore(tweet.parent));
  }
  function setLinkOnly() {
    setChannelFilters([]);
    setPreview(fullTweet);
    setTitle('Tweet ' + titleFromTweet(tweet.parent));
    setPayload(`[${props.url.href}](${props.url.href})`);
  }
  function setUnroll() {
    setChannelFilters(['chat', 'link', 'post']);
    setPreview(fullTweet);
    setTitle('Unrolled Thread ' + titleFromTweet(tweet.parent));
    setPayload(threadToGraphStore(tweet));
  }
  async function shareTweet() {
    for (let channel of selected) {
      let data;
      console.log(channel, 'channel');
      if (channel.type === 'DM') data = buildDM(ship, channel.ship, payload);
      else if (channel.type === 'publish') data = buildNotebookPost(ship, channel, title, payload);
      else if (channel.type === 'link') data = buildCollectionPost(ship, channel, title, payload);
      else if (channel.type === 'chat') data = buildChatPost(ship, channel, payload);
      console.log(data, 'data');
      props.sendPoke(data);
    }
  }

  function applyActiveTab(event) {
    const tablinks = document.getElementsByClassName('tweet-preview-tab');
    for (let i = 0; i < 3; i++) {
      tablinks[i].className = tablinks[i].className.replace(' active-tab', '');
    }
    event.currentTarget.className += ' active-tab';
  }

  return (
    <div ref={ref} id="uv-twitter-share-modal">
      <div id="tweet-preview-header">
        <p onClick={quit} id="preview-close-button"></p>
        <h3>Share on Urbit</h3>
        <img id="extension-icon" src={mainLogo} alt="" />
        <p style={{ width: 12 }}></p>
      </div>
      <div id="tweet-preview-tabs">
        <div className="preview-tab-container">
          <div
            className="tweet-preview-tab"
            onClick={event => {
              setFullTweet();
              applyActiveTab(event);
            }}
          >
            <h4>Full Tweet</h4>
            <div className="tab-underline"></div>
          </div>
        </div>
        <div className="preview-tab-container">
          <div
            className="tweet-preview-tab active-tab"
            onClick={event => {
              setLinkOnly();
              applyActiveTab(event);
            }}
          >
            <h4>Just the Link</h4>
            <div className="tab-underline"></div>
          </div>
        </div>
        <div className="preview-tab-container">
          <div
            className="tweet-preview-tab"
            onClick={event => {
              setUnroll();
              applyActiveTab(event);
            }}
          >
            <h4>Unroll Thread</h4>
            <div className="tab-underline"></div>
          </div>
        </div>
      </div>
      <div id="scroll-wrapper">
        <div id="tweet-share-payload-wrapper">
          <div id="tweet-share-payload">{preview}</div>
        </div>
        <Channels selected={selected} setSelected={setSelected} exclude={channelFilters} />
        <div id="uv-twitter-mini-modal">
          <div id="uv-twitter-mini-modal-icon" className="success-modal">
            <p>✔️</p>
          </div>
          <div id="uv-twitter-mini-modal-message">Tweet shared succesfully</div>
        </div>
      </div>
      <div id="tweet-share-button-wrapper">
        <button disabled={loading} onClick={shareTweet} id="tweet-share-button">
          <svg
            width="24"
            height="24"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="16" cy="16" r="13" fill="white" stroke="currentcolor" strokeWidth="2" />
            <path
              d="M22 14.0488H19.6306C19.4522 15.0976 18.9936 15.7317 18.1783 15.7317C16.7006 15.7317 15.8599 14 13.5669 14C11.3503 14 10.1783 15.3659 10 17.9756H12.3694C12.5478 16.9024 13.0064 16.2683 13.8471 16.2683C15.3248 16.2683 16.1146 18 18.4586 18C20.6242 18 21.8217 16.6341 22 14.0488Z"
              fill="black"
            />
          </svg>
          <p>Share</p>
        </button>
      </div>
    </div>
  );
}
