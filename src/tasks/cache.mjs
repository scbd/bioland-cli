import { notifyDone, runTask } from '../util/cli-feedback.mjs'
import { execSync   }          from 'child_process'
import   config                from '../util/config.mjs'
import { webCtx     }          from '../util/context.mjs'
import   consola               from 'consola'

export default async(branch, args) => {

  if(args.length)
    await (runTask(branch))(cache, `${branch.toUpperCase()}: Rebuilding cache site: ${args[0]}`, args)
  else
    await (runTask(branch))(cacheAll, `${branch.toUpperCase()}: Rebuilding cache  ALL sites`)

  notifyDone()()
  process.exit(0)
}

function cacheAll() {
  const { sites } = config

  execSync(`cd ${webCtx}`)

  for (const site in sites)
    cache( site)
}


function cache(site) {
  execSync(`cd ${webCtx}`)

  console.log('')
  consola.info(`Site: ${site} -> rebuilding cache`)

  try{
    execSync(`ddev drush @${site} cr`)

    console.log('')
    consola.info(`${site}: cache rebuilt`)
  }catch(e){
    consola.error(`${site}: cache rebuild error`, e)
  }

}