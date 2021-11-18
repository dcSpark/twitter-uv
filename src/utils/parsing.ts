import { getTweet, getThread, Tweet, Thread, Poll } from "../api/client";

function tweetTitle(tweet: Tweet){
    const url = `https://twitter.com/${tweet.author.handle}/statuses/${tweet.index}`
    return `
    Urbit Visor Presents: 
    [Tweet by ${tweet.author.name} (@${tweet.author.handle})](${url}) Posted on ${tweet.time}
    \n 
  `;
}
function threadTitle(thread: Thread){
    const tweet = thread.parent;
    const url = `https://twitter.com/${tweet.author.handle}/statuses/${tweet.index}`
    return `
    Urbit Visor Presents: 
    [Twitter Thread, ${thread.children.length + 1} tweets long, by ${tweet.author.name} (@${tweet.author.handle})](${url}) Posted on ${tweet.time}
    \n 
  `;
}

function tweetToText(tweet: Tweet) {
    const contents: any = [{text: tweet.text + " -\n "}]; // argh
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
      contents.push({text: poll + " \n "});
    }
    return contents
};
export function tweetToGraphStore(tweet: Tweet){
  return [{text: tweetTitle(tweet)}, ...tweetToText(tweet)]
}

export function threadToGraphStore(thread){
    const title = threadTitle(thread);
    const parent = tweetToText(thread.parent);
    const children = thread.children.reduce((acc, tweet, index) =>{
        // const contents = [{text: `\n${index + 2}/${thread.children.length + 1}\n`}, ...tweetToText(tweet)];
        const contents = tweetToText(tweet);
        return [...acc, ...contents]
    }, [])
    return [{text: title}, ...parent, ...children]

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