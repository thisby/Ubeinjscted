var alwaysInReady = () => console.log(chrome.storage.sync.get(null,function(e){console.log(e)}));