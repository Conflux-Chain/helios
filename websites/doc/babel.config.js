module.exports = {
  presets: [require.resolve('@docusaurus/core/lib/babel/preset')],
  ignore: [
    /shadow-cljs/,
    /cljs/,
    /cljs-runtime/,
    /packages\/spec/,
    /doc-ui\/useSpec/,
    /doc-ui\/useRPC/,
    /packages\/rpcs/,
  ],
}
