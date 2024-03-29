import consola from 'consola';
import { unserialize as phpDeserialize, serialize as phpSerialize } from 'php-serialize';
import { getPool, getConnection, releaseConnection } from './db.mjs';

export async function setConfigObject (code, name, configObject, locale = '') {
  try {
    await getPool(code);
    const phpSerializedConfigObject = phpSerialize(configObject);

    const db = await getConnection(code);

    const collection = !locale ? locale : `language.${locale}`;
    const queryText = 'UPDATE config SET  data = ? where name = ? and collection = ?';
    const queryVars = [phpSerializedConfigObject, name, collection];
    const response = await db.query(queryText, queryVars);

    if (!response.affectedRows) throw new Error(`setConfigObject: NOT FOUND ... where name = ${name} and collection = ${collection}`);

    return !!response.affectedRows;
  } catch (e) {
    consola.error(e);
  } finally {
    await releaseConnection(code);
  }
}

export async function createConfigObject (code, name, configObject, locale = '') {
  try {
    await getPool(code);
    const phpSerializedConfigObject = phpSerialize(configObject);

    const db = await getConnection(code);

    const collection = !locale ? locale : `language.${locale}`;
    const queryText = 'INSERT INTO config (collection, name, data) VALUES (?, ?, ?);';
    // 'UPDATE config SET  data = ? where name = ? and collection = ?'
    const queryVars = [collection, name, phpSerializedConfigObject];
    const response = await db.query(queryText, queryVars);

    if (!response.affectedRows) throw new Error('createConfigObject: ');

    return !!response.affectedRows;
  } catch (e) {
    // consola.error(e);
  } finally {
    // await releaseConnection(code);
  }
}

export async function getConfigObject (code, name, locale = '') {
  try {
    await getPool(code);

    const db = await getConnection(code);

    const whereCollection = !locale ? `(collection='${locale}')` : `collection='language.${locale}'`;
    const response = await db.query(`SELECT CAST(data as char) as data  FROM config WHERE name = '${name}' and ${whereCollection};`);

    const data = (response.map(({ data }) => {
      if (!data) return data;

      return phpDeserialize(data);
    })).filter(x => x);

    return data.length ? data[0] : undefined;
  } catch (e) {
    consola.error(e);
  } finally {
    await releaseConnection(code);
  }
}

export async function getDefaultLocale (code) {
  try {
    await getPool(code);

    const db = await getConnection(code);

    const response = await db.query('SELECT CAST(data as char) as data  FROM config WHERE name = \'system.site\'');

    const data = (response.map(({ data }) => {
      if (!data) return data;

      return phpDeserialize(data);
    })).filter(x => x);

    return data.length ? data[0].default_langcode : undefined;
  } catch (e) {
    consola.error(e);
  } finally {
    await releaseConnection(code);
  }
}

export async function enableJsonApiConfig (site) {
  const configExists = await getConfigObject(site, 'jsonapi.settings');

  const configObj = configExists || {};

  configObj.read_only = 0;

  if (configExists) return setConfigObject(site, 'jsonapi.settings', configObj);

  return createConfigObject(site, 'jsonapi.settings', configObj);
}

export async function disableJsonApiConfig (site) {
  const configObj = (await getConfigObject(site, 'jsonapi.settings')) || {};

  configObj.read_only = 1;

  await setConfigObject(site, 'jsonapi.settings', configObj);

  // spawnSync('ddev', [ 'drush', '-y', `@${site}`, 'pm:uninstall', 'jsonapi' ])

  // execSync(`ddev drush @${site} cr`)
}
