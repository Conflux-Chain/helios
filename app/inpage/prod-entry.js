if (!document.head) {
  document.querySelector("html").appendChild(document.createElement("head"));
}

const inpage = document.createElement("script");
inpage.src = "inpage/index.js";
inpage.type = "module";
document.head.appendChild(inpage);
