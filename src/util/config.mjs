import   configGit                    from 'bioland-config'
import { getAllUserArgs }             from './commands.mjs'
import { importJsFile  , fileExists } from './files.mjs'

const { BCLI_CONFIG_PATH } = process.env
const { commandArgs }      = getAllUserArgs()

async function getConfigFromFile(){
  const flagIndex  = commandArgs.indexOf('-c')
  const pathIndex  = flagIndex + 1
  const configPath = commandArgs[pathIndex] || BCLI_CONFIG_PATH
  const exists     = fileExists(configPath)

  return exists? (await importJsFile(configPath)).default :  configGit
}


export const config = await getConfigFromFile()

export default await getConfigFromFile()