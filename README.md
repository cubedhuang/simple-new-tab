# Simple New Tab

A minimalistic, configurable new tab page. Works with Chromium-based browsers and Firefox.

Install it from the [Chrome Web Store](https://chrome.google.com/webstore/detail/simple-new-tab/knjgndjhindbbphlfnaagilhcjciehaf) or [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/minimalistic-new-tab/).

![The new tab page with a quote, links, a todo list, notes, the clock, weather, tab stats and Discord status](docs/main.png)

## Features

- Customizable colors! Use a preset theme or craft your own.
- Organize your links into sections and columns.
- Stay on top of your todos and notes.
- A new quote every time you open a new tab.
- Clock with the current local time.
- Weather information in your area or a city you choose, powered by [Open-Meteo](https://open-meteo.com/) and [BigDataCloud](https://www.bigdatacloud.com/).
- Stats on how many tabs you've opened.
- Your Discord status at a glance.
- Show or hide anything you don't need.
- Import and export your settings.

See the [changelog](CHANGELOG.md) changes in recent versions.

## Screenshots

### Settings

![The settings panel with tweaks, fonts, color themes and clock options](docs/settings.png)

### Link editor

![The link editor with draggable sections, links and todos in columns](docs/links.png)

### Colors

![The theme list and the OKLCH color picker](docs/colors.png)

### Import and export

![Weather, Discord, and save and load settings](docs/import-export.png)

## Build

For reviewers: releases are built on macOS 27 (arm64) with:

- [Node.js](https://nodejs.org/) 24.21.0
- [pnpm](https://pnpm.io/) 12.9.0, installed with `npm install -g pnpm@12.9.0`
- `zip` 3.0, only needed for `pnpm zip`

To build the extension:

1.  Clone the repository.
2.  Run `pnpm i --frozen-lockfile` to install dependencies.
3.  Run `pnpm build` to build the extension into `/dist`.
4.  Load the extension from `/dist` as an unpacked extension into your browser.

To package a release, run `pnpm zip` to build and zip the extension, and `pnpm zip:source` to zip the source code.

## Develop

1.  Clone the repository.
2.  Run `pnpm i` to install dependencies.
3.  Run `pnpm dev` to start a local development server.
