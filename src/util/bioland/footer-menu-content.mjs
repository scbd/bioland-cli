import { getCountries, getIsoAlpha3  } from '../countries.mjs'
import { login, patchMenuUri, deleteMenu  } from '../drupal/json-api.mjs'

export default async function (site){
  await login(site)
  await updateCbdProfile   (site)
  await updateGefLink      (site)
  await updateInformeaLink (site)

  await updateUnLink       (site)
  await updateNSLink       (site)

  consola.info(`${site}: Updated bioland menu links`)
}

async function updateCbdProfile(site){
  const countryMap = await getCountries()
  const id         = '46bfaaea-e223-434e-917e-4e67cf129257'

  const isCountry = !!countryMap[site]

  const url = `https://www.cbd.int/countries/?country=${isCountry? site : 'fj'}`

  return patchMenuUri(site, id, url, 'en')
}

//
async function updateGefLink(site){
  const countryMap = await getCountries()
  const isCountry  = !!countryMap[site]
  const gefCode    = getGefCountryCode(isCountry? site: 'fj')
  const id         = 'a228eac2-2c3d-4e3a-98e8-17c71262c009'

  if(!gefCode) return deleteMenu(site, id)
  
  const url = `http://www.thegef.org/projects-operations/database?f%5B0%5D=regional_country_list%3A${gefCode}`

  return patchMenuUri(site, id, url, 'en')
}

async function updateInformeaLink(site){
  const countryMap = await getCountries()
  const id         = '153f455a-268c-4d1e-86b7-fed493013a46'

  const isCountry  = !!countryMap[site]

  const url = `https://www.informea.org/countries/${isCountry? site : 'fj'}`

  return patchMenuUri(site, id, url, 'en')
}

async function updateUnepLink(site){
  const countryMap = await getCountries()
  const id         = '150bcd6c-96e7-4c24-8fb9-68aee4dd5e51'

  const isCountry  = !!countryMap[site]

  const url = `https://uneplive.unep.org/country/index/${isCountry? site : 'fj'}`

  return patchMenuUri(site, id, url, 'en')
}

async function updateUnLink(site){
  const countryMap = await getCountries()
  const id         = '6049f87d-66d9-4c14-b06e-5783c4cc6f6b'

  const isCountry  = !!countryMap[site]

  const url = `https://data.un.org/en/iso/${isCountry? site : 'fj'}.html`

  return patchMenuUri(site, id, url, 'en')
}

async function updateNSLink(site){
  const countryMap = await getCountries()
  const id         = '4bda8788-9d88-4a26-ad5a-0a1f90a23284'

  const isCountry  = !!countryMap[site]

  const isoA3 = getIsoAlpha3(isCountry? site : 'fj')
  const url   = `https://bipdashboard.natureserve.org/CountrySummaries/${isoA3}_Summary.pdf`

  return patchMenuUri(site, id, url, 'en')
}

function getGefCountryCode(code) {
  const codes = [{ af: '13' }, { al: '14' }, { dz: '15' }, { ao: '16' }, { ar: '18' }, { am: '19' }, { az: '20' }, { bs: '21' }, { bh: '22' }, { bd: '23' }, { bb: '24' }, { by: '25' }, { bz: '26' }, { bj: '27' }, { bt: '28' }, { bw: '31' }, { br: '32' }, { bg: '33' }, { bf: '34' }, { bi: '35' }, { cv: '36' }, { kh: '37' }, { cm: '38' }, { cf: '39' }, { td: '40' }, { cl: '41' }, { cn: '42' }, { co: '43' }, { km: '44' }, { cg: '45' }, { cg: '46' }, { ck: '47' }, { cr: '48' }, { hr: '50' }, { cu: '51' }, { cz: '52' }, { dj: '53' }, { dm: '54' }, { do: '55' }, { dm: '55' }, { ec: '56' }, { eg: '57' }, { sv: '58' }, { gq: '59' }, { gn: '59' }, { er: '60' }, { ee: '61' }, { et: '62' }, { fj: '63' }, { ga: '64' }, { ge: '66' }, { gh: '67' }, { gd: '69' }, { gt: '70' }, { gn: '71' }, { gn: '72' }, { gw: '72' }, { gy: '73' }, { ht: '74' }, { hn: '75' }, { hu: '76' }, { in: '77' }, { id: '78' }, { iq: '80' }, { jm: '81' }, { jo: '82' }, { kz: '83' }, { ke: '84' }, { ki: '85' }, { kw: '88' }, { lv: '91' }, { lb: '92' }, { ls: '93' }, { lr: '94' }, { ly: '95' }, { lt: '96' }, { mk: '97' }, { mg: '98' }, { mw: '99' }, { my: '100' }, { mv: '101' }, { ml: '102' }, { mt: '103' }, { mh: '104' }, { mr: '105' }, { mu: '106' }, { mx: '107' }, { mn: '110' }, { me: '111' }, { ma: '112' }, { mz: '113' }, { mm: '114' }, { na: '115' }, { nr: '116' }, { np: '117' }, { ni: '118' }, { ne: '119' }, { ne: '120' }, { ng: '120' }, { nu: '121' },{ om: '122' }, { pk: '123' }, { pw: '124' }, { pa: '125' }, { gn: '126' }, { pg: '126' }, { py: '127' }, { pe: '128' }, { ph: '129' }, { pl: '130' }, { ro: '133' }, { ru: '134' }, { rw: '135' }, { ws: '136' }, { st: '137' }, { sa: '138' }, { sn: '139' }, { rs: '140' }, { sc: '141' }, { sl: '142' }, { si: '144' }, { sb: '145' }, { so: '146' }, { za: '147' }, { ss: '148' }, { sd: '148' }, { lk: '149' }, { sd: '153' }, { sr: '154' }, { sz: '155' }, { tj: '157' }, { th: '159' }, { tg: '161' }, { to: '162' }, { tt: '163' }, { tn: '164' }, { tr: '165' }, { tm: '166' }, { tv: '167' }, { ug: '168' }, { ua: '169' }, { uy: '170' }, { uz: '171' }, { vu: '172' }, { vn: '174' }, { ye: '175' }, { zm: '176' }, { zw: '177' }]
  const id    = ''

  for (const aSet of codes)
    if(aSet[code]) return aSet[code]

  return ''
}
