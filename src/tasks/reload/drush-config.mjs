import   Handlebars                from 'handlebars'
import   config                    from '../../util/config.mjs'
import { readTemplate, writeFile } from '../../util/files.mjs'
import { drushSites   }            from '../../util/context.mjs'
import { execSync     }            from 'child_process'

const HB = Handlebars.create()

export const initDrushConfig = function (){

  const isDev = Object.values(arguments).includes('-d')

  const fileName  = isDev? 'drush.site.dev.yml' : 'drush.site.yml'
  const template  = HB.compile(readTemplate(fileName).toString())
  const { sites } = config

  execSync(`mkdir -p ${drushSites}`)

  for (const code in sites)
    writeFile(drushSites, `${code}.site.yml`, template({code}))

}