const threadsURL =
  'https://twitter.com/i/api/graphql/GpnXbjn5tx9tVXnVqmXpkA/TweetDetail?variables=';
const tweetURL = `https://api.twitter.com/1.1/statuses/show.json?id=`;

function headers() {
  const cookieElems = document.cookie.split('; ');
  const gt = cookieElems.find(elem => elem.includes('gt='));
  let gts = '';
  if (gt) gts = gt.replace('gt=', '');
  const twid = cookieElems.find(elem => elem.includes('twid='));
  let twids = '';
  if (twid) twids = twid.replace('twid=u%3D', '');

  const csrf = cookieElems.find(elem => elem.includes('ct0='));
  let csrfs = '';
  if (csrf) csrfs = csrf.replace('ct0=', '');
  const headers = {
    Authorization:
      'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
    'x-csrf-token': csrfs,
    'x-guest-token': twids || gts,
      "Access-Control-Allow-Origin": "no-cors",
      "Access-Control-Allow-Methods": "*",
      "Access-Control-Allow-Headers": "*"
  };
  const meta: RequestInit = {
    credentials: 'include',
    headers: { ...headers },
    referrerPolicy: 'no-referrer-when-downgrade',
    method: 'GET',
    redirect: 'follow',
  };
  console.log(meta, 'meta');
  return meta;
}

const baseVariables = {
  includePromotedContent: false,
  withHighlightedLabel: false,
  withCommunity: false,
  with_rux_injections: false,
  referrer: 'tweet',
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
  withVoice: true,
};
const fetchThread = async (id: string, cursor: string = null) => {
  const variables = cursor
    ? { ...baseVariables, ...{ focalTweetId: id, cursor: cursor } }
    : { ...baseVariables, ...{ focalTweetId: id } };
  const url = threadsURL + encodeURIComponent(JSON.stringify(variables));
  const res = await fetch(url, headers());
  if (res.status === 200) return await res.json();
  else return null;
};

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
  if (entities.media) {
    const urls = entities.media.map(pic => new URL(pic.media_url_https));
    return urls;
  } else return [];
}
function findEntities(entities: any): TweetEntity[] {
  if (
    entities.user_mentions ||
    entities.hashtags ||
    entities.symbols ||
    entities.urls ||
    entities.media
  ) {
    if (entities.hashtags) {
      entities.hashtags = entities.hashtags.map(obj => ({
        ...obj,
        entity_type: 'hashtag',
      }));
    }
    if (entities.symbols) {
      entities.symbols = entities.symbols.map(obj => ({
        ...obj,
        entity_type: 'symbol',
      }));
    }
    let foundEntities = [];
    entities.user_mentions.map(mention => foundEntities.push(mention));
    entities.hashtags.map(hashtag => foundEntities.push(hashtag));
    entities.symbols.map(symbol => foundEntities.push(symbol));
    entities.urls.map(url => foundEntities.push(url));
    if (entities.media) {
      entities.media.map(med => foundEntities.push(med));
    }
    return foundEntities;
  } else return [];
}
function findVideo(entities: any): URL {
  if (!entities) return null;
  else if (entities.media && entities.media[0].video_info) {
    const v = entities.media[0].video_info.variants.reduce((prev, next) => {
      if (next?.bitrate && prev?.bitrate) return next.bitrate > prev.bitrate ? next : prev;
      else {
        if (next.bitrate) return next;
        else return prev;
      }
    });
    return new URL(v.url);
  } else return null;
}

export async function getThread(id: string) {
  const res = await fetchThread(id);
  const tweets = res.data.threaded_conversation_with_injections.instructions.find(
    el => el.type === 'TimelineAddEntries'
  );
  const parent = tweets.entries.find(el => el.entryId.includes(id));
  const children = tweets.entries.filter(el => el.entryId.includes('conversationthread'));
  const placeholder = { content: { items: [] } };

  const threadChildren =
    children.find(subthread =>
      subthread.content.items.find(
        child => child.item.itemContent.tweetDisplayType === 'SelfThread'
      )
    ) || placeholder;
  const processedParent = processThread(parent.content.itemContent.tweet_results.result);
  const cursorObject = threadChildren.content.items.find(
    child => child.item.itemContent.itemType === 'TimelineTimelineCursor'
  );
  const cursorString = cursorObject?.item?.itemContent?.value;
  let processedChildren = [];
  if (threadChildren) {
    processedChildren = threadChildren.content.items
      .filter(
        child =>
          child.item.itemContent.itemType === 'TimelineTweet' &&
          child.item.itemContent.tweetDisplayType === 'SelfThread'
      )
      .map(child => processThread(child.item.itemContent.tweet_results.result));
  }
  let more = [];
  if (cursorString) {
    const moreKids = await getSubsequentChildren(id, cursorString, []);
    more = [...moreKids];
  }
  return { parent: processedParent, children: [...processedChildren, ...more] };
}

async function getSubsequentChildren(id: string, cursor: string, acc: any[]) {
  const res = await fetchThread(id, cursor);
  const data = res.data.threaded_conversation_with_injections.instructions.find(
    el => el.type === 'TimelineAddToModule'
  );
  const children = data.moduleItems.filter(
    el => el.entryId.includes('tweet') && el.item.itemContent.tweetDisplayType === 'SelfThread'
  );
  const newCursor = data.moduleItems.find(el => el.entryId.includes('cursor'));
  const cursorString = newCursor?.item?.itemContent?.value;
  const processedChildren = children.map(child =>
    processThread(child.item.itemContent.tweet_results.result)
  );
  if (cursorString) return getSubsequentChildren(id, cursorString, [...acc, ...processedChildren]);
  else return [...acc, ...processedChildren];
}

function processThread(data: any): Tweet {
  if (!data) return null;
  else {
    const tweet = data.legacy;
    const time = dateString(translateDate(tweet.created_at));
    const author = processAuthor(data.core.user.legacy);
    const pics = findPics(tweet.entities);
    const foundEntities = findEntities(tweet.entities);
    const video = findVideo(tweet?.extended_entities);
    const text = tweet.full_text;
    // some quotes are "disabled" so they only show as urls on tweet.quoted_status_permalink
    const quote = processThread(data?.quoted_status_result?.result);
    const poll = processPoll(data?.card?.legacy);
    const parent = tweet?.self_thread?.id_str || null;
    const startsThread = parent && tweet.conversation_id_str === tweet.id_str;
    return {
      index: tweet.id_str,
      time: time,
      author: author,
      pics: pics,
      video: video,
      text: text,
      quote: quote,
      poll: poll,
      parent: parent,
      startsThread: startsThread,
      entities: foundEntities,
    };
  }
}
function processAuthor(user: any): TweetAuthor {
  return {
    name: user.name,
    handle: user.screen_name,
    avatar: new URL(user.profile_image_url_https),
  };
}

function processPoll(poll: any): Poll {
  if (!poll || !poll.name.includes('choice')) return null;
  else {
    return poll.binding_values.reduce((acc, item) => {
      const obj = {};
      const type = item.value.type.toLowerCase();
      obj[item.key] = item.value[`${type}_value`];
      return Object.assign(acc, obj);
    }, {});
  }
}

export interface Thread {
  parent: Tweet;
  children: Tweet[];
}

interface TextEntity {
  indices: number[];
  text: string;
  entity_type: 'hashtag' | 'symbol';
}

interface UserEntity {
  indices: number[];
  screen_name: string;
}

export interface UrlEntity {
  indices: number[];
  url: string;
  display_url: string;
  expanded_url: string;
}

interface MediaEntity extends UrlEntity {}

export type TweetEntity = UserEntity | UrlEntity | MediaEntity | TextEntity;

export interface Tweet {
  time: string;
  author: TweetAuthor;
  pics: URL[];
  video: URL;
  text: string;
  quote: Tweet;
  poll: Poll;
  index: string;
  parent: string;
  startsThread: boolean;
  entities: TweetEntity[];
}

interface TweetAuthor {
  name: string;
  handle: string;
  avatar: URL;
}
export interface Poll {
  card_url: string;
  api: string;
  last_updated_datetime_utc: string;
  end_datetime_utc: string;
  counts_are_final: boolean;
  choice1_label: string;
  choice1_count: string;
  choice2_label: string;
  choice2_count: string;
  choice3_label?: string;
  choice3_count?: string;
  choice4_label?: string;
  choice4_count?: string;
}

function dateString(date: Date) {
  return date.toLocaleString();
}
