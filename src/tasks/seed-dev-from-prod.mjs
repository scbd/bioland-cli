import { notifyDone        , runTask } from '../util/cli-feedback.mjs'
import { initDdevConfig              } from './reload/ddev-config.mjs'
import { initDrushConfig             } from './reload/drush-config.mjs'
import { initSites                   } from './reload/sites.mjs'
import { initDockerOverride          } from './reload/docker-override.mjs'
import { ensureDev, isDev     }            from '../util/dev.mjs'
import { execSync } from 'child_process'
import   config                    from '../util/config.mjs'
import consola from 'consola'

export default async (branch, args = []) => {
  await ensureDev()

  if(!isDev(args)) args[0]= '-d'

  await (runTask(branch))(initDdevConfig,     'writeDdevConfig'   , args)
  await (runTask(branch))(initDrushConfig,    'initDrushConfig'   , args)
  await (runTask(branch))(initSites,          'initSites'         , args)
  await (runTask(branch))(initDockerOverride, 'initDockerOverride', args)
  await (runTask(branch))(seed,               'seedDevFromProd'   , args)

  notifyDone()()
  process.exit(0)
}

async function seed (branch, commandArgs) {
  const sites = JSON.parse(JSON.stringify(config.siteCodes))

  execSync('cd /home/ubuntu/bioland')

  for (const countryCode of sites ){
      execSync(`if test -f /home/ubuntu/efs-prod/bk-latest/${countryCode}-latest.sql.gz; then gunzip -fq /home/ubuntu/efs-prod/bk-latest/${countryCode}-latest.sql.gz; fi`)
      execSync(`ddev drush @${countryCode} sql:cli < /home/ubuntu/efs-prod/bk-latest/${countryCode}-latest.sql`)

      const destination = `/home/ubuntu/bioland/web/sites/${countryCode}`
      const archive     = `/home/ubuntu/efs-prod/bk-latest/${countryCode}-latest-files.tgz`

      execSync(`tar -xf ${archive} -C ${destination}`)

      consola.info(`Dev site ${countryCode}: files and sql loaded`)
  }

  consola.info(`Updating route 53 DNS on all test sites`)

  await upsertAllDevDnsRecord()

  consola.info(`DNS updated on all dev sites: `, sites.length)
}