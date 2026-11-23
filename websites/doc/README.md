# Website

This website uses [Docusaurus 3](https://docusaurus.io/), MDX 3, and React 18. Yarn installs the site's dependencies inside the `doc` workspace; the wallet and browser extension still use React 17. Keep the `doc/react` and `doc/react-dom` resolutions ahead of the wallet-wide defaults.

## Installation

```console
yarn install
```

## Local Development

```console
yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

## Build

```console
yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## Deployment

```console
GIT_USER=<Your GitHub username> USE_SSH=true yarn deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.
