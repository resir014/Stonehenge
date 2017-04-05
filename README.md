# Stonehenge

> Next-generation AI scripts for the game [Screeps](https://screeps.com/). Written in [TypeScript](http://www.typescriptlang.org/).

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

Stonehenge is a next-generation AI system for the game [Screeps](https://screeps.com/). It is developed in [TypeScript](https://www.typescriptlang.org/), and designed with modularity in mind.

## Design Principles

### Maintainability

The codebase has to be simple and easily readable in order for the code to be easily built upon. In this case, the code quality is kept to a high standard and every part of the Stonehenge codebase is painstakingly documented to improve the readability and maintainability.

### Modularity

Stonehenge acts as the "core engine" which drives the core modules that are needed to run a simple Screeps colony. All of these modules can be easily activated/deactivated according to your needs. It also provides a simple module API, allowing for players to develop their own custom modules.

### Configuration over Convention

**(debatable)** Anyone who wants to build their Screeps colony with with Stonehenge must not be forced to follow conventions beyond the initial setup. The configurations available in the `config/` folder will allow you to fine-tune the codebase according to your workflow and needs.

## Getting Started

### Requirements

* [Node.js](https://nodejs.org/en/) (v4.0.0+)
* Gulp 4.0+ - `sudo npm install -g gulpjs/gulp.git#4.0`

### Quick setup

First, clone and install the submodules.

```bash
$ git clone https://github.com/resir014/screeps.git
$ git submodule update --init
```

Then, you will have to set up your config files. Create a copy of `config.example.json` and rename it to `config.json`. Then navigate into the `src/config` directory, reate a copy of `config.example.ts` and rename it to `config.ts`.

```bash
# config.json
$ cp config.example.json config.json

# config.ts
$ cd src/config
$ cp config.example.ts config.ts
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

---

## How It Works

(WIP: This is a very early, rough description of how the core engine would work and is *definitely* subject to change.)

### The Core Engine

During a whole tick, the Stonehenge core driver engine performs the following:

* Bootstrap modules.
* Run colony logic every tick (and run the underlying modules).
* Track & manage CPU usage via [screeps-profiler](https://github.com/gdborton/screeps-profiler).
* Perform memory clean-up tasks (like removing obsolete Creep memory, etc.)

### Modules

(WIP: These sample codes are still pretty much a work-in-progress.)

Modules play an integral part on the Stonehenge structure. The core Stonehenge engine contains several core modules that performs basic tasks, like creating a creep, etc. Each module exchanges information with each other through the `IModulePayload` and `IModuleResponse` interfaces.

Modules **should** be written in TypeScript.

#### Interfaces & Abstracts

* `IModulePayload` is an object containing all of the module's parameters.
* `IModuleResponse` is the response object that a module throws out. It throws a `ModuleStatus` and an optional `data`.

```ts
// ./typings/module.d.ts
interface IModuleConfig {
  [name: string]: any;
}

interface IModulePayload {
  [name: string]: any;
}

interface IModuleResponse {
  status: ModuleStatus;
  data?: {
    [name: string]: any
  };
}

declare enum ModuleStatus {
  OK = 0,
  ERROR
}
```

```ts
// ./core/module.ts
abstract class Module {
  private className: string;
  private config: IModuleConfig | undefined;

  constructor(className: string, config?: IModuleConfig) {
    this.className = className;
    this.config = config || undefined;
  }

  public abstract run(...args: any[]): IModuleResponse;

  /**
   * Bootstrap the module. Create a memory entry for the module configs if
   * it doesn't exist yet.
   */
  public bootstrap(): void {
    if (!Memory.modules[this.className]) {
      if (this.config) {
        Memory.modules[this.className] = this.config;
      } else {
        Memory.modules[this.className] = {};
      }
    }
  }
}

export default Module;
```

#### Example Scenario

The `creepBuilder` module creates a creep based on a set amount of parameters.

```ts
// ./modules/creepBuilder.ts
import { Module } from "../core/module";

interface IModuleResponse {
  status: number;
  data?: {
    [name: string]: any
  };
}

export default class CreepBuilder extends Module {
  constructor(config?: IModuleConfig) {
    super("bodyPartsBuilder", config);
  }

  public run(payload: IModulePayload): IModuleResponse {
    if (!this.checkPayload(payload)) {
      if (Config.ENABLE_DEBUG_MODE) {
        log.error("[CreepBuilder] Invalid properties are supplied for this module.");
      }
      return {
        status: ModuleStatus.ERROR
      };
    }

    let guid: number = MemoryManager.getGuid();
    let spawn: Spawn = payload.spawn;
    let name: string | undefined = `${payload.room} - ${payload.role}#${guid}`;
    let body: string[] = payload.bodyParts;
    let status: number | string = spawn.canCreateCreep(body);

    status = _.isString(status) ? OK : status;

    if (status === OK) {
      let properties: { [key: string]: any } = {
        guid: guid,
        role: payload.role,
        room: payload.room
      };

      status = spawn.createCreep(body, name, properties);

      let response: IModuleResponse = {
        status: _.isString(status) ? OK : status,
        data: properties
      };
      return response;
    } else {
      if (Config.ENABLE_DEBUG_MODE) {
        log.error("[CreepBuilder] Failed creating new creep: " + status);
      }

      let response: IModuleResponse = {
        status: status
      };
      return response;
    }
  }

  private checkPayload(payload: IModulePayload): boolean {
    let requiredProps = ["spawn", "room", "role", "bodyParts"];
    let payloadKeys = _.intersection(_.keys(payload), requiredProps);

    if (payloadKeys.length === requiredProps.length) {
      return true;
    }

    return false;
  }
}
```

```ts
// ./colony/controlledRoom.ts
import * as MemoryManager from "../core/shared/memoryManager";

import { Colony } from "../core/colony";
import CreepBuilder from "../modules/creepBuilder";

export default class ControlledRoomColony extends Colony {
  constructor(room: Room) {
    super(room);
  }

  // ...

  private buildCreep(spawn: Spawn, role: string, bodyParts: string[]) {
    let payload: IModulePayload = {
      spawn: spawn,
      role: role,
      room: spawn.room.name,
      bodyParts: bodyParts
    };

    new CreepBuilder().run(payload);
  }
}
```

More documentation coming soon.

---

## Contributing

1. [Fork it](https://github.com/screepers/screeps-typescript-starter/fork)
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Create a new Pull Request

## Special thanks

[Marko Sulamägi](https://github.com/MarkoSulamagi), for the original [Screeps/TypeScript sample project](https://github.com/MarkoSulamagi/Screeps-typescript-sample-project).
