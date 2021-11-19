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

function tweetToMarkdown(tweet: Tweet) {
    const text = tweet.text + "\n\n";
    const withPics = tweet.pics.reduce((acc, picURL)=>{
      return acc + `![](${picURL.href})`
    }, text);
    let withVideo = withPics;
    if (tweet.video) withVideo = withVideo + `[](${tweet.video.href.replace(/\?.+/,'')})`;
    let withQuote = withVideo;
    if (tweet.quote) {
        const quoteText = tweetToMarkdown(tweet.quote);
        console.log(quoteText, "quote text")
        const quoteText2 = quoteText.split("\n").map(line => `> ${line}`).join("\n");
        withQuote = withQuote + "Quoting:\n" + quoteText2; 
    }
    let withPoll = withQuote;
    if (tweet.poll){
      const string = ".\nPoll:\nOption   Count\n";
      const options = pollOptions(tweet.poll);
      const poll = options.reduce((acc, opt)=> acc + `${opt.label}: ${opt.count}\n`, string);
      withPoll = withPoll + poll + "\n"
    }
    return withPoll
};
function tweetToText(tweet: Tweet) {
    const contents: any = [{text: tweet.text + "\n"}]; // argh
    tweet.pics.forEach(pic => contents.push({ url: pic.href }));
    if (tweet.video) contents.push({ url: tweet.video.href });
    if (tweet.quote) {
        const quoteContents = quoteToText(tweet.quote);
        console.log(quoteContents, "to quote")
        console.log(contents, "mother")
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
        // const contents = [{text: `\n${index + 2}/${thread.children.length + 1}\n`}, ...tweetToText(tweet)];
        const text = tweetToMarkdown(tweet);
        console.log(text, "tweet to markdown")
        
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