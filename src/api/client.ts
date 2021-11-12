const threadsURL = "https://twitter.com/i/api/graphql/GpnXbjn5tx9tVXnVqmXpkA/TweetDetail?variables="
const tweetURL = `https://api.twitter.com/1.1/statuses/show.json?id=`;

function headers() {
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
    headers: { ...headers },
    referrerPolicy: 'no-referrer-when-downgrade',
    method: 'GET',
    redirect: 'follow'
  }
  return meta
}


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
const fetchThread = async (id: string, cursor:string = null) => {
  let variables; 
  if (cursor) variables = encodeURIComponent(JSON.stringify(Object.assign(baseVariables, { focalTweetId: id, cursor: cursor })));
  else variables = encodeURIComponent(JSON.stringify(Object.assign(baseVariables, { focalTweetId: id })));
  const url = threadsURL + variables;
  const res = await fetch(url, headers());
  const json = await res.json();
  return json
}
export async function getTweet(id: string) {
  const res = await fetch(tweetURL + id, headers());
  const json = await res.json();
  return json;
}

function translateDate(date: string): Date {
  const unix = Date.parse(date);
  return new Date(unix);
}
function findPics(entities: any): URL[] {
  if (entities.media){
    const urls = entities.media.map(pic => new URL(pic.media_url_https))
    return urls
  } else return []
}
function findVideo(entities: any): URL {
  if (!entities) return null
  else if (entities.media && entities.media[0].video_info) {
    const v =  entities.media[0].video_info.variants.reduce((prev, next) => {
      if (next?.bitrate && prev?.bitrate)
      return next.bitrate > prev.bitrate ? next : prev
      else {
        if (next.bitrate) return next
        else return prev
      }
    });
    return new URL(v.url)
  }
  else return null
}
function scrubURLS(entities: any): URL[] {
  const list: Array<URL> = [];
  // will probably need to return to this one
  entities.urls.forEach(m => list.push(new URL(m.url)));
  if (entities.media) entities.media.forEach(m => list.push(new URL(m.url)));
  return list
};

function addFullURL(entities: any){
  return `\n${entities.urls.reduce((acc, item) => acc + item.expanded_url, "")}\n`
}

export async function getThread(id: string) {
  const res = await fetchThread(id);
  console.log(res, "res")
  const tweets = res.data.threaded_conversation_with_injections.instructions.find(el => el.type === "TimelineAddEntries");
  const parent = tweets.entries.find(el => el.entryId.includes(id));
  const children = tweets.entries.filter(el => el.entryId.includes("conversationthread"));
  const placeholder = {content: {items: []}};
  const threadChildren = children.find(subthread => subthread.content.items.find(child => child.item.itemContent.tweetDisplayType === "SelfThread")) || placeholder;
  console.log(children, "has children")
  console.log(threadChildren, "has threadchildren")
  // const cursorObject = tweets.entries.find(el => el.entryId.includes("cursor-bottom"));
  // const cursorString = cursorObject?.content?.itemContent?.value;
  const cursorObject2 = threadChildren.content.items.find(child => child.item.itemContent.itemType === "TimelineTimelineCursor");
  const cursorString2 = cursorObject2?.item?.itemContent?.value;
  // console.log(cursorObject, "cursorObject")
  // console.log(cursorObject2, "cursorObject2")
  const effectiveCursor = cursorString2  // || cursorString;
  const processedParent =  processThread(parent.content.itemContent.tweet_results.result);
  let processedChildren = [];
  if (threadChildren) {
  processedChildren = 
  threadChildren.content.items.filter(child => child.item.itemContent.itemType === "TimelineTweet" && child.item.itemContent.tweetDisplayType === "SelfThread")
    .map(child => processThread(child.item.itemContent.tweet_results.result));
  };
  let more = [];
  if (effectiveCursor) {
    const moreKids =  await getSubsequentChildren(id, effectiveCursor, []);
    more = [...moreKids]
  }
  return {parent: processedParent, children: [...processedChildren, ...more]}
}

async function getSubsequentChildren(id:string, cursor:string, acc: any[]){
  console.log(cursor, "passed cursor")
  const res = await fetchThread(id, cursor);
  const data = res.data.threaded_conversation_with_injections.instructions.find(el => el.type === "TimelineAddToModule");
  console.log(data, "subsequent data")
  const children = data.moduleItems.filter(el => el.entryId.includes("tweet") && el.item.itemContent.tweetDisplayType === "SelfThread");
  const newCursor = data.moduleItems.find(el => el.entryId.includes("cursor"));
  const cursorString = newCursor?.item?.itemContent?.value;
  const processedChildren = children.map(child => processThread(child.item.itemContent.tweet_results.result));
  if (cursorString) return getSubsequentChildren(id, cursorString, [...acc, ...processedChildren]);
  else return [...acc, ...processedChildren]
}

function processThread(data: any): Tweet {
  if (!data) return null
  else {
    const tweet = data.legacy;
    const time = dateString(translateDate(tweet.created_at));
    const author = processAuthor(data.core.user.legacy);
    const pics = findPics(tweet.entities);
    const video = findVideo(tweet?.extended_entities);
    const redundant_urls = scrubURLS(tweet.entities);
    const text = (redundant_urls.reduce((acc, i) => acc.replace(i, "").trim(), tweet.full_text)) + addFullURL(tweet.entities);
    // some quotes are "disabled" so they only show as urls on tweet.quoted_status_permalink
    const quote = processThread(data?.quoted_status_result?.result);
    const poll = processPoll(data?.card?.legacy);
    const parent = tweet?.self_thread?.id_str || null
    const startsThread = parent && tweet.conversation_id_str === tweet.id_str
    return { index: tweet.id_str, startsThread: startsThread, parent: parent, time: time, author: author, pics: pics, video: video, text: text, quote: quote, poll: poll }
  }
};
function processAuthor(user: any): TweetAuthor{
  return {
    name: user.name,
    handle: user.screen_name,
    avatar: new URL(user.profile_image_url_https)
  }
};

function processPoll(poll: any): Poll{
  console.log(poll, "poll")
  if (!poll || !poll.name.includes("choice")) return null
  else {
    return poll.binding_values.reduce((acc, item) => {
      const obj = {};
      const type = item.value.type.toLowerCase();
      obj[item.key] = item.value[`${type}_value`]
      return Object.assign(acc, obj);
    }, {});
  }
};

export interface Tweet { 
  time: string, 
  author: TweetAuthor, 
  pics: URL[], 
  video: URL, 
  text: string, 
  quote: Tweet, 
  poll: Poll,
  index: string,
  parent: string,
  startsThread: boolean
};

interface TweetAuthor {
  name: string,
  handle: string,
  avatar: URL
};
export interface Poll{
  card_url: string,
  api: string,
  last_updated_datetime_utc: string,
  end_datetime_utc: string,
  counts_are_final: boolean,
  choice1_label: string,
  choice1_count: string,
  choice2_label: string,
  choice2_count: string,
  choice3_label?: string,
  choice3_count?: string,
  choice4_label?: string,
  choice4_count?: string
};

function dateString(date: Date){
  return date.toLocaleString()
};