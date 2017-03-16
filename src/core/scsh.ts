/*
 * scsh - "It's kinda like bash but for Screeps"
 *
 * scsh is a simple, pluggable command line tool for Screeps. This allows you
 * to run commands from the Screeps console, for example:
 *
 * scsh("print Hello!");
 */

export default (str: string) => {
  let arr = str.trim().split(" ");
  let cmd = arr[0];
  let argv = arr.splice(1);

  let process = require("core.scsh." + cmd);

  if (process) {
    process(argv);
  }
};
