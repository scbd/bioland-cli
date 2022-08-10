import { spawnSync, execSync } from 'child_process'
export { setConfigObject, getConfigObject } from './drupal-config.mjs'

import SA      from 'superagent'
import config  from '../config.mjs'
import consola from 'consola'

const $http  = SA.agent()
const global = {  }

const { BL_API_USER_PASS, BL_API_USER } = process.env

export async function login (site){
  try{
    // if(global[site].$http) return global[site].$http

    const host = getHost(site)
    const uri  = `${host}/user/login?_format=json`

    const { body } = await $http.post(uri)
                            .set('Content-Type', 'application/json')
                            .send(JSON.stringify({ name:BL_API_USER, pass:BL_API_USER_PASS }))

    const { csrf_token } = body

    $http.set('X-CSRF-Token', csrf_token)

    return $http
  }
  catch(e){
    consola.error('Util.drupal.json-api.login: ', e)
    consola.error('Util.drupal.json-api.login: ', e.response)
  }
}

export async function patch(site, path, id, data,locale='' ){
  try{
    const host    = getHost(site)

    
    return $http.patch(`${host}${locale? '/'+locale : ''}/jsonapi/${path}/${id}`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .send(JSON.stringify(data))
  }catch(e){
    consola.error(e)
  }
}

export async function patchMenuUri(site, id, uri, locale=''){
  try{
    const host    = getHost(site)
    const data    = { data: { type: "menu_link_content--menu_link_content", id, attributes: { link: { uri  } } } }
    
    return $http.patch(`${host}${locale? '/'+locale : ''}/jsonapi/menu_link_content/menu_link_content/${id}`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .send(JSON.stringify(data))
  }catch(e){
    consola.error(e)
  }
}

export async function deleteNode(site, path, id, locale=''){
  try{
    const host    = getHost(site)

    return $http.delete(`${host}${locale? '/'+locale : ''}/jsonapi/${path}/${id}`)
                    .set('Content-Type', 'application/vnd.api+json')
  }catch(e){ consola.error('error')}
}

export async function deleteMenu(site, id, locale){
  try{
    const host    = getHost(site)

    return $http.delete(`${host}${locale? '/'+locale : ''}/jsonapi/menu_link_content/menu_link_content/${id}`)
                    .set('Content-Type', 'application/vnd.api+json')
  }catch(e){}
}

export async function enableJsonApi(site){


  spawnSync('ddev', [ 'drush', '-y', `@${site}`, 'en', 'jsonapi' ])

  const configObj   = await getConfigObject(site,'jsonapi.setting')

  configObj.read_only = 0

  await setConfigObject(site,'jsonapi.setting', configObj)

  execSync(`ddev drush @${site} cr`)
}

export async function disableJsonApi(site){

  const configObj   = await getConfigObject(site,'jsonapi.setting')

  configObj.read_only = 1

  await setConfigObject(site,'jsonapi.setting', configObj)

  // spawnSync('ddev', [ 'drush', '-y', `@${site}`, 'pm:uninstall', 'jsonapi' ])

  execSync(`ddev drush @${site} cr`)
}

function getHost(site){
  const { sites                   } =       config
  const { redirectTo, environment } = sites[site  ]

  if(redirectTo) return redirectTo

  if(environment) return `${site}.test.chm-cbd.net`

  return `${site}.chm-cbd.net`
}