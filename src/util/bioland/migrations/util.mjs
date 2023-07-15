import   request from 'superagent'
import   consola from 'consola'


export async function getChmDocuments(country, documentType, textSearch){
    if(documentType === 'nationalTarget') return getNationalTargets(country)
    const isMultipleCountries = Array.isArray(country)
    const countryQuery        = !isMultipleCountries? `+AND+(hostGovernments_ss:${country})` : generateMultipleCountryQuery(country)
    const textQuery           = textSearch? `+AND+text_EN_txt:"!${textSearch}*"` : `+*:*+NOT+text_EN_txt:NBSAP`
    const res                 = await request.get(`https://chm.cbd.int/api/v2013/index/select?q=NOT+version_s:*+AND+realm_ss:chm+AND+schema_s:*++AND+(schema_s:${documentType})${countryQuery}${textQuery}&rows=1000&sort=createdDate_dt+desc&start=0&wt=json`)


    return res?._body?.response?.docs
}

async function getNationalTargets(country){
  const isMultipleCountries = Array.isArray(country)
  const countryQuery        = !isMultipleCountries? `+AND+(hostGovernments_ss:${country})` : generateMultipleCountryQuery(country)

  const res                 = await request.get(`https://chm.cbd.int/api/v2013/index/select?q=NOT+version_s:*+AND+realm_ss:chm+AND+schema_s:*++AND+(schema_s:nationalTarget)${countryQuery}&rows=25&sort=createdDate_dt+desc&start=0&wt=json`)


  return res?._body?.response?.docs
}

function generateMultipleCountryQuery(countryCodes){
    let countryQuery = `+AND+(`

    for (const code of countryCodes)
        countryQuery += `hostGovernments_ss:${code}+OR+`
    
    return replaceLast(countryQuery, '+OR+', ')')
}

function replaceLast(text, searchValue, replaceValue) {
    const lastOccurrenceIndex = text.lastIndexOf(searchValue)
    return `${
        text.slice(0, lastOccurrenceIndex)
      }${
        replaceValue
      }${
        text.slice(lastOccurrenceIndex + searchValue.length)
      }`
  }

export async function getDrupalCountryCode(params){ //{ field_iso_code: 'af', field_iso3l_code: 'afg'}
    const key   = Object.keys(params)[0]
    const value = Object.values(params)[0]
    const res   = await request.get(`https://www.chm-cbd.net//jsonapi/taxonomy_term/countries?filter[${key}]=${value.toUpperCase()}`)

    return res.body.data[0]? res.body.data[0].id : ''
}