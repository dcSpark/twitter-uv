import React from "react";
import ReactDOM from "react-dom";
import App from "../react/App";

const isThreadParent = (tweet: Element) => {
  if (!tweet || !location.pathname.includes('/status/')) {
    return false
  }

  const threadParent = tweet.querySelector("a[href*='how-to-tweet']")
  if (!threadParent) {
    return false
  }

  return true
}

function hoverButton(e){
  const action = e.target.closest(".urbit-visor-share-tweet-action");
  action.style.backgroundColor = "rgb(248, 250, 157, 0.5)";
  action.style.borderRadius = "40%";
  const circle = e.target.closest(".urbit-visor-share-tweet-action").querySelector("circle");
  const path = e.target.closest(".urbit-visor-share-tweet-action").querySelector("path");
  circle.style.stroke = "rgb(245, 203, 66)";
  path.style.fill = "rgb(245, 203, 66)";
}
function unhoverButton(e){
  const action = e.target.closest(".urbit-visor-share-tweet-action");
  action.style.backgroundColor = "transparent";
  const circle = e.target.closest(".urbit-visor-share-tweet-action").querySelector("circle");
  const path = e.target.closest(".urbit-visor-share-tweet-action").querySelector("path");
  circle.style.stroke = "currentcolor";
  path.style.fill = "currentcolor";
}

const createVisorButton = (
  tweet: Element,
  hasUserActions: boolean
) => {
  // Create the tip action
  const shareAction = document.createElement('div')
  shareAction.className = 'urbit-visor-share-tweet-action'
  shareAction.style.display = 'flex';
  shareAction.style.textAlign = hasUserActions ? 'center' : 'start';
  shareAction.setAttribute('role', 'button');
  shareAction.setAttribute('tabindex', '0');

  // Create the tip button
  const urbitButton = document.createElement('button')
  urbitButton.className =
    'urbit-visor-share-tweet-button'
  urbitButton.style.background = 'transparent'
  urbitButton.style.border = '0'
  urbitButton.style.color = '#657786'
  urbitButton.style.display = 'inline-block'
  urbitButton.style.fontSize = '16px'
  urbitButton.style.lineHeight = '1'
  urbitButton.style.outline = '0'
  urbitButton.style.padding = "0";
  urbitButton.style.position = 'relative';
  urbitButton.type = 'button'
  urbitButton.innerHTML = `<svg class="urbit-visor-share-tweet-button-img" width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
     <circle cx="16" cy="16" r="13" fill="transparent" stroke="currentcolor" stroke-width="2"/>
     <path d="M22 14.0488H19.6306C19.4522 15.0976 18.9936 15.7317 18.1783 15.7317C16.7006 15.7317 15.8599 14 13.5669 14C11.3503 14 10.1783 15.3659 10 17.9756H12.3694C12.5478 16.9024 13.0064 16.2683 13.8471 16.2683C15.3248 16.2683 16.1146 18 18.4586 18C20.6242 18 21.8217 16.6341 22 14.0488Z" fill="currentcolor"/>`

  urbitButton.querySelector("svg").onmouseover = hoverButton;
  urbitButton.querySelector("svg").onmouseout = unhoverButton;
  // Create the tip icon container
  //  const tipIconContainer = document.createElement('div')
  //  tipIconContainer.className = 'IconContainer js-tooltip'
  //  tipIconContainer.style.display = 'inline-block'
  //  tipIconContainer.style.lineHeight = '0'
  //  tipIconContainer.style.position = 'relative'
  //  tipIconContainer.style.verticalAlign = 'middle'
  //  urbitButton.appendChild(tipIconContainer)

  // Create the shadow DOM root that hosts our injected DOM elements
  // const shadowRoot = shareAction.attachShadow({ mode: 'open' })
  // shadowRoot.appendChild(urbitButton)

  // // Create style element for hover color
  // const style = document.createElement('style')
  // const css = '.urbit-visor-share-tweet-action :hover { background-color: red; color: #6781db; }'
  // style.appendChild(document.createTextNode(css))
  // shadowRoot.appendChild(style)


  //  // Thread parents require a slightly larger margin due to layout differences
  if (tweet && isThreadParent(tweet)) {
    // urbitButton.style.marginTop = '10px';
  } 
  shareAction.onclick = handleClick
  shareAction.append(urbitButton);
  return shareAction
}

async function handleClick(event) {
  const tweet = event.target.closest("article");
  console.log(tweet, "tweet")
  const url = Array.from(tweet.closest("article").querySelectorAll("a")).map((el: HTMLAnchorElement) => el.href).find(el => el.includes("status"))
  const strings = url.split("/")
  const id = strings[strings.length - 1];
  const div = document.getElementById("uv-twitter-extension-container");
  const react = React.createElement(App, { id: id, url: new URL(url) })
  ReactDOM.render(react, div)
  // getThread(id)
  // const subscription = urbitVisor.on("sse", ["metadata-update", "associations"], async (data: any) => {
  //   console.log(data, "metadata received")
  // });
  // urbitVisor.subscribe({app: "metadata-store", path: "/all"}).then(res => console.log(res, "subscribed to metadata"))
}




export const injectButtons = () => {
  let timeout;
  clearTimeout(timeout)

  // Reset page state since first run of this function may have
  // been pre-content

  let tweets = document.querySelectorAll('[role="article"]')


  for (let i = 0; i < tweets.length; ++i) {
    //  const tweetId = utils.getTweetId(tweets[i], newTwitter)
    //  if (!tweetId) {
    //    continue
    //  }

    const actions = tweets[i].querySelector('[role="group"]')

    if (!actions) {
      continue
    }

    const uvIcons = actions.getElementsByClassName('urbit-visor-share-tweet-action')

    if (uvIcons.length === 0) {
      const numActions = actions.querySelectorAll(':scope > div').length || 0
      const hasUserActions = numActions > 3
      const shareAction = createVisorButton(tweets[i], hasUserActions)
      actions.prepend(shareAction)
    }
  }

  timeout = setTimeout(injectButtons, 3000)
}

