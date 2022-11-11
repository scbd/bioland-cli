import   urlFileSize                 from 'url-file-size'
import   prettyBytes                 from 'pretty-bytes'
import   slug                        from 'limax'
import   request                     from 'superagent'
import { chmDocumentTypesMap       } from '../maps/index.mjs'
import { getDrupalCountryId        } from '../../../drupal/db.mjs'
import { jsonApiLogin, jsonApiGet, jsonApiDelete } from '../../../drupal/json-api.mjs'
import consolaGlobalInstance from 'consola'

export async function deleteDrupalDocuments(site, chmDocs, biolandDocs){
    const toDeleteIds = await getDeleteIdentifiers(chmDocs, biolandDocs)

    if(!toDeleteIds?.length) return

    await jsonApiLogin(site)

    const deletePromises = []

    for (const toDeleteId of toDeleteIds)
        deletePromises.push(jsonApiDelete(site, { path: 'node/document', id: toDeleteId }))

    await Promise.all(deletePromises)
}

export async function getDocumentData(id){
    const isMultipleIds  = Array.isArray(id)
    const identifiers    = isMultipleIds? id : [id]
    const reqGetPromises = []

    for (const identifier of identifiers) {
        const uri  = `https://api.cbd.int/api/v2013/documents/${identifier}`
        
        reqGetPromises.push(request.get(uri).set('accept', 'application/json'))
    }

    const bodies = (await Promise.all(reqGetPromises)).map(({ _body }) => _body)

    for (let index = 0; index < bodies.length; index++)
        bodies[index].documentId = identifiers[index]

    return  bodies
}

export async function getDocTemplate(doc, { countryCode, docType, lang='en' }){
    const { adoptionDate, startDate, documentId } = doc
    
    const   field_publication_date = startDate
    const   title = doc.title.en
    const   uri   = `https://chm.cbd.int/database/record?documentID=${doc.documentId}`
    const   alias = `/documents/${slug(doc.title.en)}`

    const countryId = await getDrupalCountryId('www', countryCode)
    const bodyData  = { documentId, ...(await getFileParams(doc.documentLinks)) }
    const body      = generateBody(bodyData)


    return { type: 'node--document',
                attributes: {
                    langcode: 'en',
                    revision_log: null,
                    title,
                    promote: false,
                    sticky: false,
                    default_langcode: true,
                    revision_translation_affected: true,
                    moderation_state: 'published',
                    metatag: null,
                    path: {
                        alias,
                        langcode: 'en'
                    },
                    content_translation_source: 'und',
                    content_translation_outdated: false,
                    body,
                    field_meta_tag: null,
                    field_publication_date,
                    field_url: { uri }
                },
                relationships: {
                    field_document_type: {
                        data: {
                            type: 'taxonomy_term--document_types',
                            id: chmDocumentTypesMap[docType]
                        }
                    },
                    field_countries: {
                        data: {
                            type: 'taxonomy_term--countries',
                            id: countryId
                        }
                    }
                }
    }
}

export async function siteHasDocumentType(site, type){
    const  path        = 'node/document'
    const  drupalTaxId = chmDocumentTypesMap[ type ]
    const  query       = `filter[field_document_type.id]=${drupalTaxId}`
    const { _body }    = await jsonApiGet(site, { path, query })

    if(!_body || !_body.data || !_body.data.length) return false
    
    return _body.data
}

export async function getFileParams(fileLinks, lang = 'en'){

    const [ link ] = fileLinks.filter(({ name }) => name.includes(`-${lang}`))

    if(!link) return consola.warn('No files found in chm')//throw new Error('nbsaps.getFileParams no file data found')

    const { name, url } = link

    const size = prettyBytes(await urlFileSize(url))

    return { uri: url, size, name, url }
}

export function generateBody({ uri, name, size }){
    if(!uri || !name || !size) return null
    return {
            value: `
            <br>
                <div class="field--items">
                    <div class="field--item">
                        <span class="file file--mime-application-pdf file--application-pdf icon-before">
                            <span class="file-icon"><span class="icon glyphicon glyphicon-file text-primary" aria-hidden="true"></span></span>
                            <span class="file-link">
                                <a data-original-title="Open file in new window" data-placement="bottom" data-toggle="tooltip" href="${uri}" target="_blank" title="" type="application/pdf;">
                                    ${name}
                                </a>
                            </span>
                            <span class="file-size" style="font-size: 1em; color: #039749;">${size}</span>
                        </span>
                    </div>
                </div>
                `,
            format: 'full_html'
        }
}

async function getDeleteIdentifiers(chmDocs, biolandDocs){
    const chmDocIds           = chmDocs.map( ({ _documentId_i }) => _documentId_i)
    const toDeleteBiolandDocs = biolandDocs.filter(({ attributes }) => stringIncludes(attributes?.field_url?.uri, chmDocIds ))
    const toDeleteIds         = toDeleteBiolandDocs.map(({ id })=> id)
    
    if(!toDeleteIds.length) return null

    return toDeleteIds
}

function stringIncludes(hayStack,  needles){
    if(!hayStack) return false
    for (const needle of needles)
        if(hayStack.includes(needle)) return true

    return false
}