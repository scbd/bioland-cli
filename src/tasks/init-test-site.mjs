import { notifyDone, runTask } from '../util/cli-feedback.mjs'
import { execSync   }          from 'child_process'
import { webCtx     }          from '../util/context.mjs'
import { initNewTestSite } from '../util/index.mjs'
import   consola               from 'consola'

export default async(branch, args) => {
consola.error(args)
  if(args[1]) args[1] = false
  if(args.length)
    await (runTask(branch))(init, `${branch.toUpperCase()}: Initiating test site: ${args[0]}`, args)

  notifyDone()()
  process.exit(0)
}


async function init(site) {
  

  console.log('')
  consola.info(`Site: ${site} -> initiating new test site`)

  try{
    await initNewTestSite(site)

    execSync(`cd ${webCtx}`)
    execSync(`ddev drush @${site} cr`)

    console.log('')
    consola.info(`${site}: cache rebuilt`)
  }catch(e){
    consola.error(`${site}: initiating new test site`, e)
  }

}