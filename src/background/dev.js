window.HMR_WEBSOCKET_URL = "ws://localhost:18003";

if (!document.head) {
  document.querySelector("html").appendChild(document.createElement("head"));
}
if (!document.body) {
  document.querySelector("html").appendChild(document.createElement("body"));
}

const hmrClient = document.createElement("script");
hmrClient.src = "http://localhost:18003/snowpackMeta/hmr-client.js";
hmrClient.type = "module";
document.head.appendChild(hmrClient);

const hmrErrorOverlay = document.createElement("script");
hmrErrorOverlay.src =
  "http://localhost:18003/snowpackMeta/hmr-error-overlay.js";
hmrErrorOverlay.type = "module";
document.head.appendChild(hmrErrorOverlay);

const background = document.createElement("script");
background.src = "http://localhost:18003/src/background/index.js";
background.type = "module";
document.body.appendChild(background);
