/*
 * Screeps Profiler for TypeScript
 *
 * Originally written by ricochet1k, refined by resir014.
 * https://screeps.slack.com/files/ricochet1k/F3S038L3Y/profile_ts.txt
 */

import { log } from "../logger/log";

let Profiler: { [key: string]: FunctionProfile } = {};

interface FunctionProfile {
  name: string;
  calls: number;
  totalTime: number;
  longest: number;
}

interface MemProfile {
  ticks: number;
  fns: { [key: string]: MemFunctionProfile };
}

interface MemFunctionProfile {
  name: string;
  ticks: number;
  calls: number;
  totalTime: number;
  longest: number;
}

function recordCall(name: string, time: number) {
  let p = Profiler[name];
  if (!p) {
    Profiler[name] = p = {
      name,
      calls: 0,
      totalTime: 0,
      longest: 0,
    };
  }

  p.calls += 1;
  p.totalTime += time;
  if (time > p.longest) {
    p.longest = time;
  }
}

/**
 * Start profiling. Include at the very beginning of your game loop.
 */
export function startProfiling() {
  Profiler = {};
  recordCall("startup", Game.cpu.getUsed());
}

/**
 * Save the profiler stats into the memory. Include at the end of your game loop.
 */
export function saveProfilerStats() {
  let mp = Memory.profiler as MemProfile;
  if (!mp) {
    mp = Memory.profiler = {
      ticks: 0,
      fns: {},
    };
  }

  Memory.profiler.ticks += 1;

  for (let pname in Profiler) {
    let p = Profiler[pname];
    let pmem = mp.fns[pname];
    if (!pmem) {
      pmem = mp.fns[pname] = {
        name: pname,
        ticks: 0,
        calls: 0,
        totalTime: 0,
        longest: 0,
      };
    }

    pmem.name = pname;
    pmem.ticks += 1;
    pmem.calls += p.calls;
    pmem.totalTime += p.totalTime;
    pmem.longest += p.longest;
  }
}

/**
 * Print the latest profiler stats into the console.
 */
export function printProfilerStats() {
  let profiles = <FunctionProfile[]> _.sortBy(_.values(Profiler), (p: FunctionProfile) => -p.totalTime);
  let output = [];
  output.push(`<style>
    table.profile {
      border-spacing: 5px;
    }

    table.profile td, table.profile th {
      padding: 0 2px;
      border: 1px solid #212121;
    }
  </style>`.replace(/\n/g, ""));
  output.push(`<table class="profile">`);
  output.push("<tr><th colspan=5>", "Profile data for ", Game.time, "</th></tr>");
  output.push("<tr>",
    "<th>", "Name", "</th>",
    "<th>", "Calls", "</th>",
    "<th>", "Total", "</th>",
    "<th>", "/call", "</th>",
    "<th>", "longest", "</th>",
    "</tr>");
  for (let profile of profiles) {
    let perCall = profile.totalTime / profile.calls;
    output.push("<tr>",
      "<td>", profile.name, "</td>",
      "<td>", profile.calls, "</td>",
      "<td>", profile.totalTime.toFixed(2), "</td>",
      "<td>", perCall.toFixed(2), "</td>",
      "<td>", profile.longest.toFixed(2), "</td>",
      "</tr>");
  }
  output.push("</table>");

  log.info(output.join(""));
}

(global as any).printMemProfilerStats = function () {
  let mp = Memory.profiler as MemProfile;
  let profiles = _.sortBy(
    _.values(mp.fns),
    (p: MemFunctionProfile) => -p.totalTime
  ) as MemFunctionProfile[];
  let ticks = mp.ticks;
  let output = [];
  output.push(`<style>
    table.profile {
      border-spacing: 5px;
    }

    table.profile td, table.profile th {
      padding: 0 2px;
      border: 1px solid #212121;
    }
  </style>`.replace(/\n/g, ""));
  output.push(`<table class="profile">`);
  output.push("<tr><th colspan=5>", "Profile data over ", ticks, " ticks</th></tr>");
  output.push("<tr>",
    "<th>", "Name", "</th>",
    "<th>", "Calls/T", "</th>",
    "<th>", "Total/T", "</th>",
    "<th>", "/call", "</th>",
    "<th>", "longest/T", "</th>",
    "</tr>");
  for (let profile of profiles) {
    // let perTick = profile.ticks / ticks;
    let calls = profile.calls / ticks;
    let perCall = profile.totalTime / profile.calls;
    let total = profile.totalTime / ticks;
    let longest = profile.longest / ticks;
    output.push("<tr>",
      "<td>", profile.name, "</td>",
      "<td>", calls.toFixed(2), "</td>",
      "<td>", total.toFixed(2), "</td>",
      "<td>", perCall.toFixed(2), "</td>",
      "<td>", longest.toFixed(2), "</td>",
      "</tr>");
  }
  output.push("</table>");

  log.info(output.join(""));
};

/**
 * The profile decorator.
 *
 * Include it on top of the function you want to measure as a decorator, like so:
 *
 *     class MyProfiledClass {
 *       // ...
 *       @profile
 *       public someExpensiveFunction() {
 *         //...
 *       }
 *     }
 *
 * @param {any} target The target function.
 * @param {string} propertyKey The property key.
 * @param {TypedPropertyDescriptor<T>} descriptor The property descriptor.
 */
export function profile<T extends Function>(target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<T>) {
  let _fn = descriptor.value;
  if (!_fn) {
    console.log("descriptor.value is empty?", target, propertyKey, descriptor);
    return;
  }

  let fn: T = _fn; // this shouldn't be necessary?
  let targetName = "";
  if (target.name) {
    targetName = target.name;
  } else if (target.constructor) {
    targetName = target.constructor.name;
  }

  let profileName = targetName + "." + propertyKey;
  descriptor.value = profileWrap(profileName, fn);
}

/**
 * Profile a wrapped function. Example usage:
 *
 *     import { profileFn } from "path/to/profile";
 *
 *     profileFn(wrappedFunction);
 *
 * @param {T} fn The target function.
 */
export function profileFn<T extends Function>(fn: T): T {
  return profileWrap(fn.name, fn);
}

function profileWrap<T extends Function>(profileName: string, fn: T): T {
  let f = (function wrapper(this: any) {
    let cpuStart = Game.cpu.getUsed();
    let ret = fn.apply(this, arguments);
    let cpuEnd = Game.cpu.getUsed();
    recordCall(profileName, cpuEnd - cpuStart);
    return ret;
  });

  Object.defineProperty(f, "name", { value: fn.name });
  Object.defineProperty(f, "length", { value: fn.length });

  return <T> <any> f;
}
