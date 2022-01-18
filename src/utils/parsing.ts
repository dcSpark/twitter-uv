import { Tweet, Thread, Poll } from '../api/client';

const URL_REGEX = new RegExp(
  String(
    /^([\s\S]*?)(([\w\-\+]+:\/\/)[-a-zA-Z0-9:@;?&=\/%\+\.\*!'\(\),\$_\{\}\^~\[\]`#|]+[-a-zA-Z0-9:@;?&=\/%\+\*!'\(\)\$_\{\}\^~\[\]`#|])([\s\S]*)/
      .source
  )
);
type Content = textContent | urlContent;
interface textContent {
  text: string;
}
interface urlContent {
  url: URL;
}

function tweetTitle(tweet: Tweet) {
  const url = `https://twitter.com/${tweet.author.handle}/statuses/${tweet.index}`;
  return `[Tweet by ${tweet.author.name} (@${tweet.author.handle})](${url}) Posted on ${tweet.time}
    \n-------------------\n
  `;
}
function threadTitle(thread: Thread) {
  const tweet = thread.parent;
  const url = `https://twitter.com/${tweet.author.handle}/statuses/${tweet.index}`;
  return `[Twitter Thread by ${tweet.author.name} (@${tweet.author.handle})](${url})\n
Length: ${thread.children.length + 1} Tweets\n
Posted on ${tweet.time}\n\n\`-------------------------------------------------------\`\n\n`;
}
export function titleFromTweet(tweet: Tweet): string {
  return `by @${tweet.author.handle} - ${tweet.time}`;
}

function tweetToMarkdown(tweet: Tweet): string {
  console.log(tweet, 'parsing tweet');
  // const urls = tweet.urls.map(u => {
  //   return { url: new URL(u) };
  // });
  const text = tweet.text + '\n\n';
  const withMedia = tweet.video
    ? text + `![](${tweet.video.href.replace(/\?.+/, '')})`
    : tweet.pics.reduce((acc, picURL) => acc + `![](${picURL.href})`, text);
  const withQuote = tweet.quote
    ? withMedia +
      'Quoting:\n' +
      tweetToMarkdown(tweet.quote)
        .split('\n')
        .map(line => `> ${line}`)
        .join('\n')
    : withMedia;
  const withPoll = tweet.poll
    ? withQuote +
      pollOptions(tweet.poll).reduce(
        (acc, opt) => acc + `${opt.label}: ${opt.count}\n`,
        '\nPoll:\n'
      ) +
      '\n'
    : withQuote;
  return withPoll;
}

export function tweetToGraphStore(tweet: Tweet) {
  return tweetTitle(tweet) + tweetToMarkdown(tweet);
}

export function threadToGraphStore(thread): string {
  const title = threadTitle(thread);
  const parent = tweetToMarkdown(thread.parent);
  const children = thread.children.reduce((acc, tweet, index) => {
    const text = tweetToMarkdown(tweet);
    return acc + text;
  }, '');
  return title + parent + children;
}

export function pollOptions(poll: Poll) {
  const labels = Object.keys(poll).filter(key => key.includes('label'));
  const options = labels.map(label => {
    const count = label.split('_label')[0] + '_count';
    return { label: poll[label], count: poll[count] };
  });
  return options;
}
