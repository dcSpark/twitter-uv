import { getTweet, getThread, Tweet, Thread, Poll } from "../api/client";

function tweetTitle(tweet: Tweet){
    const url = `https://twitter.com/${tweet.author.handle}/statuses/${tweet.index}`
    return `[Tweet by ${tweet.author.name} (@${tweet.author.handle})](${url}) Posted on ${tweet.time}
    \n-\n
  `;
}
function threadTitle(thread: Thread){
    const tweet = thread.parent;
    const url = `https://twitter.com/${tweet.author.handle}/statuses/${tweet.index}`
    return `[Twitter Thread by ${tweet.author.name} (@${tweet.author.handle})](${url})\n
Length: ${thread.children.length + 1} Tweets\n
Posted on ${tweet.time}\n\n\`-------------------------------------------------------\`\n\n`;
}
export function titleFromTweet(tweet: Tweet): string{
    return `by @${tweet.author.handle} - ${tweet.time}`;
}

function tweetToMarkdown(tweet: Tweet) {
    const text = tweet.text + "\n\n";
    const withMedia = tweet.video
    ? text + `![](${tweet.video.href.replace(/\?.+/,'')})`
    : tweet.pics.reduce((acc, picURL)=> acc + `![](${picURL.href})`, text);
    const withQuote = tweet.quote
    ? withMedia + "Quoting:\n" + tweetToMarkdown(tweet.quote).split("\n").map(line => `> ${line}`).join("\n")
    : withMedia
    const withPoll = tweet.poll
    ? withQuote + pollOptions(tweet.poll).reduce((acc, opt)=> acc + `${opt.label}: ${opt.count}\n`, ".\nPoll:\nOption   Count\n") + "\n"
    : withQuote
    return withPoll
};
function tweetToText(tweet: Tweet) {
    const contents: any = [{text: tweet.text + "\n"}]; // argh
    tweet.pics.forEach(pic => contents.push({ url: pic.href }));
    if (tweet.video) contents.push({ url: tweet.video.href });
    if (tweet.quote) {
        const quoteContents = quoteToText(tweet.quote);
        quoteContents.forEach(piece => contents.push(piece));
    }
    if (tweet.poll){
      const string = ".\nPoll:\nOption   Count\n";
      const options = pollOptions(tweet.poll);
      const poll = options.reduce((acc, opt)=> acc + `${opt.label}: ${opt.count}\n`, string);
      contents.push({text: poll + "\n"});
    }
    return contents
};
export function tweetToGraphStore(tweet: Tweet){
  return tweetTitle(tweet) + tweetToMarkdown(tweet)
};

export function threadToGraphStore(thread): string{
    const title = threadTitle(thread);
    const parent = tweetToMarkdown(thread.parent);
    const children = thread.children.reduce((acc, tweet, index)=>{
        const text = tweetToMarkdown(tweet);        
        return acc + text
    }, "")
    return title + parent + children
}
function quoteToText(quote: Tweet) {
    const url = `https://twitter.com/${quote.author.handle}/statuses/${quote.index}`
    const contents = [];
    const text = ` 
      .\n
      \n
      [Quoting: ${quote.author.name} (@${quote.author.handle})](${url}) Posted on ${quote.time}
      \n
      ${quote.text}
      \n
    `;
    contents.push({ text: text });
    quote.pics.forEach(pic => contents.push({ url: pic.href }));
    if (quote.video) contents.push({ url: quote.video.href });
    return contents
}

export function pollOptions(poll: Poll){
    const labels = Object.keys(poll).filter(key => key.includes("label"));
    const options = labels.map(label => {
        const count = label.split("_label")[0] + "_count"
        return { label: poll[label], count: poll[count] }
    });
    return options
}