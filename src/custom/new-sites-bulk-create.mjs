import consola from 'consola'
import { execSync  }          from 'child_process'

export default async (branch, commandArgs, { Util }) => {

    const allSites  = ['am','bd','dz','er','ge','gq','il','kn','kp','li','lt','mc','me','mk','mz','pt','sb','sm','sn','so','st','tj','tl','tm','tr','ua','us','vu',] // ['af','ag','ar','db','bo','bn','bz','ck','kr','dm','ec','fj','ki','kg','fm','mn','nr','np','nu','pg', 'py', 'qa','vc','sr','pa']
    const done      = []//['af']
    const sites     = allSites.filter((x)=> !done.includes(x))

    
    for (const countryCode of sites ){
        consola.error(countryCode)
        await Util.initNewTestSite(countryCode)

        
        console.log('')
        consola.info(`Site: ${countryCode} -> Data syncing`)
    
        console.log('')
        consola.info(`Site: ${countryCode} -> Data syncing NBSAPS ...`)
    
        await Util.syncNbsaps(countryCode, { deleteOnly: false }) //forceCountry: 'ph', 
    
        console.log('')
        consola.success(`Site: ${countryCode} -> Data syncing NBSAPS`)
    
        console.log('')
        consola.info(`Site: ${countryCode} -> Data syncing National Reports ...`)
    
        await Util.syncNationalReports(countryCode, { deleteOnly: false })
    
        console.log('')
        consola.success(`Site: ${countryCode} -> Data syncing National Reports`)
    
        console.log('')
        consola.info(`Site: ${countryCode} -> Data syncing National Targets ...`)
    
        await Util.syncNationalTargets(countryCode, {  deleteOnly: false })  //forceCountry: 'ph', 
    
        console.log('')
        consola.success(`Site: ${countryCode} -> Data syncing National Targets`)

        execSync(`cd ${Util.webCtx}`)
        execSync(`ddev drush @${countryCode} cr`)

        done.push(countryCode)

        consola.warn(done)
    }
}
