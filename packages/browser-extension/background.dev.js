if (!document.head) {
  document.querySelector('html').appendChild(document.createElement('head'));
}

const realJS = document.createElement('script');
realJS.src = 'http://localhost:18003/background/index.dev.js';
realJS.type = 'module';
document.head.appendChild(realJS);
