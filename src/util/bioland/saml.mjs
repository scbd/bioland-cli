import consola from 'consola'
import { getConfigObject, setConfigObject } from '../drupal/drupal-config.mjs'
import { execSync  }          from 'child_process'
import { dbSet }             from '../drupal/db.mjs'
import { config }            from '../config.mjs'

export default async (countryCode) => {

        consola.error(countryCode)

        execSync(`ddev drush @${countryCode} en samlauth -y`)

        await setConfigObject(countryCode,'views.view.samlauth_map', getViewTemplate())
        await setConfigObject(countryCode,'samlauth.authentication', getConfigTemplateDev(countryCode))


        execSync(`ddev drush @${countryCode} cr`)

        const obj = await getConfigObject(countryCode, 'core.menu.static_menu_link_overrides')

        await dbSet(countryCode, `UPDATE menu_tree SET enabled = ? WHERE menu_name LIKE '%account%' AND  id LIKE '%samlauth.saml_controller_logout.logout%'`, [1])
        await dbSet(countryCode, `UPDATE menu_tree SET enabled = ? WHERE menu_name LIKE '%account%' AND  id LIKE '%user.logout%'`, [0]) 

        if(obj.definitions.samlauth__saml_controller_logout__logout)
        obj.definitions.samlauth__saml_controller_logout__logout.enabled = true

        if(obj.definitions.user__logout)
        obj.definitions.user__logout.enabled = false

        await setConfigObject(countryCode,'core.menu.static_menu_link_overrides', obj)

        execSync(`ddev drush @${countryCode} role-add-perm "anonymous" "view sp metadata"`)

        consola.warn(done)
}

function getViewTemplate(){
    return {                                                                                                                                                         
        uuid: 'ddad7dd5-b7ee-42b4-8d07-0fdc009b0c54',
        langcode: 'en',
        status: true,
        dependencies: {
          module: [
            'externalauth',
            'samlauth',
            'user'
          ]
        },
        id: 'samlauth_map',
        label: 'SAML Authentication Links',
        module: 'views',
        description: '',
        tag: '',
        base_table: 'authmap',
        base_field: '',
        display: {
          default: {
            id: 'default',
            display_title: 'Master',
            display_plugin: 'default',
            position: 0,
            display_options:  {"title":"SAML Authentication Links","fields":{"authname":{"id":"authname","table":"authmap","field":"authname","relationship":"none","group_type":"group","admin_label":"","plugin_id":"standard","label":"SAML IdP Unique ID","exclude":false,"alter":{"alter_text":false,"text":"","make_link":false,"path":"","absolute":false,"external":false,"replace_spaces":false,"path_case":"none","trim_whitespace":false,"alt":"","rel":"","link_class":"","prefix":"","suffix":"","target":"","nl2br":false,"max_length":0,"word_boundary":true,"ellipsis":true,"more_link":false,"more_link_text":"","more_link_path":"","strip_tags":false,"trim":false,"preserve_tags":"","html":false},"element_type":"","element_class":"","element_label_type":"","element_label_class":"","element_label_colon":true,"element_wrapper_type":"","element_wrapper_class":"","element_default_classes":true,"empty":"","hide_empty":false,"empty_zero":false,"hide_alter_empty":true},"uid":{"id":"uid","table":"authmap","field":"uid","relationship":"none","group_type":"group","admin_label":"","plugin_id":"numeric","label":"Drupal User ID","exclude":false,"alter":{"alter_text":false,"text":"","make_link":false,"path":"","absolute":false,"external":false,"replace_spaces":false,"path_case":"none","trim_whitespace":false,"alt":"","rel":"","link_class":"","prefix":"","suffix":"","target":"","nl2br":false,"max_length":0,"word_boundary":true,"ellipsis":true,"more_link":false,"more_link_text":"","more_link_path":"","strip_tags":false,"trim":false,"preserve_tags":"","html":false},"element_type":"","element_class":"","element_label_type":"","element_label_class":"","element_label_colon":true,"element_wrapper_type":"","element_wrapper_class":"","element_default_classes":true,"empty":"","hide_empty":false,"empty_zero":false,"hide_alter_empty":true,"set_precision":false,"precision":0,"decimal":".","separator":"","format_plural":false,"format_plural_string":"1\u0003@count","prefix":"","suffix":""},"name":{"id":"name","table":"users_field_data","field":"name","relationship":"uid","group_type":"group","admin_label":"","entity_type":"user","entity_field":"name","plugin_id":"field","label":"Drupal User Name","exclude":false,"alter":{"alter_text":false,"text":"","make_link":false,"path":"","absolute":false,"external":false,"replace_spaces":false,"path_case":"none","trim_whitespace":false,"alt":"","rel":"","link_class":"","prefix":"","suffix":"","target":"","nl2br":false,"max_length":0,"word_boundary":true,"ellipsis":true,"more_link":false,"more_link_text":"","more_link_path":"","strip_tags":false,"trim":false,"preserve_tags":"","html":false},"element_type":"","element_class":"","element_label_type":"","element_label_class":"","element_label_colon":true,"element_wrapper_type":"","element_wrapper_class":"","element_default_classes":true,"empty":"","hide_empty":false,"empty_zero":false,"hide_alter_empty":true,"click_sort_column":"value","type":"user_name","settings":{"link_to_entity":true},"group_column":"value","group_columns":[],"group_rows":true,"delta_limit":0,"delta_offset":0,"delta_reversed":false,"delta_first_last":false,"multi_type":"separator","separator":", ","field_api_classes":false},"delete":{"id":"delete","table":"authmap","field":"delete","relationship":"none","group_type":"group","admin_label":"","plugin_id":"samlauth_link_delete","label":"delete","exclude":false,"alter":{"alter_text":false,"text":"","make_link":false,"path":"","absolute":false,"external":false,"replace_spaces":false,"path_case":"none","trim_whitespace":false,"alt":"","rel":"","link_class":"","prefix":"","suffix":"","target":"","nl2br":false,"max_length":0,"word_boundary":true,"ellipsis":true,"more_link":false,"more_link_text":"","more_link_path":"","strip_tags":false,"trim":false,"preserve_tags":"","html":false},"element_type":"","element_class":"","element_label_type":"","element_label_class":"","element_label_colon":true,"element_wrapper_type":"","element_wrapper_class":"","element_default_classes":true,"empty":"","hide_empty":false,"empty_zero":false,"hide_alter_empty":true,"text":"delete","output_url_as_text":false,"absolute":false}},"pager":{"type":"mini","options":{"offset":0,"items_per_page":50,"total_pages":null,"id":0,"tags":{"next":"››","previous":"‹‹"},"expose":{"items_per_page":false,"items_per_page_label":"Items per page","items_per_page_options":"5, 10, 25, 50","items_per_page_options_all":false,"items_per_page_options_all_label":"- All -","offset":false,"offset_label":"Offset"}}},"exposed_form":{"type":"basic","options":{"submit_button":"Apply","reset_button":false,"reset_button_label":"Reset","exposed_sorts_label":"Sort by","expose_sort_order":true,"sort_asc_label":"Asc","sort_desc_label":"Desc"}},"access":{"type":"perm","options":{"perm":"configure saml"}},"cache":{"type":"none","options":[]},"empty":{"area_text_custom":{"id":"area_text_custom","table":"views","field":"area_text_custom","relationship":"none","group_type":"group","admin_label":"","plugin_id":"text_custom","empty":true,"content":"No links (from SAML Authentication ID to Drupal user)  found.","tokenize":false}},"sorts":[],"arguments":[],"filters":{"authname":{"id":"authname","table":"authmap","field":"authname","relationship":"none","group_type":"group","admin_label":"","plugin_id":"string","operator":"starts","value":"","group":1,"exposed":true,"expose":{"operator_id":"authname_op","label":"SAML IdP Unique ID","description":"","use_operator":false,"operator":"authname_op","operator_limit_selection":false,"operator_list":[],"identifier":"authname","required":false,"remember":false,"multiple":false,"remember_roles":{"authenticated":"authenticated","anonymous":"0","administrator":"0","role3":"0","role4":"0"},"placeholder":""},"is_grouped":false,"group_info":{"label":"","description":"","identifier":"","optional":true,"widget":"select","multiple":false,"remember":false,"default_group":"All","default_group_multiple":[],"group_items":[]}},"uid":{"id":"uid","table":"users_field_data","field":"uid","relationship":"uid","group_type":"group","admin_label":"","entity_type":"user","entity_field":"uid","plugin_id":"user_name","operator":"in","value":[],"group":1,"exposed":true,"expose":{"operator_id":"uid_op","label":"Drupal user","description":"","use_operator":false,"operator":"uid_op","operator_limit_selection":false,"operator_list":[],"identifier":"uid","required":false,"remember":false,"multiple":false,"remember_roles":{"authenticated":"authenticated","anonymous":"0","administrator":"0","role3":"0","role4":"0"},"reduce":false},"is_grouped":false,"group_info":{"label":"","description":"","identifier":"","optional":true,"widget":"select","multiple":false,"remember":false,"default_group":"All","default_group_multiple":[],"group_items":[]}},"provider_field":{"id":"provider_field","table":"authmap","field":"provider_field","relationship":"none","group_type":"group","admin_label":"","plugin_id":"string","operator":"=","value":"samlauth","group":1,"exposed":false,"expose":{"operator_id":"","label":"","description":"","use_operator":false,"operator":"","operator_limit_selection":false,"operator_list":[],"identifier":"","required":false,"remember":false,"multiple":false,"remember_roles":{"authenticated":"authenticated"},"placeholder":""},"is_grouped":false,"group_info":{"label":"","description":"","identifier":"","optional":true,"widget":"select","multiple":false,"remember":false,"default_group":"All","default_group_multiple":[],"group_items":[]}}},"style":{"type":"table","options":{"grouping":[],"row_class":"","default_row_class":true,"columns":{"authname":"authname","uid":"uid","name":"name","delete":"delete"},"default":"authname","info":{"authname":{"sortable":true,"default_sort_order":"asc","align":"","separator":"","empty_column":false,"responsive":""},"uid":{"sortable":true,"default_sort_order":"asc","align":"","separator":"","empty_column":false,"responsive":""},"name":{"sortable":true,"default_sort_order":"asc","align":"","separator":"","empty_column":false,"responsive":""},"delete":{"sortable":false,"default_sort_order":"asc","align":"","separator":"","empty_column":false,"responsive":""}},"override":true,"sticky":false,"summary":"","empty_table":false,"caption":"","description":""}},"row":{"type":"fields"},"query":{"type":"views_query","options":{"query_comment":"","disable_sql_rewrite":false,"distinct":false,"replica":false,"query_tags":[]}},"relationships":{"uid":{"id":"uid","table":"authmap","field":"uid","relationship":"none","group_type":"group","admin_label":"Linked Drupal user","plugin_id":"standard","required":false}},"show_admin_links":false,"header":[],"footer":[],"display_extenders":[]},
            cache_metadata: {
                'max-age': -1,
                contexts: [
                  'languages:language_content',
                  'languages:language_interface',
                  'url',
                  'url.query_args',
                  'user.permissions'
                ],
                tags: []
              }
          },
          page: {
            id: 'page',
            display_title: 'Page',
            display_plugin: 'page',
            position: 1,
            display_options: {
                display_extenders: [],
                path: 'admin/config/people/saml/authmap',
                menu: {
                  type: 'tab',
                  title: 'Links',
                  description: '',
                  weight: 7,
                  expanded: false,
                  menu_name: 'admin',
                  parent: 'samlauth.samlauth_configure_form',
                  context: '0'
                }
              },
            cache_metadata: {
                'max-age': -1,
                contexts: [
                  'languages:language_content',
                  'languages:language_interface',
                  'url',
                  'url.query_args',
                  'user.permissions'
                ],
                tags: []
              }
          }
        }
      }
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
  return ( config?.sites[code] || {})?.redirectTo
}

function isTestEnv(code){
  return ( config?.sites[code] || {})?.environment
}

function getConfigTemplateDev(code){
    const isDev = process.argv.includes('-d')

    const entityId = getEntityId(code);
    const idpId    = isDev? `https://accounts.cbddev.xyz/saml`: 'https://accounts.cbd.int/saml'

    return {                                                                                                                                               
        '_core': { default_config_hash: 'oDGEkhP0h5rXXqlDplxeBDre0goLigOJupHKMDMwcqM' },
        login_menu_item_title: '',
        logout_menu_item_title: '',
        login_redirect_url: entityId,
        logout_redirect_url: entityId,
        error_redirect_url: '',
        error_throw: false,
        local_login_saml_error: true,
        logout_different_user: false,
        drupal_login_roles: {
          administrator: 'administrator',
          site_manager: '0',
          content_manager: '0',
          contributor: '0',
          authenticated: '0'
        },
        sp_entity_id: entityId,
        sp_name_id_format: 'urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified',
        sp_x509_certificate: 'file:/var/www/html/sp.crt',
        sp_new_certificate: '',
        sp_private_key: 'file:/var/www/html/sp.key',
        metadata_valid_secs: 86400,
        metadata_cache_http: false,
        idp_entity_id: idpId,
        idp_single_sign_on_service: `${idpId}/signin`,
        idp_single_log_out_service: '',
        idp_change_password_service: `${idpId.replace('/saml','')}/password/reset`,
        idp_certs: [
          'file:/var/www/html/idp.crt'
        ],
        idp_cert_encryption: '',
        unique_id_attribute: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier',
        map_users: true,
        map_users_name: true,
        map_users_mail: true,
        map_users_roles: {
          administrator: 'administrator',
          site_manager: 'site_manager',
          content_manager: 'content_manager',
          contributor: 'contributor'
        },
        create_users: true,
        sync_name: true,
        sync_mail: true,
        user_name_attribute: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
        user_mail_attribute: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/email',
        request_set_name_id_policy: true,
        strict: false,
        security_metadata_sign: false,
        security_authn_requests_sign: true,
        security_logout_requests_sign: true,
        security_logout_responses_sign: true,
        security_nameid_encrypt: false,
        security_signature_algorithm: 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256',
        security_encryption_algorithm: '',
        security_messages_sign: false,
        security_assertions_signed: false,
        security_assertions_encrypt: false,
        security_nameid_encrypted: false,
        security_want_name_id: false,
        security_request_authn_context: true,
        security_lowercase_url_encoding: false,
        security_logout_reuse_sigs: false,
        security_allow_repeat_attribute_name: false,
        debug_display_error_details: true,
        debug_log_in: true,
        debug_log_saml_in: true,
        debug_log_saml_out: false,
        debug_phpsaml: true,
        use_proxy_headers: false,
        use_base_url: true
      }
}


