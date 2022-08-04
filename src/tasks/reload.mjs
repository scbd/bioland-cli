import { notifyDone        , runTask } from '../util/cli-feedback.mjs'
import { initDdevConfig              } from './reload/ddev-config.mjs'
import { initDrushConfig             } from './reload/drush-config.mjs'
import { initSites                   } from './reload/sites.mjs'
import { initDockerOverride          } from './reload/docker-override.mjs'

export default async (branch, args = []) => {

  await (runTask(branch))(initDdevConfig,     'writeDdevConfig')
  await (runTask(branch))(initDrushConfig,    'initDrushConfig')
  await (runTask(branch))(initSites,          'initSites')
  await (runTask(branch))(initDockerOverride, 'initDockerOverride')

  notifyDone()()
  process.exit(0)
}