// code inspired by https://github.com/brave/brave-site-specific-scripts/blob/master/scripts/brave_rewards/publisher/twitter/tipping.ts;
import { urbitVisor } from "urbit-visor-utils";

// declare let window: any;
let timeout: any = null

let newTwitter = true
console.log("uv twitter extension loaded")

const threadsURL = "https://twitter.com/i/api/graphql/GpnXbjn5tx9tVXnVqmXpkA/TweetDetail?variables="
const tweetURL = `https://api.twitter.com/1.1/statuses/show.json?id=`;

const baseVariables = {
  includePromotedContent: false,
  withHighlightedLabel: false,
  withCommunity: false,
  "with_rux_injections": false,
  "referrer": "tweet",
  withTweetQuoteCount: true,
  withBirdwatchNotes: false,
  withBirdwatchPivots: false,
  withTweetResult: true,
  withReactions: true,
  withReactionsMetadata: false,
  withReactionsPerspective: false,
  withSuperFollowsTweetFields: false,
  withSuperFollowsUserFields: false,
  withUserResults: false,
  withVoice: true
}

const getThread = async (id: string) => {
  const variables = encodeURIComponent(JSON.stringify(Object.assign(baseVariables, {focalTweetId: id})));
  const url = threadsURL + variables;
  const res = await fetch(url, headers());
  const json = await res.json();
  console.log(json, "json");
}

function headers(){
  const cookieElems = document.cookie.split("; ")
  const gt = cookieElems.find(elem => elem.includes("gt=")).replace("gt=", "")
  const csrf = cookieElems.find(elem => elem.includes("ct0=")).replace("ct0=", "")
  const headers = {
    "Authorization": "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA",
    "x-csrf-token": csrf,
    "x-guest-token": gt
  };
  const meta: RequestInit = {
    credentials: 'include',
    headers: {...headers},
    referrerPolicy: 'no-referrer-when-downgrade',
    method: 'GET',
    redirect: 'follow'
  }
 return meta
}

async function handleClick(event) {
  const tweet = event.target.closest("article")
  const url =  Array.from(tweet.closest("article").querySelectorAll("a")).map((el: HTMLAnchorElement) => el.href).find(el => el.includes("status"))
  const strings = url.split("/")
  const id = strings[strings.length -1];
  // getThread(id)
  await openModal(url);
}

async function openModal(shareString: string){
  const res = await urbitVisor.scry({ app: "graph-store", path: "/keys" });
  const keys = res.response["graph-update"].keys;
  const shipName = await urbitVisor.getShip();
  console.log(keys, "keys")
  const modalBox = document.createElement('div');
  modalBox.id = "uv-extension-channel-modal";
  modalBox.style.width = "100%";
  modalBox.style.height = "300px";
  modalBox.style.backgroundColor = "white";
  modalBox.style.overflowY = "scroll";
  modalBox.style.position = "fixed";
  modalBox.style.top = "0";
  modalBox.style.left = "0";
  modalBox.style.padding = "1rem";
  const closeButton = document.createElement('p');
  closeButton.innerText = "x";
  closeButton.style.fontSize = "2rem";
  closeButton.style.margin = "-0.5rem 0 0 0";
  closeButton.style.cursor = "pointer";
  closeButton.onclick = () => document.querySelector("#uv-extension-channel-modal").remove();
  modalBox.appendChild(closeButton);
  for (let key of keys){
    const p = document.createElement("p");
    p.innerText = `~${key.ship}/${key.name}`;
    p.style.color = "black";
    p.style.cursor = "pointer";
    // indexes are recalculated in the backend, frontend just needs a placeholder
    const post = {author: "~" + shipName.response, index: "/170141184505288292003755928111160273928", "time-sent": Date.now(), contents: [{text: "Urbit Visor Presents: "},{url: shareString}], hash: null, signatures: []}
    const body = {
      "add-nodes": {
        resource: {ship: "~" + key.ship, name: key.name},
        nodes: {"/170141184505288292003755928111160273928": {post: post, children: null}}
      }
    }
    p.onclick = () => {
      console.log(body, "body to send")
      urbitVisor.thread({inputMark: "landscape/graph-update-3", threadName: "graph-add-nodes", outputMark: "graph-view-action", body: body }).then(res => console.log(res, "thread sent"))
    }; 
    modalBox.appendChild(p);
  }
  document.body.appendChild(modalBox);
}

const createVisorButton = (
  tweet: Element,
  hasUserActions: boolean
) => {
  // Create the tip action
  const tipAction = document.createElement('div')
  tipAction.className = 'urbit-visor-share-tweet-action action-brave-tip'
  tipAction.style.display = 'inline-block'
  tipAction.style.textAlign = hasUserActions ? 'center' : 'start'
  tipAction.setAttribute('role', 'button')
  tipAction.setAttribute('tabindex', '0')

  // Create the tip button
  const tipButton = document.createElement('button')
  tipButton.className =
    'urbit-visor-share-tweet-button'
  tipButton.style.background = 'transparent'
  tipButton.style.border = '0'
  tipButton.style.color = '#657786'
  tipButton.style.cursor = 'pointer'
  tipButton.style.display = 'inline-block'
  tipButton.style.fontSize = '16px'
  tipButton.style.lineHeight = '1'
  tipButton.style.outline = '0'
  tipButton.style.position = 'relative'
  tipButton.type = 'button'
  tipButton.innerHTML = `<svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
   <circle cx="16" cy="16" r="13" fill="transparent" stroke="rgb(110, 118, 125)" stroke-width="1"/>
   <path d="M22 14.0488H19.6306C19.4522 15.0976 18.9936 15.7317 18.1783 15.7317C16.7006 15.7317 15.8599 14 13.5669 14C11.3503 14 10.1783 15.3659 10 17.9756H12.3694C12.5478 16.9024 13.0064 16.2683 13.8471 16.2683C15.3248 16.2683 16.1146 18 18.4586 18C20.6242 18 21.8217 16.6341 22 14.0488Z" fill="rgb(110, 118, 125)"/>`
  tipButton.onclick = handleClick

  //  // Thread parents require a slightly larger margin due to layout differences
  //  if (newTwitter && tweet && isThreadParent(tweet)) {
  //    tipButton.style.marginTop = '12px'
  //  }

  // Create the tip icon container
  //  const tipIconContainer = document.createElement('div')
  //  tipIconContainer.className = 'IconContainer js-tooltip'
  //  tipIconContainer.style.display = 'inline-block'
  //  tipIconContainer.style.lineHeight = '0'
  //  tipIconContainer.style.position = 'relative'
  //  tipIconContainer.style.verticalAlign = 'middle'
  //  tipButton.appendChild(tipIconContainer)

  // Create the shadow DOM root that hosts our injected DOM elements
  // const shadowRoot = tipAction.attachShadow({ mode: 'open' })
  // shadowRoot.appendChild(tipButton)

  // // Create style element for hover color
  // const style = document.createElement('style')
  // const css = '.urbit-visor-share-tweet-action :hover { background-color: red; color: #6781db; }'
  // style.appendChild(document.createTextNode(css))
  // shadowRoot.appendChild(style)
  tipAction.appendChild(tipButton)

  return tipAction
}



const configure = () => {
  clearTimeout(timeout)

  // Reset page state since first run of this function may have
  // been pre-content
  newTwitter = true

  let tweets = document.querySelectorAll('[role="article"]')
  if (tweets.length === 0) {
    tweets = document.querySelectorAll('.tweet')
    newTwitter = false
  }

  for (let i = 0; i < tweets.length; ++i) {
    //  const tweetId = utils.getTweetId(tweets[i], newTwitter)
    //  if (!tweetId) {
    //    continue
    //  }

    let actions

    if (newTwitter) {
      actions = tweets[i].querySelector('[role="group"]')
    } else {
      actions = tweets[i].querySelector('.js-actions')
    }

    if (!actions) {
      continue
    }

    const uvIcons = actions.getElementsByClassName('urbit-visor-share-tweet-action')

    if (uvIcons.length === 0) {
      const numActions = actions.querySelectorAll(':scope > div').length || 0
      const hasUserActions = numActions > 3
      const tipAction = createVisorButton(tweets[i], hasUserActions)
      actions.appendChild(tipAction)
    }
  }

  timeout = setTimeout(configure, 3000)
}

configure();
