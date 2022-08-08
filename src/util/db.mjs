import consola       from 'consola'
import mariadb       from 'mariadb'
import isPlainObject from 'lodash.isplainobject'
import { getCountryNameByCode } from './countries.mjs'

//

export const dbSet  = async (dbName, queryText, queryVars) =>{
    const db = { connection: undefined }
    try{
        const pool = mariadb.createPool({
                                            host           : '127.0.0.1',
                                            port           : parseInt(3600),
                                            user           : 'db',
                                            password       : 'db',
                                            database       : dbName,
                                            connectionLimit: 5
                                        });



        db.connection  = await pool.getConnection();

        const response    = await db.connection.query(queryText, queryVars);

        if(!response.affectedRows) throw new Error(`dbQuery: NOT FOUND ... ${queryText} : values => ${JSOn.stringify(queryVars)}`)

        return !!response.affectedRows
    }catch(e){
        consola.error(e)
    } finally {
	    if (!db.connection) return 

        db.connection.release(); //release to pool
    }
}

export const dbGet  =  async (dbName, queryString) =>{
    const db = { connection: undefined }
    try{
        const pool = mariadb.createPool({
                                            host           : '127.0.0.1',
                                            port           : parseInt(3600),
                                            user           : 'db',
                                            password       : 'db',
                                            database       : dbName,
                                            connectionLimit: 5
                                        });



        db.connection  = await pool.getConnection();

        return db.connection.query(queryString)
    }catch(e){
        consola.error(e)
    } finally {
	    if (!db.connection) return 

        db.connection.release(); //release to pool
    }
}

export async function getSiteLocales(code){
    const pool = mariadb.createPool({
                                        host           : '127.0.0.1',
                                        port           : parseInt(3600),
                                        user           : 'db',
                                        password       : 'db',
                                        database       : code,
                                        connectionLimit: 5
                                    });
    const db = { connection: undefined }

    try{
        db.connection  = await pool.getConnection();

        const response = await db.connection.query('SELECT collection  FROM config')

        return cleanLangCodes(unique(response.map( ({ collection }) => collection)))
    }catch(e){
        consola.error(e)
    } finally {
	    if (!db.connection) return 

        db.connection.release(); //release to pool
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

export async function getDrupalCountryId(code){
    const pool = mariadb.createPool({
        host           : '127.0.0.1',
        port           : parseInt(3600),
        user           : 'db',
        password       : 'db',
        database       : code,
        connectionLimit: 5
    });
    const db = { connection: undefined }
    const   countryName        =   await getCountryNameByCode(code)
  
    // create the connection
    db.connection = await pool.getConnection();
    const query      = ' SELECT `uuid` FROM `taxonomy_term_field_data` JOIN `taxonomy_term_data` ON taxonomy_term_field_data.tid = taxonomy_term_data.tid WHERE `name` = ? ;'
  

    const rows  = await db.connection.execute(query, [countryName]);
    const { uuid } = rows[0]

    db.connection.release();
    return uuid
  }