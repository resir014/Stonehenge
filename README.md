# Stonehenge

> Next-generation AI scripts for the game [Screeps](https://screeps.com/). Written in [TypeScript](http://www.typescriptlang.org/).

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

Stonehenge is a next-generation AI system for the game [Screeps](https://screeps.com/). It is developed in [TypeScript](https://www.typescriptlang.org/), and designed with modularity in mind.

## Table of Contents

* [Design Principles](#design-principles)
* [Quick Start](#quick-start)
* [Configuration](#configuration)
* [Testing](#testing)
* [Notes](#notes)
* [To-Do](#to-do)

## Design Principles

### Maintainability

The codebase has to be simple and easily readable in order for the code to be easily built upon. In this case, the code quality is kept to a high standard and every part of the Stonehenge codebase is painstakingly documented to improve the readability and maintainability.

### Modularity

Stonehenge acts as the "core engine" which drives the modular game logic. The `Orchestrator` object contains a shared API used for colony-wide managerial tasks, which allows each colony to be independently managed if need be. A common class structure is also established to improve modularity.

### Configuration over Convention

Anyone who wants to build their Screeps colony with with Stonehenge must not be forced to follow conventions beyond the initial setup. The configurations available in the `config/` folder will allow you to fine-tune the codebase according to your workflow and needs.

## Quick Start

### Requirements

* [Node.js](https://nodejs.org/en/) (latest LTS is recommended)
* [Yarn](https://yarnpkg.com/en/) - Optional. You can use `npm` if you don't want to, but this is for your own sanity.

For testing **NOTE** _Testing is currently a work-in-progress_:

* [Mocha](https://mochajs.org/) test runner and [NYC](https://istanbul.js.org/) for code coverage - `yarn global add nyc mocha`

### Download

To get started, [download a zipped copy](https://github.com/screepers/screeps-typescript-starter/archive/master.zip) of the starter kit and extract it somewhere, or clone this repo.

### Install all required modules!

Run the following the command to install the required packages and TypeScript declaration files if you are using yarn:

```bash
$ yarn
```

or, for npm:

```bash
$ npm install
```
### Configure Screeps credentials

Create a copy of `config/credentials.example.json` and rename it to `config/credentials.json`.

**WARNING: DO NOT** commit this file into your repository!

```bash
# config/credentials.json
$ cp config/credentials.example.json config/credentials.json
```

In the newly created `credentials.json` file, change the `email` and `password` properties with your Screeps credentials.  The `serverPassword`, `token`, and `gzip` options are only for private servers that support them.  If you are uploading to the public Screeps server, you should delete these fields from your credentials file.

See [Configuration](#configuration) for more in-depth info on configuration options.

### Run the compiler

```bash
# To compile and upload your TypeScript files on the fly in "watch mode":
$ npm start

# To compile and deploy once:
$ npm run deploy
```

### Post-Deploy

After deploying, you should manually set the build priorities for your rooms. Go to your respective room's memory in the memory tree, go to `jobs`, and set the number of creeps you'd like each role.

(TBA) If you have `manualJobControl` set to `false`, the core engine will procedurally generate job assignments based on the room's conditions.

## Testing

### Running Tests

**WARNING** _Testing functionality is currently not finished in the 2.0 build of the Starter.

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

## To-Do

List of things that need to be finished.

### High-Priority Tasks

* `scsh` (command-line for the Screeps console)
* Write tests.
* Actual defensive/war code
* Creep State code
* Controlled room job assignments:
  * Defender
  * Mineral miners
* Reserved rooms
  * Colony management logic
  * Job assignments
    * Scout
    * Reserver
    * Remote builder
    * Remote harvester
    * Remote hauler
    * Remote upgrader
    * Remote defender

### Future Ideas

These might not be implemented in the near future, but we thought these would be cool things to have in the codebase.

* Improved job system.
* Create a robust core engine which manages job assignment, structure priority, etc.
* Look into implementing a Redux-like flow for Screeps.
* Migration support (no more cleaning up your entire field before deploying).
* Write up a proper documentation of code.

## Contributing

Issues and Pull Requests are welcome! Please read the [Contributing Guidelines](CONTRIBUTING.md) beforehand.

## Special Thanks

[Marko Sulamägi](https://github.com/MarkoSulamagi), for the original [Screeps/TypeScript sample project](https://github.com/MarkoSulamagi/Screeps-typescript-sample-project).
