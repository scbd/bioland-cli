import   Handlebars                from 'handlebars'
import   config                    from '../../util/config.mjs'
import   fs                        from 'fs-extra'
import { readTemplate, writeFile } from '../../util/files.mjs'
import { sitesCtx     }            from '../../util/context.mjs'
import { getIsoAlpha3     }            from '../../util/countries.mjs'
import { execSync     }            from 'child_process'

const HB = Handlebars.create()

export const initSites = () =>{

  const { name, sites } = config

  execSync(`mkdir -p ${sitesCtx}`)

  createSettingsCommon()
  writeFile(sitesCtx, `sites.php`, getSitesPhpTemplate(name, sites))
  createSitesDirectories()
}

function createSettingsCommon(){
  const template = HB.compile(readTemplate('settings.common.local.php').toString())

  execSync(`mkdir -p ${sitesCtx}/_common/`)
  fs.ensureFileSync(`${sitesCtx}/_common/settings.common.local.php`)

  writeFile(`${sitesCtx}/_common/`, `settings.common.local.php`, template(config))
}

function createSitesDirectories(){
  const { sites } = config
  const template  = HB.compile(readTemplate('settings.php').toString())

  for (const code in sites) {
    fs.ensureDirSync(`${sitesCtx}/${code}`)
    fs.ensureFileSync(`${sitesCtx}/${code}/settings.php`)
    // cpLogo(code, sites[code])
    const chmGovernment = getIsoAlpha3(code)

    writeFile(`${sitesCtx}/${code}`, `settings.php`, template({...sites[code], code, chmGovernment }))
  }
}

function getSitesPhpTemplate(name, sites){
  let templateString = ''

  for (const code in sites) {
    templateString += `$sites["${code}.chm-cbd.net"] = "${code}";\n`;
    templateString += `$sites["${code}.test.chm-cbd.net"] = "${code}";\n`;
    if(sites[code].redirectTo)  templateString += `$sites["${sites[code].redirectTo}"] = "${code}";\n`;
    if(sites[code].urls)
      for (const baseUrl of sites[code].urls) 
        templateString += `$sites["${baseUrl}"] = "${code}";\n`

    templateString += `\n`
  }

  return `<?php
${templateString}
`
}
