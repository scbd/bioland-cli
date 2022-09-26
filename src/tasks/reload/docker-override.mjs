import   Handlebars                from 'handlebars'
import   config                    from '../../util/config.mjs'
import { readTemplate, writeFile } from '../../util/files.mjs'
import { ddev         }            from '../../util/context.mjs'
import { execSync     }            from 'child_process'

const HB = Handlebars.create()

export const initDockerOverride = function (){
  const isDev    = Object.values(arguments).includes('-d')
  const fileName = isDev? 'docker-compose.override.dev.yml' : 'docker-compose.override.yml'

  const template = HB.compile(readTemplate(fileName).toString())

  execSync(`mkdir -p ${ddev}`)
  writeFile(ddev, 'docker-compose.override.yml', template(config))
}