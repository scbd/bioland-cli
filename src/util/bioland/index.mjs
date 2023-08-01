import { getSiteLocales, getDrupalCountryId } from '../drupal/db.mjs'
import { getConfigObject, setConfigObject, createConfigObject, getDefaultLocale } from '../drupal/drupal-config.mjs'
import { getCountryNameByCode, getCountries } from '../countries.mjs'
import { translate } from '../i18n/index.mjs'
import config from '../config.mjs'
import { webCtx     }          from '../context.mjs'
import consola from 'consola'
import countryTimeZone from 'countries-and-timezones'
import { execSync  }          from 'child_process'
import { patchMenuUri, login, jsonApiGet, patch } from '../drupal/json-api.mjs'
import footerLinks from './footer-menu-content.mjs'
import { backUpSite } from '../../tasks/back-up.mjs'
import { isDev } from '../dev.mjs'
import { upsertAllTestDnsRecords          } from '../dns/index.mjs'
import samlConfig from './saml.mjs';
import { syncNbsaps, syncNationalReports, syncNationalTargets } from './migrations/index.mjs'

//eu_cookie_compliance.settings
//gbifstats.settings
//geolocation.settings
//google_analytics.settings
//locale.settings
//menu_ui.settings
//system.maintenance
//system.menu.main

export async function initNewTestSite(country, { loadSeed, freshBackUp, upsertDNS } ={ loadSeed : true, freshBackUp: true, upsertDNS:true }){
    if(upsertDNS) await upsertAllTestDnsRecords ();
    if(loadSeed){
        const seedSqlPathZipped = isDev()? `/home/ubuntu/efs-prod/bk-latest/seed-latest.sql.gz` : `/home/ubuntu/efs/bk-latest/seed-latest.sql.gz`
        const seedSqlPath       = isDev()? `/home/ubuntu/efs-prod/bk-latest/seed-latest.sql` : `/home/ubuntu/efs/bk-latest/seed-latest.sql`
        const seedFilesPath      = isDev()? `/home/ubuntu/efs-prod/bk-latest/seed-latest-files.tgz` : `/home/ubuntu/efs/bk-latest/seed-latest-files.tgz`

        if(freshBackUp) await backUpSite('seed')

        execSync(`gunzip -k ${seedSqlPathZipped} -f`)
        execSync(`ddev drush @${country} sql:cli < ${seedSqlPath}`)
        execSync(`mkdir -p /home/ubuntu/bioland/web/sites/${country}/files`)
        execSync(`tar -xvf  ${seedFilesPath} -C /home/ubuntu/bioland/web/sites/${country}/files`)
    }

    await setDefaultCountry(country)
    await setGbifStats(country)
    await setRegionalSettings(country)
    await biolandFooterLabel(country)
    await setTitleAndSlogan(country)
    await setLogo(country)
    await setFooterLinks(country)
    await setNationalTargetCountry(country)
    await samlConfig(country)
    await syncNbsaps(site, { deleteOnly: false })
    await syncNationalReports(site, { deleteOnly: false })
    await syncNationalTargets(site, {  deleteOnly: false })
}

export function setFooterLinks(countryCode){
    return footerLinks(countryCode)
}

export async function setDefaultCountry(countryCode){
    const uuid = await getDrupalCountryId(countryCode, countryCode)

    const configKeys = [ 
                            'field.field.node.news.field_countries',
                            'field.field.node.event.field_countries',
                            'field.field.node.project.field_countries',
                            'field.field.node.organization.field_countries',
                            'field.field.node.document.field_countries',
                            'field.field.node.link.field_countries'
    ]

    for (const configKey of configKeys) {
       await  addDefaultCountry(countryCode, configKey, uuid)
    }

    execSync(`cd ${webCtx}`)

}

export async function setNationalTargetCountry(countryCode){
    const locale               = await getDefaultLocale(countryCode)
    const defaultLocale        = locale === 'en'? '' : locale

    const { sites }  = config
    const site = sites[countryCode]

    const path        = 'node/landing_page_layout'
    const id          = 'fb579f24-80d1-4b9f-8946-6ad7e8f292f4'
    const needle      = `countries:[&apos;ph&apos;]`
    const replacement = site.regions? `countries:${JSON.stringify(site.regions)}` : `countries:['${countryCode}']`

    await login(countryCode)

    const { type,  attributes } = (await jsonApiGet(countryCode, { path, id })).body.data;
    const { body } = attributes;
    const data = { data: { id,  type, attributes: { body: { value: body.value.replace(needle, replacement), format:'full_html' } }}};

    await patch(countryCode, path, id, data, defaultLocale)
}

export async function setGbifStats(countryCode){
    const locale               = await getDefaultLocale(countryCode)
    const defaultLocale        = locale === 'en'? '' : locale
    const countryExists        = !!(await getCountries())[countryCode]
    const countryCodeUpperCase = countryExists? countryCode.toUpperCase() : 'FJ'

    await login(countryCode)
    await patchMenuUri(countryCode, 'a2864c79-b456-43eb-90bb-15ee0fd98da3', `https://www.gbif.org/country/${countryCodeUpperCase}/summary`, defaultLocale)


    consola.info(`${countryCode} - : GBIF configured`)
}

export async function setEuCompliance(countryCode){
    const { sites }  = config
    const site = sites[countryCode]

    if(!site.euCompliance) return

    const configObj   = (await getConfigObject(countryCode,'eu_cookie_compliance.settings'))

    configObj.popup_enabled = site.euCompliance

    await setConfigObject(countryCode,'eu_cookie_compliance.settings', configObj)

    const configObj2   = (await getConfigObject(countryCode,'google_analytics.settings'))

    configObj2.codesnippet.before = `var gaCode = '${site.googleAnalyticsId}'; window['ga-disable-' + gaCode] = true; if(document.cookie.valueOf('cookie-agreed').indexOf("cookie-agreed=2")>=0) { window['ga-disable-' + gaCode] = false; }`

    await setConfigObject(countryCode,'google_analytics.settings', configObj2)

    consola.info(`${countryCode} - ${(await  getCountryNameByCode(countryCode))}: setEuCompliance`)
}

export async function setGA(countryCode){
    const { sites }  = config
    const countryMap = await getCountries()
    const isCountry  = countryMap[countryCode]

    if(!isCountry) return

    const site = sites[countryCode]

    if(!site.googleAnalyticsId) return
    const configObj   = (await getConfigObject(countryCode,'google_analytics.settings'))

    configObj.account = site.googleAnalyticsId

    await setConfigObject(countryCode,'google_analytics.settings', configObj)
    consola.info(`${countryCode} - ${(await  getCountryNameByCode(countryCode))}: google analytics set`)
}



export async function setRegionalSettings(countryCode){
    const { sites }  = config
    const countryMap = await getCountries()
    const isCountry  = countryMap[countryCode]

    if(!isCountry) return

    const {timezones:[zone]} = countryTimeZone.getCountry(countryCode.toUpperCase())
    const configObj   = (await getConfigObject(countryCode,'system.date'))

    configObj.country.default  = countryCode.toUpperCase()
    configObj.timezone.default = zone

    await setConfigObject(countryCode,'system.date', configObj)
    consola.info(`${countryCode} - ${(await  getCountryNameByCode(countryCode))}: regional setting set `)
}

export async function biolandFooterLabel(countryCode){
    const { sites }  = config
    const   site     = sites[countryCode]
    const countryMap = await getCountries()
    const isCountry  = countryMap[countryCode]
  
    if(!isCountry) return
  
    const locales = await getSiteLocales(countryCode)

    for (const locale of locales) {
        const l = locale === 'en'? '' : locale
        const configObj   = (await getConfigObject(countryCode,'block.block.biolandfooterbiolandlinks', l)) || { }
        const exists      = Object.keys(configObj).length

        if(!exists) configObj.settings = { label: ''}

        const name  = (await  getCountryNameByCode(countryCode, l || 'en')) || await translate((await  getCountryNameByCode(countryCode)), locale)
        
        configObj.settings.label = name

        if(exists) await setConfigObject(countryCode,'block.block.biolandfooterbiolandlinks', configObj, l)
        if(!exists) await createConfigObject(countryCode,'block.block.biolandfooterbiolandlinks', configObj, l)

        consola.info(`${countryCode} - ${(await  getCountryNameByCode(countryCode))}: footer label set for language ${locale || 'en'}`)
    }
}

export async function setLogo(countryCode){

    const { sites }    = await config
    const   site       = sites[countryCode]
    const   logoString = site.logo? site.logo : `https://www.chm-cbd.net/sites/default/files/images/flags/flag-${countryCode}.png`
    const   logo       = logoString.startsWith('http')? logoString : `public://${logoString}`
  
    const configObj   = await getConfigObject(countryCode,'biotheme.settings')

    configObj.logo.path = logo

    await setConfigObject(countryCode,'biotheme.settings', configObj)

    consola.info(`${countryCode} - ${(await  getCountryNameByCode(countryCode))}: logo set`)
}

export async function setTitleAndSlogan(countryCode){
    const locales = await getSiteLocales(countryCode)

    if(!locales) throw new Error(`No locals obtained from site ${countryCode}`)

    for (const locale of locales) {
        const l = locale === 'en'? '' : locale

        const configObj   = await getConfigObject(countryCode,'system.site', l) || {}

        const exists      = Object.keys(configObj).length
        const nameEnglish = (await  getCountryNameByCode(countryCode)) + ' Biodiversity'
        const slogan      = 'National Clearing House Mechanism'

        configObj.name   = isEnglish(locale)? nameEnglish : await translate(nameEnglish, l)
        configObj.slogan = isEnglish(locale)? slogan : await translate(slogan, l)

        if(exists)
            await setConfigObject(countryCode,'system.site', configObj, l)
        else
            await createConfigObject(countryCode,'system.site', configObj, l)
        consola.info(`${countryCode} - ${nameEnglish}: name and slogan updated for language ${locale||'en'}`)
    }
}

function isEnglish(locale){
    return locale === 'en' || !locale
}

async function addDefaultCountry(countryCode, configKey, countryUuid){
    const nameEnglish = (await  getCountryNameByCode(countryCode))
    const target_uuid = countryUuid
    const configObj   = (await getConfigObject(countryCode, configKey))

    configObj.default_value        = [ { target_uuid } ]
    configObj.dependencies.content = [ `taxonomy_term:countries:${target_uuid}` ]

    await setConfigObject(countryCode, configKey, configObj)

    consola.info(`${countryCode} - ${nameEnglish}: default country set for ${configKey} `)
}

