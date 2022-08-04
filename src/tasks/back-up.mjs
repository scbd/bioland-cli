import { notifyDone, runTask , webCtx, config } from '../util/index.mjs'

import { execSync  , exec }    from 'child_process'

import   consola               from 'consola'

export default async(branch, args) => {

  if(args.length)
    await (runTask(branch))(backUpSite, `${branch.toUpperCase()}: Backing up site: ${args[0]}`, args)
  else
    await (runTask(branch))(backUpAll, `${branch.toUpperCase()}: Backing up all sites`)

  notifyDone()()
  process.exit(0)
}

async function backUpAll(h){
  const { sites }  = config

  for (const site in sites)
    await backUpSite(site)
}

function getTimeParams(branch='bioland'){
  const   now               = new Date()
  const   year              = now.getFullYear()
  const   month             = ('0' + (now.getMonth() + 1)).slice(-2)
  const   day               = ('0' + now.getDate()).slice(-2)
  const   hour              = now.getHours()
  const   min               = now.getMinutes()
  const   seconds           = now.getSeconds()
  const   dateTime          = `${year}-${month}-${day}-T-${hour}-${min}-${seconds}`
  const   S3_URL            = `s3://biolands/${branch}`
  const   S3_URL_YEAR_MONTH = `${S3_URL}/${year}-${month}`

  return { S3_URL, S3_URL_YEAR_MONTH, dateTime }
}

export function backUpSite(site, { preDrupalUpgrade } = { preDrupalUpgrade: false }){
  const { S3_URL , S3_URL_YEAR_MONTH, dateTime } = getTimeParams()
  // const { isLocal                              } = config       [branch]
  
  exec(`cpulimit -P /usr/lib/tar -l 30`)
  backUpPathAlias(site, { preDrupalUpgrade })
  execSync(`cd ${webCtx}`)

  const preDrupalUpgradeFlag = preDrupalUpgrade? '-drupal-upgrade' : ''

  execSync(`mkdir -p ${webCtx}/dumps/${site}`)
  execSync(`ddev drush @${site} sql:dump --structure-tables-list=cache,cache_*,watchdog --gzip --result-file="dumps/${site}/${site}-${dateTime}${preDrupalUpgradeFlag}.sql"`)
  execSync(`cd "${webCtx}/sites/${site}" && tar -czf "${webCtx}/dumps/${site}/${site}-${dateTime}-site${preDrupalUpgradeFlag}.tgz" files`)

  console.log('')
  consola.info(`${site}: dumped and files tared and gzipped`)

  // if(isLocal) return //do not send to s3
  execSync(`aws s3 cp "${webCtx}/dumps/${site}/${site}-${dateTime}-site${preDrupalUpgradeFlag}.tgz" "${S3_URL_YEAR_MONTH}/${site}/${site}-${dateTime}-site${preDrupalUpgradeFlag}.tgz"`)
  execSync(`aws s3 cp "${webCtx}/dumps/${site}/${site}-${dateTime}${preDrupalUpgradeFlag}.sql.gz" "${S3_URL_YEAR_MONTH}/${site}/${site}-${dateTime}${preDrupalUpgradeFlag}.sql.gz"`)


  console.log('')
  consola.info(`${site}: transfered to ${S3_URL_YEAR_MONTH}/${site}/${site}-${dateTime}`)
  execSync(`aws s3 cp "${webCtx}/dumps/${site}/${site}-${dateTime}-site${preDrupalUpgradeFlag}.tgz" "s3://biolands/latest/${site}-latest-site${preDrupalUpgradeFlag}.tgz"`)
  execSync(`aws s3 cp "${webCtx}/dumps/${site}/${site}-${dateTime}${preDrupalUpgradeFlag}.sql.gz" "s3://biolands/latest/${site}-latest${preDrupalUpgradeFlag}.sql.gz"`)

  console.log('')
  consola.info(`${site}: transfered to ${S3_URL}}/${site}-latest-*`)

  execSync(`rm ${webCtx}/dumps/${site}/${site}-${dateTime}-site${preDrupalUpgradeFlag}.tgz`)
  execSync(`rm ${webCtx}/dumps/${site}/${site}-${dateTime}${preDrupalUpgradeFlag}.sql.gz`)

  consola.info(`${site}: backup files removed`)
}

function backUpPathAlias(site, { preDrupalUpgrade } = { preDrupalUpgrade: false }){
  const { S3_URL, S3_URL_YEAR_MONTH, dateTime } = getTimeParams( )
  // const { isLocal                     } = config        [branch]

  execSync(`cd ${webCtx}`)
  //const taxons = `taxonomy_term_data,taxonomy_term_field_data,taxonomy_term__field_cbd_country_group,taxonomy_term__field_cbd_id,taxonomy_term__field_country_cbd_guid,taxonomy_term__field_date,taxonomy_term__field_gef_id,taxonomy_term__field_image,taxonomy_term__field_image_url,taxonomy_term__field_index,taxonomy_term__field_iso3l_code,taxonomy_term__field_iso_code,taxonomy_term__field_is_un_country,taxonomy_term__field_machine_name,taxonomy_term__field_official_name,taxonomy_term__field_planning_item_type,taxonomy_term__field_protected_planet_id,taxonomy_term__field_un_number,taxonomy_term__field_un_official_short_name,taxonomy_term__field_un_region,taxonomy_term__field_url,taxonomy_term__field_www_id, taxonomy_term__parent`
  
  execSync(`mkdir -p ${webCtx}/dumps/${site}`)

  const preDUpgradeFlag = preDrupalUpgrade? '-drupal-upgrade' : ''

  execSync(`ddev drush @${site} sql:dump --tables-list=path_* --gzip --result-file="dumps/${site}/${site}-${dateTime}-path-alias${preDUpgradeFlag}.sql"`)
  execSync(`ddev drush @${site} sql:dump --tables-list=taxonomy_* --gzip --result-file="dumps/${site}/${site}-${dateTime}-taxon${preDUpgradeFlag}.sql"`)
  execSync(`ddev drush @${site} sql:dump --tables-list=entity_subqueu* --gzip --result-file="dumps/${site}/${site}-${dateTime}-subqueue${preDUpgradeFlag}.sql"`)

  // if(isLocal) return

  execSync(`aws s3 cp "${webCtx}/dumps/${site}/${site}-${dateTime}-path-alias${preDUpgradeFlag}.sql.gz" "${S3_URL_YEAR_MONTH}/${site}/${site}-${dateTime}-path-alias${preDUpgradeFlag}.sql.gz"`)
  execSync(`aws s3 cp "${webCtx}/dumps/${site}/${site}-${dateTime}-taxon${preDUpgradeFlag}.sql.gz" "${S3_URL_YEAR_MONTH}/${site}/${site}-${dateTime}-taxon${preDUpgradeFlag}.sql.gz"`)
  execSync(`aws s3 cp "${webCtx}/dumps/${site}/${site}-${dateTime}-subqueue${preDUpgradeFlag}.sql.gz" "${S3_URL_YEAR_MONTH}/${site}/${site}-${dateTime}-subqueue${preDUpgradeFlag}.sql.gz"`)

  execSync(`aws s3 cp "${webCtx}/dumps/${site}/${site}-${dateTime}-path-alias${preDUpgradeFlag}.sql.gz" "${S3_URL}/${site}-latest-path-alias${preDUpgradeFlag}.sql.gz"`)
  execSync(`aws s3 cp "${webCtx}/dumps/${site}/${site}-${dateTime}-taxon${preDUpgradeFlag}.sql.gz" "${S3_URL}/${site}-latest-taxon${preDUpgradeFlag}.sql.gz"`)
  execSync(`aws s3 cp "${webCtx}/dumps/${site}/${site}-${dateTime}-subqueue${preDUpgradeFlag}.sql.gz" "${S3_URL}/${site}-latest-subqueue${preDUpgradeFlag}.sql.gz"`)

  execSync(`rm ${webCtx}/dumps/${site}/${site}-${dateTime}-path-alias${preDUpgradeFlag}.sql.gz`)
  execSync(`rm ${webCtx}/dumps/${site}/${site}-${dateTime}-taxon${preDUpgradeFlag}.sql.gz`)
  execSync(`rm ${webCtx}/dumps/${site}/${site}-${dateTime}-subqueue${preDUpgradeFlag}.sql.gz`)
}

