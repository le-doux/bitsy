# Bitsy Documentation

This website is built using [Docusaurus 2](https://docusaurus.io/), a modern static website generator.

## Development

### Installation

1. Install [node/npm](https://nodejs.org)
2. Open this directory in the command line
3. Run `npm install`

### Local Development

```sh
npm start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

To work on a specific locale (e.g. French), use the following command line parameters:

```sh
npm start -- --locale fr
```

Original documentation files are stored in the [`docs`](./docs/) folder, and localized documentation files are stored in [`i18n`](./i18n/) under a folder with that locale's name.

### Build

```sh
npm build
```

This command generates static content into the `build` directory.
