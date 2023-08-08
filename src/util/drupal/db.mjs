import consola from 'consola';
import mariadb from 'mariadb';
import isPlainObject from 'lodash.isplainobject';
import { getCountryNameByCode } from '../countries.mjs';

const pools = {};
const connections = {};

export function getPool (dbName) {
  if (pools[dbName]) return pools[dbName];

  pools[dbName] = mariadb.createPool({
    host: '127.0.0.1',
    port: parseInt(3600),
    user: 'db',
    password: 'db',
    database: dbName,
    connectionLimit: 5
  });

  return pools[dbName];
}

export async function endPool (dbName) {
  const pool = pools[dbName];

  if (!pool) return;

  await pool.end();

  delete (pools[dbName]);
}

export async function getConnection (dbName) {
  if (connections[dbName]) return connections[dbName];

  connections[dbName] = await pools[dbName].getConnection();

  return connections[dbName];
}

export function closePool (dbName) {
  if (pools[dbName]) return pools[dbName].end();
}

export function releaseConnection (dbName) {
  if (connections[dbName]) return connections[dbName].release();
}

export function endConnection (dbName) {
  if (connections[dbName]) return connections[dbName].end();
}

export const dbSet = async (dbName, queryText, queryVars) => {
  try {
    await getPool(dbName);

    const db = await getConnection(dbName);

    const response = await db.query(queryText, queryVars);

    if (!response.affectedRows) throw new Error(`dbQuery: NOT FOUND ... ${queryText} : values => ${JSON.stringify(queryVars)}`);

    // await releaseConnection(dbName)
    return !!response.affectedRows;
  } catch (e) {
    consola.error(e);
  } finally {
    await releaseConnection(dbName);// release to pool
  }
};

export const dbBatch = async (dbName, queryText, queryVars) => {
  try {
    await getPool(dbName);

    const db = await getConnection(dbName);

    const response = await db.batch(queryText, queryVars);

    if (!response.affectedRows) throw new Error(`dbBatch: NOT FOUND ... ${queryText} : values => ${JSON.stringify(queryVars)}`);

    // await releaseConnection(dbName)
    return !!response.affectedRows;
  } catch (e) {
    consola.error(e);
  } finally {
    await releaseConnection(dbName);// release to pool
  }
};

export const dbCreateTaxonomyFieldTable = async (dbName, fieldName, type = 'varchar(512)') => {
  try {
    await getPool(dbName);

    const db = await getConnection(dbName);

    const sql = `CREATE TABLE \`taxonomy_term__field_${fieldName}\` (
                        \`bundle\` varchar(128) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL DEFAULT '' COMMENT 'The field instance bundle to which this row belongs, used when deleting a field instance',
                        \`deleted\` tinyint(4) NOT NULL DEFAULT 0 COMMENT 'A boolean indicating whether this data item has been deleted',
                        \`entity_id\` int(10) unsigned NOT NULL COMMENT 'The entity id this data is attached to',
                        \`revision_id\` int(10) unsigned NOT NULL COMMENT 'The entity revision id this data is attached to',
                        \`langcode\` varchar(32) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL DEFAULT '' COMMENT 'The language code for this data item.',
                        \`delta\` int(10) unsigned NOT NULL COMMENT 'The sequence number for this data item, used for multi-value fields',
                        \`field_${fieldName}_value\` ${type} NOT NULL,
                        PRIMARY KEY (\`entity_id\`,\`deleted\`,\`delta\`,\`langcode\`),
                        KEY \`bundle\` (\`bundle\`),
                        KEY \`revision_id\` (\`revision_id\`)
                        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Data storage for taxonomy_term field field_${fieldName}.';`;
    const response = await db.query(sql);

    const revSql = ` CREATE TABLE \`taxonomy_term_revision__field_${fieldName}\` (
                            \`bundle\` varchar(128) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL DEFAULT '' COMMENT 'The field instance bundle to which this row belongs, used when deleting a field instance',
                            \`deleted\` tinyint(4) NOT NULL DEFAULT 0 COMMENT 'A boolean indicating whether this data item has been deleted',
                            \`entity_id\` int(10) unsigned NOT NULL COMMENT 'The entity id this data is attached to',
                            \`revision_id\` int(10) unsigned NOT NULL COMMENT 'The entity revision id this data is attached to',
                            \`langcode\` varchar(32) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL DEFAULT '' COMMENT 'The language code for this data item.',
                            \`delta\` int(10) unsigned NOT NULL COMMENT 'The sequence number for this data item, used for multi-value fields',
                            \`field_${fieldName}_value\` ${type} NOT NULL,
                            PRIMARY KEY (\`entity_id\`,\`revision_id\`,\`deleted\`,\`delta\`,\`langcode\`),
                            KEY \`bundle\` (\`bundle\`),
                            KEY \`revision_id\` (\`revision_id\`)
                            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Revision archive storage for taxonomy_term field field…';`;

    await db.query(revSql);
    // if(!response.affectedRows) throw new Error(`dbQuery: NOT FOUND ... ${queryText} : values => ${JSOn.stringify(queryVars)}`)

    // await releaseConnection(dbName)
    return !!response.affectedRows;
  } catch (e) {
    consola.error(e);
  } finally {
    await releaseConnection(dbName);// release to pool
  }
};

export const dbGet = async (dbName, queryString) => {
  try {
    await getPool(dbName);

    const db = await getConnection(dbName);

    const res = await db.query(queryString);

    // await releaseConnection(dbName)

    return res;
  } catch (e) {
    consola.error(e);
  } finally {
    await releaseConnection(dbName);
  }
};

export async function getSiteLocales (dbName) {
  try {
    await getPool(dbName);
    const db = await getConnection(dbName);
    const response = await db.query('SELECT language  FROM locales_target');

    response.push({ language: 'en' });

    return unique(response.map(({ language }) => language)).map((language) => {
      if (language === 'zh-hans') return 'zh';

      return language;
    });
  } catch (e) {
    consola.error(e);
  } finally {
    await releaseConnection(dbName);
  }
}

function unique (array) {
  return Array.from(new Set(array.map((el) => { if (isPlainObject(el)) return JSON.stringify(el); else return el; }))).map(jsonParse);
}

function jsonParse (el) { try { return JSON.parse(el); } catch (e) { return el; } }

export async function getDrupalCountryId (dbName, countryCode) {
  await getPool(dbName);
  const db = await getConnection(dbName);
  const countryName = await getCountryNameByCode(countryCode || dbName);

  const mappedUuid = drupalTaxonomyCountryNameMap(countryName);

  if (mappedUuid) return mappedUuid;

  const query = ' SELECT `uuid` FROM `taxonomy_term__field_iso_code` JOIN `taxonomy_term_data` ON taxonomy_term__field_iso_code.entity_id = taxonomy_term_data.tid WHERE `field_iso_code_value` = ? ;';

  const code = countryCode || dbName;
  const rows = await db.execute(query, [code.toUpperCase()]);
  const { uuid } = rows[0];

  await releaseConnection(dbName);
  return uuid;
}

function drupalTaxonomyCountryNameMap (name) {
  const taxMap = {
    'United Republic of Tanzania': 'ba6d9f84-e258-4896-8cc3-10fb4eb1ea6e'
  };

  return taxMap[name] ? taxMap[name] : '';
}
