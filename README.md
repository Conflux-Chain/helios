[![NodeJS CI](https://github.com/Conflux-Chain/helios/actions/workflows/nodejs.yaml/badge.svg?branch=dev)](https://github.com/Conflux-Chain/helios/actions/workflows/nodejs.yaml) [![codecov](https://codecov.io/gh/Conflux-Chain/helios/branch/dev/graph/badge.svg?token=Pv1R4q8svn)](https://codecov.io/gh/Conflux-Chain/helios)

# Fluent Browser Extension

Fluent supports Chrome, Firefox and Edge. You can install in:

- [Chrome](https://chromewebstore.google.com/detail/fluent/eokbbaidfgdndnljmffldfgjklpjkdoi)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/fluentwallet/)
- [Edge](https://microsoftedge.microsoft.com/addons/detail/fluent/ldddehjcggepmlipdbempbnjehjehchh)

# Setup Environment

1. Install Node.js You can install Node.js from [here](https://nodejs.org/en/download). We use the current LTS version.

2. Install clojure

   1. Install java

      Macos

      ```bash
      brew install --cask temurin@21
      ```

      Ubuntu

      ```bash
      sudo apt install openjdk-21-jdk
      ```

   2. Install Clojure

      Macos

      ```bash
       brew install clojure/tools/clojure
      ```

      Ubuntu, Ensure that the following dependencies are installed: bash, curl, rlwrap, and Java.

      ```bash
      curl -L -O https://github.com/clojure/brew-install/releases/latest/download/linux-install.sh
      chmod +x linux-install.sh
      sudo ./linux-install.sh
      ```

      About more install information you can find in here:https://clojure.org/guides/install_clojure#_linux_instructions

   3. Run yarn install to install the dependencies

   ```bash
   yarn install
   ```

# Development

Build the development version you can run:

- For Chrome: `yarn dev:chrome`

- For Firefox: `yarn dev:firefox`

- For Edge: `yarn dev:edge`

This will watch and build the extension in the `dist/firefox` , `dist/chrome` and `dist/edge` folder.

# Production

Build the production version you can run:

- For Chrome: `yarn build:chrome`

- For Firefox: `yarn build:firefox`

- For Edge: `yarn build:edge`

This will build the extension in the `dist/firefox` , `dist/chrome` and `dist/edge` folder.
