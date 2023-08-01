import consola from 'consola';

export default async (branch, commandArgs, { Util }) => {
  const successes = [];
  const fails = [];
  const exclude = [...successes, ...fails];

  const sites = JSON.parse(JSON.stringify(Util.config.siteCodes)).filter(x => !exclude.includes(x));

  let remaining = sites.length;

  for (const countryCode of sites) {
    consola.error('======== remaining:', remaining);
    consola.warn('starting site: ', countryCode);

    const query = "SELECT * FROM `taxonomy_term__field_image_url` WHERE `field_image_url_uri` LIKE '%http://www8%' OR `field_image_url_uri` LIKE '%http://%' ORDER BY `entity_id`,`deleted`,`delta`,`langcode` LIMIT 300 OFFSET 0;";

    const rows = await Util.dbGet(countryCode, query);

    for (const { bundle, entity_id, field_image_url_uri } of rows) { await Util.dbSet(countryCode, `Update taxonomy_term__field_image_url SET  field_image_url_uri = ? WHERE entity_id = ${entity_id} AND bundle = '${bundle}' `, [(field_image_url_uri.replace('http://www8', 'https://www')).replace('http://', 'https://')]); } // eslint-disable-line camelcase

    const query2 = "SELECT * FROM `taxonomy_term_revision__field_image_url` WHERE `field_image_url_uri` LIKE '%http://www8%' OR `field_image_url_uri` LIKE '%http://%'  ORDER BY `entity_id`,`deleted`,`delta`,`langcode` LIMIT 300 OFFSET 0;";

    const rows2 = await Util.dbGet(countryCode, query2);

    for (const { bundle, entity_id, field_image_url_uri } of rows2) { await Util.dbSet(countryCode, `Update taxonomy_term_revision__field_image_url SET  field_image_url_uri = ? WHERE entity_id = ${entity_id} AND bundle = '${bundle}' `, [(field_image_url_uri.replace('http://www8', 'https://www')).replace('http://', 'https://')]); } // eslint-disable-line camelcase

    remaining--;

    await Util.endPool(countryCode);
    await Util.sleep(1000);
  }
};
