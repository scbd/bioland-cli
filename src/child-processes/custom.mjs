import * as Util from '../util/index.mjs';

runTaskAsChildProcess();

async function runTaskAsChildProcess () {
  const { branch, commandArgs } = Util.getAllUserArgs();
  const [scriptPath] = commandArgs;

  const taskFunction = (await Util.importJsFile(scriptPath)).default;

  await taskFunction(branch, commandArgs.slice(1), { Util });

  Util.notifyDone()();
  process.exit(0);
}
