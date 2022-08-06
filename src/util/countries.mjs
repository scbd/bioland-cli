import consola from 'consola'
import   request    from 'superagent'
import   allCodes   from './all-country-codes.mjs'

const globals = {}

export const getCountries = async ()=>{
  if(globals.cMap) return globals.cMap

  const data = await request.get('https://api.cbd.int/api/v2015/countries/')
                      .then(({ body }) => body)

  const cMap = {}

  for (const aCountry of data) {
    cMap[aCountry.code.toLowerCase()] = aCountry
  }

  globals.cMap = cMap

  return cMap
}

export const getCountryNameByCode = async(code, locale = 'en') => {
  const countriesData = await getCountries()
  const country       = countriesData[code.toLowerCase()]

  if(!country) throw new Error(`getCountryName: country not found code = ${code}`)

  return country.name[locale.toLowerCase()]
}



export const getIsoAlpha3 = (code) =>{
  if(code==='eu') return 'EU'
  if(code==='acb') return 'PHL'
  

  if(!code) throw new Error('getIsoAlpha3: passed code undefined')

  const country = (allCodes.filter((c) => c['alpha-2'] === code.toUpperCase()))[0]

  if(!country) return 'FJI'

  return country['alpha-3']
}