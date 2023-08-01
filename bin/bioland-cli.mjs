#!/usr/bin/env node
import { fork } from 'child_process';
import { resolve } from 'path';

import { startFeedback, endFeedback, startTaskInfo, endTaskInfo, taskError } from '../src/util/cli-feedback.mjs';
import { context, getCommand, getBranch } from '../src/util/index.mjs';

const src = resolve(context, 'node_modules/bioland-cli/src/');

runCommand();

function runCommand () {
  const theCommand = getCommand();

  startFeedback(`BIOLAND-CLI: ${getBranch().toUpperCase()} => ${theCommand}`);

  runChildProcess(getCommand({ paramCase: true }));
}

function runChildProcess (theCommand) {
  const isCustom = theCommand === 'custom';
  const scriptPathToFork = isCustom ? `${src}/child-processes/custom.mjs` : `${src}/child-processes/index.mjs`;

  return forkScript(scriptPathToFork);
}

function forkScript (scriptPathToFork) {
  const { DEBUG } = process.env;
  const env = { ...process.env, BL_CONFIG_CONTEXT: context };
  const argv = process.argv.slice(2);
  const options = { cwd: context, env };

  if (DEBUG) options.stdio = 'inherit';

  const forked = fork(scriptPathToFork, ['--trace-warnings', ...argv], options);

  initChildProcessApi(forked);
}

function initChildProcessApi (forked) {
  let toggle = true;
  let done = false;

  forked.on('message', (text) => {
    if (done) return; // do nothing else if done

    if (text === 'done') { // child tells parent they are done
      done = true;
      return endFeedback();
    }

    // child can only tell parent it is starting or ending a task
    if (toggle) { // starting task named text
      startTaskInfo(text);
      toggle = !toggle;
      return;
    }
    // ending task named text
    endTaskInfo(text);
    toggle = !toggle;
  });

  forked.on('error', (error) => {
    taskError(error);
    done = true;
    throw error;
  });
}
