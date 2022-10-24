import consola from 'consola'
import AWS     from 'aws-sdk'

const route53 = new AWS.Route53()

export async function changesFeedback(changes, domain, cdn){

    if(!changes || !changes.length) throw new Error('Util.dns.changesFeedback: No AWS DNS changes provided')

    console.log('\n')
    while (!await isDnsUpdateDone(changes)) {
        try {

            consola.info(`DNS upsert ${domain} => ${cdn}\n`)
            consola.info(`DNS upsert status: PENDING\n`)

            await new Promise(resolve => setTimeout(resolve, 5000))
        } catch (e) {
            consola.error(e)
        }
    }
    consola.info(`DNS upsert ${domain} => ${cdn}\n`)
    consola.info(`DNS upsert status: Done\n`)
}

async function isDnsUpdateDone(changes) {
    const checkPromises = []

    for (const { ChangeInfo } of changes)
        checkPromises.push(route53.getChange({ Id: ChangeInfo.Id }).promise())

    const changesStatus = await Promise.all(checkPromises)

    for (const { ChangeInfo } of changesStatus)
        if (ChangeInfo.Status === 'PENDING') return false

    return true
}