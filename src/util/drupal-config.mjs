import mariadb from 'mariadb'
import consola from 'consola'
import { unserialize as phpDeserialize, serialize as phpSerialize } from 'php-serialize'


export async function setConfigObject(code, name, configObject, locale=''){
    const pool = mariadb.createPool({
        host: '127.0.0.1', 
        port: parseInt(3600),
        user: 'db', 
        password: 'db', 
        database: code, 
        connectionLimit: 5
    });
    const db = { connection: undefined }

    try{
        const phpSerializedConfigObject = phpSerialize(configObject)

        db.connection = await pool.getConnection();

        const collection  = !locale? locale: `language.${locale}`
        const queryText   = 'UPDATE config SET  data = ? where name = ? and collection = ?'
        const queryVars   = [ phpSerializedConfigObject, name, collection ]
        const response    = await db.connection.query(queryText, queryVars);

        if(!response.affectedRows) throw new Error(`setConfigObject: NOT FOUND ... where name = ${name} and collection = ${collection}`)

        return !!response.affectedRows
    }catch(e){
        consola.error(e)
    } finally {
	    if (!db.connection) return 

        db.connection.release(); //release to pool
    }
}


export async function getConfigObject(code, name, locale=''){
    const pool = mariadb.createPool({
        host: '127.0.0.1', 
        port: parseInt(3600),
        user: 'db', 
        password: 'db', 
        database: code, 
        connectionLimit: 5
    });
    const db = { connection: undefined }

    try{
        db.connection = await pool.getConnection();

        const whereCollection = !locale? `(collection='${locale}')`: `collection='language.${locale}'`
        const response        = await db.connection.query(`SELECT CAST(data as char) as data  FROM config WHERE name = '${name}' and ${whereCollection};`)

        const data = (response.map(( { data } ) => {
                                                        if(!data) return data

                                                        return phpDeserialize(data)
                                                    })).filter( x => x)

        return data.length? data[0] : undefined
    }catch(e){
        consola.error(e)
    } finally {
	    if (!db.connection) return 

        db.connection.release(); //release to pool
    }
}