import { notifyDone, runTask } from '../util/cli-feedback.mjs'
import   config                from '../util/config.mjs'
import { context as ctx     }          from '../util/context.mjs'
import { writeFile } from '../util/files.mjs'
import   consola               from 'consola'

export default async(branch, args) => {


    await (runTask(branch))(generateSpList, `${branch.toUpperCase()}: Generating SP list`)

    notifyDone()()
    process.exit(0)
}

function generateSpList() {
    const { siteCodes }        = config
    const serviceProviders = {}


    for (const site of siteCodes){
        const entityId    = getEntityId(site);
        const metaDataUrl = getMetaDataUrl(site);

        serviceProviders[entityId] = metaDataUrl;
    }

    writeFile (ctx, 'spList.js', `export default ${JSON.stringify(serviceProviders)}}`)
}

function getMetaDataUrl(code){
    const isDev  = process.argv.includes('-d')
    const isTest = isTestEnv(code)

    if(hasRedirectTo(code) && !isDev && !isTest) 
        return `https://${hasRedirectTo(code)}/saml/metadata`
    else
        return isDev? `https://${code}.bioland.cbddev.xyz/saml/metadata` : 
                isTest? `https://${code}.test.chm-cbd.net/saml/metadata` : `https://${code}.chm-cbd.net/saml/metadata`

}

function getEntityId(code){
    const isDev = process.argv.includes('-d')
    const isTest = isTestEnv(code)

    if(hasRedirectTo(code) && !isDev && !isTest) 
        return `https://${hasRedirectTo(code)}`
    else
        return isDev? `https://${code}.bioland.cbddev.xyz` : 
                isTest? `https://${code}.test.chm-cbd.net` : `https://${code}.chm-cbd.net`

}

function hasRedirectTo(code){
    return (config?.sites[code] || {})?.redirectTo
}

function isTestEnv(code){
    return (config?.sites[code] || {})?.environment
}

// function writeFile (data) {
//     const cleanData = 'export default ' +JSON.stringify(data)


//     fs.ensureFileSync(`${ctx}/saml/service-providers/bioland/list.js`)
    
//     return fs.writeFileSync(`${ctx}/saml/service-providers/bioland/list.js`, cleanData)
// }