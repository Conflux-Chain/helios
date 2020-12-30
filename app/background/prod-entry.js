if (!document.head) {
  document.querySelector("html").appendChild(document.createElement("head"));
}

const background = document.createElement("script");
background.src = "background/index.js";
background.type = "module";
document.head.appendChild(background);
