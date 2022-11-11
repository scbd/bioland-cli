import   consola                from 'consola'
import   slug                   from 'limax'
import { getChmDocuments      } from '../util.mjs'
import { getCountryNameByCode } from '../../../countries.mjs'
import { aichiMap             } from '../maps/index.mjs'
import { isDev                } from '../../../commands.mjs'
import { login, jsonApiPost, jsonApiGet } from '../../../drupal/json-api.mjs'
import { getDocumentData, deleteDrupalDocuments } from './util.mjs'

export default async function (site, { defaultCountry = 'fj', forceCountry, deleteOnly = false } = {}){
    const siteIsCountry      = await getCountryNameByCode(site)

    if(!siteIsCountry && !isDev()) return consola.warn(`Site: ${site} => National Target sync: nothing done, site not country`)

    const countryIso2        = forceCountry? forceCountry : siteIsCountry?  site : defaultCountry
    const chmNationalTargets = await chmHasNationalTargets(site, countryIso2)

    if(!chmNationalTargets) return

    const siteNationalTargets = await siteHasNationalTarget(site)

    //sync - delete then recreate
    if(siteNationalTargets) await deleteDrupalDocuments(site, chmNationalTargets, siteNationalTargets)

    if(deleteOnly) return

    const chmDocIds       = chmNationalTargets.map( ({ _documentId_i }) => _documentId_i)
    const chmDocumentData = await getDocumentData(chmDocIds)
    const countryCode     = countryIso2

    for (const docData of chmDocumentData) { 
        const data = await getTemplate(docData, { countryCode })

        await postDoc(site, { path: 'node/national_target', data })
    }
}

async function siteHasNationalTarget(site){
        const  path        = 'node/national_target'
        const { _body }    = await jsonApiGet(site, { path  })
    
        if(!_body || !_body.data || !_body.data.length) return false
        
        return _body.data
}

async function chmHasNationalTargets(site, forceCountry){
    const isCountryCode = !!await getCountryNameByCode(site)
    const countryCode   = isCountryCode? site : forceCountry || site
    const resp          = await getChmDocuments(countryCode,'nationalTarget')

    if(resp.length) return resp
    
    return false
}

async function postDoc(site, { path, data, locale='' }){
    await login(site)
    return jsonApiPost(site, { path, data, locale })
}

async function getTemplate(doc){
    const { documentId, description, relevantInformation, aichiTargets } = doc

    const   title = doc.title.en
    const   uri   = `https://chm.cbd.int/database/record?documentID=${documentId}`
    const   alias = `/implementation/targets/${slug(doc.title.en).substring(0, 69)}`
    const   bodyValue = description || relevantInformation
    const   body  = bodyValue?.en? { value: `<p>${bodyValue.en}</p>`, format: 'full_html'} : null


    return {
        type: 'node--national_target',
        attributes: {
            revision_log: null,
            status: true,
            title:title.substring(0,253),
            promote: false,
            sticky: false,
            default_langcode: true,
            moderation_state: null,
            metatag: null,
            path: {
                alias,
                langcode: 'en'
            },
            content_translation_source: 'und',
            content_translation_outdated: false,
            body,
            field_full_title: title,
            field_reference_number: null,
            field_target_date: null,
            field_url: { uri },
            field_use_aichi_target: false
        },
        relationships: {
            node_type: {
                data: {
                    type: 'node_type--node_type',
                    id: '72b0c3d5-a837-4476-a2ff-a71d08ce0ada'
                }
            },
            field_aichi_targets: {
                data: getAichis(aichiTargets)
            }
        }
    }
}

function getAichis(chmIdentifierObjects){
    const identifiers = chmIdentifierObjects.map(({ identifier }) => identifier)

    const drupalIds = aichiMap.filter(({ identifier })=> identifiers.includes(identifier))

    return drupalIds.map(({ uuid })=>({ type: 'taxonomy_term--aichi_biodiversity_targets', id:uuid }))
}