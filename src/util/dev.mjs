import consola from 'consola'
import { execSync } from 'child_process'
import { notifyDone } from './cli-feedback.mjs'

export const ensureDev = async () => {

    const name         = execSync('hostname').toString()
    const isDevServer  = name.includes('dev')
    const isProdServer = name.includes('bioland-us')

    if(isDevServer &&  !isProdServer) return

    consola.error('Error: trying to seed dev sites not on dev server')

    notifyDone()();
    process.exit(-1)
}

export const isDev = function () { return process.argv.includes('-d') }