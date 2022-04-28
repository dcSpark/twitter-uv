import React from 'react';
import ReactDOM from 'react-dom';
import App from '../react/App';
const isThreadParent = (tweet: Element) => {
  if (!tweet || !location.pathname.includes('/status/')) {
    return false;
  }

  const threadParent = tweet.querySelector("a[href*='how-to-tweet']");
  if (!threadParent) {
    return false;
  }

  return true;
};

function hoverButton(e) {
  const action = e.target.closest('.uv-share-tweet-action').querySelector('button');
  action.style.backgroundColor = 'rgba(0, 186, 124, 0.1)';
  action.style.borderRadius = '50%';
  action.style.transitionDuration = '0.2s';
  action.style.transitionProperty = 'background-color, box-shadow';
  if(isNitter) {
    // action.style.width = '20px';
    // action.style.height = '20px';
  } else {
    action.style.position = 'absolute !important';
    action.style.paddingTop = '2px';
    action.style.top = '-6px';
    action.style.left = '-7px';
    action.style.width = '32px';
    action.style.height = '32px';
  }
  const circle = e.target.closest('.uv-share-tweet-action').querySelector('circle');
  const path = e.target.closest('.uv-share-tweet-action').querySelector('path');
  circle.style.stroke = 'rgb(0, 186, 124)';
  path.style.fill = 'rgb(0, 186, 124)';
}
function unhoverButton(e) {
  const action = e.target.closest('.uv-share-tweet-action').querySelector('button');
  action.style.backgroundColor = 'transparent';
  const circle = e.target.closest('.uv-share-tweet-action').querySelector('circle');
  const path = e.target.closest('.uv-share-tweet-action').querySelector('path');
  circle.style.stroke = 'currentcolor';
  path.style.fill = 'currentcolor';
}

const createUnrollButton = () => {
  // Create the Twitter UV unroll button
  const urbitButton = document.createElement('button');
  const urbitSvg = `<svg width="14" height="14" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" class="urbit-icon"><circle cx="16" cy="16" r="13" fill="white" stroke="currentcolor" stroke-width="2"></circle><path d="M22 14.0488H19.6306C19.4522 15.0976 18.9936 15.7317 18.1783 15.7317C16.7006 15.7317 15.8599 14 13.5669 14C11.3503 14 10.1783 15.3659 10 17.9756H12.3694C12.5478 16.9024 13.0064 16.2683 13.8471 16.2683C15.3248 16.2683 16.1146 18 18.4586 18C20.6242 18 21.8217 16.6341 22 14.0488Z" fill="black"></path></svg>`;
  urbitButton.className = 'uv-unroll-tweet-button';
  urbitButton.type = 'button';
  urbitButton.innerHTML = `${urbitSvg}<span>Unroll</span>`;
  urbitButton.onclick = handleUnroll;
  return urbitButton;
};

const createVisorButton = (tweet: Element, hasUserActions: boolean) => {
  // Create the Twitter UV action
  const shareAction = document.createElement('div');
  shareAction.style.display = 'flex';
  if(isNitter){
    shareAction.style.height = '24px';
    shareAction.style.width = '24px';
    shareAction.className = 'uv-share-tweet-action tweet-stat';
  } else {
    shareAction.style.width = '38px';
    shareAction.className = 'uv-share-tweet-action';
  }
  shareAction.style.textAlign = hasUserActions ? 'center' : 'start';
  shareAction.setAttribute('role', 'button');
  shareAction.setAttribute('tabindex', '0');


  // Create the Twitter UV button
  const urbitButton = document.createElement('button');
  urbitButton.style.border = '0';
  urbitButton.style.outline = '0';
  urbitButton.style.padding = '0';
  urbitButton.style.background = 'transparent';
  urbitButton.style.display = 'inline-block';
  urbitButton.style.fontSize = '16px';
  urbitButton.style.lineHeight = '1';
  urbitButton.className = 'uv-share-tweet-button';
  urbitButton.type = 'button';

  if (isNitter) {
    urbitButton.style.pointerEvents = 'all';
    urbitButton.style.width = '22px';
    urbitButton.style.height = '22px';
    urbitButton.style.color = '#888889';
    urbitButton.innerHTML = `<svg class="uv-share-tweet-button-img" width="16" height="16" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="13" fill="transparent" stroke="currentcolor" stroke-width="2"/>
      <path d="M22 14.0488H19.6306C19.4522 15.0976 18.9936 15.7317 18.1783 15.7317C16.7006 15.7317 15.8599 14 13.5669 14C11.3503 14 10.1783 15.3659 10 17.9756H12.3694C12.5478 16.9024 13.0064 16.2683 13.8471 16.2683C15.3248 16.2683 16.1146 18 18.4586 18C20.6242 18 21.8217 16.6341 22 14.0488Z" fill="currentcolor"/>
      </svg>
      `;
  } else {
    urbitButton.style.width = '24px';
    urbitButton.style.height = '24px';
    urbitButton.style.position = 'absolute';
    urbitButton.style.top = '-1px';
    urbitButton.style.left = '-3px';
    urbitButton.style.color = '#657786';
    urbitButton.innerHTML = `<svg class="uv-share-tweet-button-img" width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="13" fill="transparent" stroke="currentcolor" stroke-width="2"/>
      <path d="M22 14.0488H19.6306C19.4522 15.0976 18.9936 15.7317 18.1783 15.7317C16.7006 15.7317 15.8599 14 13.5669 14C11.3503 14 10.1783 15.3659 10 17.9756H12.3694C12.5478 16.9024 13.0064 16.2683 13.8471 16.2683C15.3248 16.2683 16.1146 18 18.4586 18C20.6242 18 21.8217 16.6341 22 14.0488Z" fill="currentcolor"/>
      </svg>
      `;
  }

  urbitButton.onmouseover = hoverButton;
  urbitButton.onmouseout = unhoverButton;

  // Thread parents require a slightly larger margin due to layout differences
  if (tweet && isThreadParent(tweet)) {
    urbitButton.style.marginLeft = '60px';
    urbitButton.style.marginTop = '13px';

    // For pushing over Brave Tip button
    if (tweet.querySelector('.ProfileTweet-action')) {
      const braveTip = tweet.querySelector('.ProfileTweet-action');
      setTimeout(() => {
        // @ts-ignore: the class "ProfileTweet-action" is coming from outside injected code via Brave browser
        braveTip.style.minWidth = '43px';
      }, 1000);
    }
  }
  shareAction.onclick = handleClick;
  shareAction.append(urbitButton);
  return shareAction;
};

const isNitter = location.host.includes("nitter");

const tweetClass = isNitter ? '.timeline-item': 'article';

async function handleClick(event) {
  const tweet = event.target.closest(tweetClass);
  console.log(tweet);
  const url = Array.from(tweet.closest(tweetClass).querySelectorAll('a'))
    .map((el: HTMLAnchorElement) => el.href)
    .find(el => el.includes('status'));
  console.log("grabbedd url");
  console.log(url);
  const strings = url.split('/');
  const statusAt = strings.indexOf('status');
  const id = strings[statusAt + 1];
  const div = document.getElementById('uv-twitter-extension-container');
  const react = React.createElement(App, { id: id, url: new URL(url) });
  ReactDOM.render(react, div);
}

async function handleUnroll(event) {
  const firstTweet = document.querySelector('article');
  const url = Array.from(firstTweet.closest('article').querySelectorAll('a'))
    .map((el: HTMLAnchorElement) => el.href)
    .find(el => el.includes('status'));
  const strings = url.split('/');
  const statusAt = strings.indexOf('status');
  const id = strings[statusAt + 1];
  const div = document.getElementById('uv-twitter-extension-container');
  const react = React.createElement(App, { id: id, url: new URL(url), unrolling: true });
  ReactDOM.render(react, div);
}

export const injectUnrollButton = (count = 0) => {
  let timeout;
  clearTimeout(timeout);
  const buttonsPresent = document.getElementsByClassName('uv-unroll-tweet-button');
  if (!buttonsPresent.length) {
    const headers = document.querySelectorAll('h2');
    const theHeader = Array.from(headers).find(
      el => el.innerText.toLowerCase() === 'tweet' || el.innerText.toLowerCase() === 'thread'
    ); // they don't make it easy do they
    const container = theHeader.parentElement.parentElement.parentElement;
    const unrollAction = createUnrollButton();
    if (theHeader.innerText.toLowerCase() === 'thread') {
      container.appendChild(unrollAction);
    } else if (theHeader.innerText.toLowerCase() === 'tweet' && count < 5) {
      setTimeout(() => {
        injectUnrollButton(count + 1);
      }, 1000);
    }
  }
  timeout = setTimeout(injectUnrollButton, 3000);
};

const tweetSelector = isNitter ? ".timeline-item" : '[role="article"]';
const tweetActionsSelector = isNitter ? ".tweet-stats" : '[role="group"]';
const numActionSelector = isNitter ? ".tweet-stat" : ":scope > div";

export const injectButtons = () => {
  console.log("trying to inject");
  let timeout;
  clearTimeout(timeout);

  // Reset page state since first run of this function may have
  // been pre-content
  let tweets = document.querySelectorAll(tweetSelector);
  for (let i = 0; i < tweets.length; ++i) {
    const actions = tweets[i].querySelector(tweetActionsSelector);

    if (!actions) {
      continue;
    }

    const uvIcons = actions.getElementsByClassName('uv-share-tweet-action');
    if (uvIcons.length === 0) {
      console.log("here again");
      const numActions = actions.querySelectorAll(numActionSelector).length || 0;
      console.log(numActions);
      const hasUserActions = numActions > 3;
      const shareAction = createVisorButton(tweets[i], hasUserActions);
      actions.prepend(shareAction);
    }
  }

  timeout = setTimeout(injectButtons, 3000);
};
