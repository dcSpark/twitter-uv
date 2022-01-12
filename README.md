<h1 align="center">
  <img src="assets/twitter-uv-logo.png" width="224px"/><br/>
  Twitter UV
</h1>
<p align="center">Twitter UV is a web extension which bridges Twitter and Urbit. It allows users to easily share tweets and unroll whole threads at the click of a button directly onto their ships for sharing with others or archival purposes.

<p align="center"><img src="https://img.shields.io/badge/version-v0.1.0-blue?style=for-the-badge&logo=none" />&nbsp;&nbsp;<img src="https://img.shields.io/badge/license-mit-blue?style=for-the-badge&logo=none" alt="license" /></p>

## FAQ

#### After using Twitter UV for a while, why do the list of Group channels randomly stop loading and the spinner is stuck?
This happens due to the fact that Eyre channels have an unfortunate bug which causes them to randomly drop. Urbit Visor attempts to patch over this as best as possible, however there are edge cases that get through and become evident to the user. We look forward to Tlon fixing this issue in the near future so that users of Twitter UV and other app in the UV ecosystem can have a seamless experience.

**How To Fix:** Simply disconnect/reconnect to your ship on Urbit Visor and refresh the page.


## Building Locally

1. Clone this repo
2. Go to `chrome://extensions` on your browser (or `brave://extensions` if using Brave)
3. Enable "developer mode", click on "load unpacked".
4. Run `npm run start` on the terminal.
5. Add the ./dist folder.

## Development

Run `npm start` to start a dev server and build the extension, add the dist folder to your chrome extensions.
Remember to reload the extension at your extensions page, then reload the Twitter.com after any update.
