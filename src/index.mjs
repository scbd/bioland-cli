import { notifyDone, runTask} from './util/cli-feedback.mjs'
import * as tasks from './tasks/index.mjs'


export const init = async (branch, isForkedProcess) => {

  await (runTask(branch, isForkedProcess))(tasks.initDdevConfig, 'writeDdevConfig')
  await (runTask(branch, isForkedProcess))(tasks.initDrushConfig, 'initDrushConfig')
  await (runTask(branch, isForkedProcess))(tasks.initSites, 'initSites')
  await (runTask(branch, isForkedProcess))(tasks.initDockerOverride, 'initDockerOverride')
  await (runTask(branch, isForkedProcess))(tasks.initDns, 'initDns')
  
  notifyDone(isForkedProcess)()
}

