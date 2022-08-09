import consola from 'consola'
import { unserialize as phpDeserialize, serialize as phpSerialize } from 'php-serialize'
import { getPool, getConnection, releaseConnection } from './db.mjs'

export async function setConfigObject(code, name, configObject, locale=''){

    try{
        await getPool(code)
        const phpSerializedConfigObject = phpSerialize(configObject)

        const db = await getConnection(code)

        const collection  = !locale? locale: `language.${locale}`
        const queryText   = 'UPDATE config SET  data = ? where name = ? and collection = ?'
        const queryVars   = [ phpSerializedConfigObject, name, collection ]
        const response    = await db.query(queryText, queryVars);

        if(!response.affectedRows) throw new Error(`setConfigObject: NOT FOUND ... where name = ${name} and collection = ${collection}`)

        return !!response.affectedRows
    }catch(e){
        consola.error(e)
    } finally {
       await releaseConnection(code)
    }
}

export async function createConfigObject(code, name, configObject, locale=''){

    try{
        await getPool(code)
        const phpSerializedConfigObject = phpSerialize(configObject)

        const db = await getConnection(code)

        const collection  = !locale? locale: `language.${locale}`
        const queryText   = `INSERT INTO ${site}.config (collection, name, data) VALUES (${collection}, ${name}, ?);`
        //'UPDATE config SET  data = ? where name = ? and collection = ?'
        const queryVars   = [ data ]
        const response    = await db.query(queryText, queryVars);

        if(!response.affectedRows) throw new Error(`createConfigObject: `)

        return !!response.affectedRows
    }catch(e){
        consola.error(e)
    } finally {
       await releaseConnection(code)
    }
}

export async function getConfigObject(code, name, locale=''){


    try{
        await getPool(code)

        const db  = await  getConnection(code)

        const whereCollection = !locale? `(collection='${locale}')`: `collection='language.${locale}'`
        const response        = await db.query(`SELECT CAST(data as char) as data  FROM config WHERE name = '${name}' and ${whereCollection};`)

        const data = (response.map(( { data } ) => {
                                                        if(!data) return data

                                                        return phpDeserialize(data)
                                                    })).filter( x => x)

        return data.length? data[0] : undefined
    }catch(e){
        consola.error(e)
    } finally {
       await releaseConnection(code)
    }
}