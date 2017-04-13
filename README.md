# Stonehenge

> Next-generation AI scripts for the game [Screeps](https://screeps.com/). Written in [TypeScript](http://www.typescriptlang.org/).

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

Stonehenge is a next-generation AI system for the game [Screeps](https://screeps.com/). It is developed in [TypeScript](https://www.typescriptlang.org/), and designed with modularity in mind.

## Table of Contents

* [Design Principles](#design-principles)
  * [Maintainability](#maintainability)
  * [Modularity](#modularity)
  * [Configuration over Convention](#configuration-over-convention)
* [Getting Started](#getting-started)
  * [Requirements](#requirements)
  * [Quick Setup](#quick-setup)

## Design Principles

### Maintainability

The codebase has to be simple and easily readable in order for the code to be easily built upon. In this case, the code quality is kept to a high standard and every part of the Stonehenge codebase is painstakingly documented to improve the readability and maintainability.

### Modularity

Stonehenge acts as the "core engine" which drives the modular game logic. The `Orchestrator` object contains a shared API used for colony-wide managerial tasks, which allows each colony to be independently managed if need be. A common class structure is also established to improve modularity.

### Configuration over Convention

Anyone who wants to build their Screeps colony with with Stonehenge must not be forced to follow conventions beyond the initial setup. The configurations available in the `config/` folder will allow you to fine-tune the codebase according to your workflow and needs.

## Getting Started

### Requirements

* [Node.js](https://nodejs.org/en/) (v4.0.0+)
* Gulp 4.0+ - `sudo npm install -g gulpjs/gulp.git#4.0`

For testing:
* [Mocha](https://mochajs.org/) test runner and [NYC](https://istanbul.js.org/) for code coverage
    `sudo npm install -g nyc mocha`

### Quick Setup

First, clone and install the submodules.

```bash
$ git clone https://github.com/resir014/screeps.git
$ git submodule update --init
```

Then, you will have to set up your config files. Create a copy of `config.example.json` and rename it to `config.json`. Then navigate into the `src/config` directory, reate a copy of `config.example.ts` and rename it to `config.ts`.

```bash
# config.json
$ cp config.example.json config.json

# config/config.ts
$ cd src/config
$ cp config.example.ts config.ts

# Do the same for the rest of the config files
```

Then, on the `config.json` file, change the `username` and `password` properties with your Screeps credentials.

The `config.json` file is where you set up your development environment. If you want to push your code to another branch, for example, if you have some sort of a staging branch where you test around in Simulation mode, we have left a `branch` option for you to easily change the target branch of the upload process. The `default` branch is set as the default.

The `src/config/config.ts` file is where you store your code-specific config variables. For example, if you want to easily turn on `PathFinder` when needed, you can set your own variable here. Once you've set up your configs, import the `config.ts` file on the file you want to call these configs at:

```js
import * as Config from "../path/to/config";
```

Then simply call the config variables with `Config.CONFIG_VARIABLE`.

**WARNING: DO NOT** commit these files into your repository!

### Installing npm modules

Then run the following the command to install the required npm packages and TypeScript type definitions.

```bash
$ npm install
```

### Running the compiler

```bash
# To compile your TypeScript files on the fly
$ npm start

# To deploy the code to Screeps
$ npm run deploy
```

You can also use `deploy-prod` instead of `deploy` for a bundled version of the project, which has better performance but is harder to debug.

`deploy-local` will copy files into a local folder to be picked up by steam client and used with the official or a private server.

## Testing

### Running Tests

To enable tests as part of the build and deploy process, flip the `test` flag in your `config.json` to `true`.

You can always run tests by running `npm test`. You can get a code coverage report by running
`npm test:coverage`. Then opening `coverage/index.html` in your browser.

### Writing Tests

All tests should go in the `test/` directory and end in the extension `.test.ts`.

All constants are available globally as normal.

The game state is no simulated, so you must mock all game objects and state that your code requires.
As part of this project, we hope to provide some helpers for generating game objects.

It is recommended to test the smallest pieces of your code at a time. That is, write tests that
assert the behavior of single, small functions. The advantages of this are:

1. less mocking to setup and maintain
2. allows you to test behavior, not implementation

See [test/components/creeps/creepActions.test.ts](test/components/creeps/creepActions.test.ts) as
an example on how to write a test, including the latest game object mocking support.

For writing assertions we provide [chai](http://chaijs.com). Check out their
[documentation](http://chaijs.com/guide/styles/) to learn how to write assertions in your tests.

**Important:** In your tests, if you want to use lodash you must import it explicitly to avoid errors:

```js
import * as _  from "lodash"
```

---

## How It Works

More documentation coming soon.

---

## Contributing

Issues and Pull Requests are welcome! Please read the [Contributing Guidelines](CONTRIBUTING.md) beforehand.

## Special thanks

[Marko Sulamägi](https://github.com/MarkoSulamagi), for the original [Screeps/TypeScript sample project](https://github.com/MarkoSulamagi/Screeps-typescript-sample-project).
