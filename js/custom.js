var alwaysInReady = () => console.log(chrome.storage.sync.get(null, function (e) {
    console.log(e)
}));

var storageLocal;

var UpdateStorage = () => $.get('https://raw.githubusercontent.com/thisby/Ubeinjscted/main/assets/scripts.json').done((data) => {
    var t = JSON.parse(data);
    t && chrome.storage.local.clear(function () {
        chrome.storage.sync.get(null, function (e) {
            sessionStorage.setItem('storageLocal',e);
            console.log("storage saved")
        });
        chrome.storage.local.set(t, function () {
            console.log("storage setted");
            chrome.tabs.reload();
        })        
    })
})

