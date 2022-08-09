import consola from 'consola'
import config from './config.mjs'

export const forEachSite = async(taskFunction) => {

    const { siteCodes } = config

    for (const siteCode of siteCodes)
        await taskFunction(siteCode)
}

export const forEachTestSite = async(taskFunction) => {

    const { sites, siteCodes } = config

    const testSites = siteCodes.filter( (code) => sites[code].environment === 'test')

    for (const siteCode of testSites)
        await taskFunction(siteCode)
}

export const forEachProductionSite = async(taskFunction) => {

    const { sites, siteCodes } = config

    const prodSites = siteCodes.filter( (code) => !sites[code].environment)
    
    for (const siteCode of prodSites)
        await taskFunction(siteCode)
}

export const forEachPtkMigratedSite = async(taskFunction) => {

    const sites = 'cf cg et ga iq km ml mr mu rw sd tz ye zm'.split(' ')

    for (const siteCode of sites){
        // consola.error(siteCode)
        taskFunction(siteCode)
    }

}
