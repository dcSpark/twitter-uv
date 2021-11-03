import { urbitVisor } from "@dcspark/uv-core";

console.log("twitter background running")
urbitVisor.getShip().then(res => console.log(res, "background script got ship"))

function relayToContent(){
    chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse)=>{
        console.log(request, "request")
        console.log(sender, "sender")
        chrome.tabs.sendMessage(1, request)
        return true
      })
}
relayToContent();