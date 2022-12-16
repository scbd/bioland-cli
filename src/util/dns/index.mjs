import AWS     from 'aws-sdk'
import config  from '../config.mjs'
import consola from 'consola'
import { changesFeedback } from './progess.mjs'

const route53 = new AWS.Route53()
const zoneMap = { 
                    'bioland.cbddev.xyz': 'Z09855241XIH1MY07ABK6',
                    'chm-cbd.net'       : 'Z17YZYXL9GEG03'       ,
                    'test.chm-cbd.net'  : 'Z02360093U5TPDSVFLSQA',
                    'status.chm-cbd.net': 'Z0866380247Q8N6P61IDR'
                }

export async function upsertDnsRecords(domain, cdn, targetSubDomains) {

    const   changes             = []
    const   hasPassedSubDomains = targetSubDomains && targetSubDomains.length
    const   subDomains          = targetSubDomains

    if(!hasPassedSubDomains) throw new Error(Util.dns.upsertDnsRecords)

    changes.push(await route53.changeResourceRecordSets(getBatchTemplate(subDomains, domain, cdn )).promise())

    await changesFeedback(changes, domain, cdn)
}

export async function upsertAllDnsRecords(domain, cdn) {
    const { sites } = config

    await  upsertDnsRecords(domain, cdn, Object.keys(sites))
}

export async function upsertAllProdDnsRecords(domain='chm-cbd.net', cdn='cdn.bioland.infra.cbd.int') {
    const sites = Object.fromEntries(Object.entries(config.sites).filter(([key, value]) => !value.environment))

    await upsertAllDnsRecords(domain, cdn, Object.keys(sites))
}

export function upsertAllTestDnsRecords(domain='test.chm-cbd.net', cdn='cdn.bioland.infra.cbd.int') {
    return upsertAllDnsRecords(domain, cdn)
}

export function upsertAllDevDnsRecords(domain='bioland.cbddev.xyz', cdn = 'dev.bioland.infra.cbd.int') {
    return upsertAllDnsRecords(domain, cdn)
}

function getBatchTemplate(subDomains=[], domain='bioland.cbddev.xyz', cdn = 'dev.bioland.infra.cbd.int') {

    const HostedZoneId = zoneMap[domain]
    const Changes      = []

    if(!domain || !HostedZoneId || !cdn || !subDomains.length) throw new Error('getBatchTemplate: missing required params')

    for (const subDomain of subDomains)
        Changes.push(
            {
                Action: 'UPSERT',
                ResourceRecordSet: {
                    Name: `${subDomain}.${domain}.`,
                    Type: 'CNAME',
                    TTL: 60,
                    ResourceRecords: [{ Value: cdn }]
                }
            }
        )

    return { HostedZoneId, ChangeBatch: { Changes } }
}