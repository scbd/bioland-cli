import { spawnSync, execSync } from 'child_process'


import SA      from 'superagent'
import config  from '../config.mjs'
import consola from 'consola'

const $http  = SA.agent()
const global = {  }

const { BL_API_USER_PASS, BL_API_USER } = process.env

export async function login (site){
  try{
    if(!global[site]) global[site] = {}
    if(global[site].token) return $http.set('X-CSRF-Token', global[site].token)

    const host = getHost(site)
    const uri  = `${host}/user/login?_format=json`

    const { body } = await $http.post(uri)
                            .set('Content-Type', 'application/json')
                            .send(JSON.stringify({ name:BL_API_USER, pass:BL_API_USER_PASS }))

    const { csrf_token } = body

    global[site].token = csrf_token
    
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
export async function post(site, path, data,locale='' ){
  try{
    const host    = getHost(site)

    
    return $http.post(`${host}${locale? '/'+locale : ''}/jsonapi/${path}`)
                    .set('Content-Type', 'application/vnd.api+json')
                    .send(JSON.stringify(data))
  }catch(e){
    consola.error(e)
  }
}

export async function get(site, path, id, locale='' ){
  try{
    const host    = getHost(site)

    
    return $http.get(`${host}${locale? '/'+locale : ''}/jsonapi/${path}/${id}`)
                    .set('Content-Type', 'application/vnd.api+json')

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

}


function getHost(site){
  const { sites                   } =       config
  const { redirectTo, environment } = sites[site]

  if(redirectTo) return redirectTo

  if(environment) return `${site}.test.chm-cbd.net`

  return `${site}.chm-cbd.net`
}