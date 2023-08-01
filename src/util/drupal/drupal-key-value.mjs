import consola from 'consola';
import { unserialize as phpDeserialize, serialize as phpSerialize } from 'php-serialize';
import { getPool, getConnection, releaseConnection } from './db.mjs';

export async function setKeyValue (code, collection, name, configObject, locale = '') {
  try {
    await getPool(code);
    const phpSerializedConfigObject = phpSerialize(configObject);

    const db = await getConnection(code);

    const queryText = 'UPDATE key_value SET value = ? where name = ? and collection = ?';
    const queryVars = [phpSerializedConfigObject, name, collection];
    const response = await db.query(queryText, queryVars);

    if (!response.affectedRows) throw new Error(`setKeyValue: NOT FOUND ... where name = ${name} and collection = ${collection}`);

    return !!response.affectedRows;
  } catch (e) {
    consola.error(e);
  } finally {
    await releaseConnection(code);
  }
}

export async function getKeyValue (code, collection, name) {
  try {
    await getPool(code);

    const db = await getConnection(code);

    const response = await db.query(`SELECT CAST(value as char) as value  FROM key_value WHERE name = '${name}' and (collection='${collection}');`);

    const data = (response.map(({ value }) => {
      if (!value) return value;

      return phpDeserialize(value);
    })).filter(x => x);

    return data.length ? data[0] : undefined;
  } catch (e) {
    consola.error(e);
  } finally {
    await releaseConnection(code);
  }
}
