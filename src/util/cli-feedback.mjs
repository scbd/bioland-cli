import ora from 'ora';
import consola from 'consola';

let spinner;

export const runTask = (branch, isForked = true) => {
  return async (task, text, args = []) => {
    notifyStartTask(isForked)(text);
    await task(...args);
    notifyEndTask(isForked)(text);
  };
};
export const startFeedback = async (text) => {
  spinner = ora({ text, discardStdin: true }).start();
};

export const runTaskAndNotify = (isForked = true) => async (task, text, ...args) => {
  notifyStartTask(isForked)(text);

  if (Array.isArray(task)) { for (const t of task) await t(...args); } else await task(...args);

  notifyEndTask(isForked)(text);
};

export const notifyDone = (isForked = true) => (text = 'done') => {
  if (isForked) return process.send(text);
  return consola.success(text);
};

export const notifyStartTask = (isForked = true) => (text) => {
  if (isForked) return process.send(text);
  return consola.info(text);
};

export const notifyEndTask = (isForked = true) => (text) => {
  if (isForked) return process.send(text);
  return consola.success(text);
};

export const startTaskInfo = async (text) => {
  if (!spinner) return;
  spinner.text = text;
  console.time('time');
  spinner.start();
};

export const taskError = async (text) => {
  if (!spinner) return;
  spinner.fail(text);
  spinner.stop();
  spinner = null;
};

export const endTaskInfo = async (text) => {
  if (!spinner) return;
  spinner.succeed(text + '  ');
  console.timeEnd('time');
  console.log(' ');
};

export const endFeedback = () => {
  spinner.succeed('BIOLAND-CLI: complete');
  spinner.stop();
  spinner = null;
};
