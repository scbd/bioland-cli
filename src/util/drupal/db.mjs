import consola       from 'consola'
import mariadb       from 'mariadb'
import isPlainObject from 'lodash.isplainobject'
import { getCountryNameByCode } from '../countries.mjs'

const pools       = {}
const connections = {}

export function getPool(dbName){
    if(pools[dbName]) return pools[dbName]
    
    pools[dbName] = mariadb.createPool({
        host           : '127.0.0.1',
        port           : parseInt(3600),
        user           : 'db',
        password       : 'db',
        database       : dbName,
        connectionLimit: 5
    });

    return pools[dbName]
}

export async function endPool(dbName){
    const pool = pools[dbName]

    if(!pool) return

    await pool.end()

    delete(pools[dbName])
}

export async function getConnection(dbName){
    if(connections[dbName]) return connections[dbName]
    
    connections[dbName] = await pools[dbName].getConnection();

    return connections[dbName]
}

export function closePool(dbName){
    if(pools[dbName]) return pools[dbName].end()
}

export function releaseConnection(dbName){
    if(connections[dbName]) return connections[dbName].release()
}


export function endConnection(dbName){
    if(connections[dbName]) return connections[dbName].end()
}

export const dbSet  = async (dbName, queryText, queryVars) =>{
  
    try{
        await getPool(dbName)

        const db  = await getConnection(dbName)

        const response    = await db.query(queryText, queryVars);

        if(!response.affectedRows) throw new Error(`dbQuery: NOT FOUND ... ${queryText} : values => ${JSOn.stringify(queryVars)}`)

        // await releaseConnection(dbName)
        return !!response.affectedRows
    }catch(e){
        consola.error(e)
    } finally {
        await releaseConnection(dbName)//release to pool
    }
}

export const dbGet  =  async (dbName, queryString) =>{

    try{
        await getPool(dbName)

        const db  = await getConnection(dbName)

        const res = await db.query(queryString)

        // await releaseConnection(dbName)

        return res
    }catch(e){
        consola.error(e)
    } finally {
	    await releaseConnection(dbName)
    }
}

export async function getSiteLocales(dbName){


    try{
        await getPool(dbName)
        const db       = await getConnection(dbName)

        const response = await db.query('SELECT language  FROM locales_target')

        return unique(response.map( ({ language }) => language))
    }catch(e){
        consola.error(e)
    } finally {
	    await releaseConnection(dbName)
    }
}


function unique (array) {
    return Array.from(new Set(array.map((el)=>{ if(isPlainObject(el)) return JSON.stringify(el); else return el}))).map(jsonParse)
}

function jsonParse(el){ try{ return JSON.parse(el); }catch(e){ return el; } }

function cleanLangCodes(codes){

    const cleanCodes = unique(codes.map( (code) => {
        if(!code) return 'en'
        if(code.includes('language.')) return code.replace('language.', '')
        
        throw new Error('cleanLangCodes: un recognized language format')
    }))

    cleanCodes.push('')

    return cleanCodes
}

export async function getDrupalCountryId(dbName){
    await getPool(dbName)
    const db  = await getConnection(dbName)
    const   countryName        =  await getCountryNameByCode(dbName)

    consola.warn(countryName)
    
    const mappedUuid = drupalTaxonomyCountryNameMap(countryName)

    if(mappedUuid) return mappedUuid
    // create the connection

    const query = ' SELECT `uuid` FROM `taxonomy_term_field_data` JOIN `taxonomy_term_data` ON taxonomy_term_field_data.tid = taxonomy_term_data.tid WHERE `name` = ? ;'
  

    const rows  = await db.execute(query, [countryName]);
    const { uuid } = rows[0]

    await releaseConnection(dbName)
    return uuid
  }

function drupalTaxonomyCountryNameMap(name){
    const taxMap = {
        'United Republic of Tanzania' : 'ba6d9f84-e258-4896-8cc3-10fb4eb1ea6e'
    }

    return taxMap[name] ? taxMap[name] : ''
}