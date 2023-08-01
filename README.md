# bioland-cli


const   generalCommands   = [ 'backUp', 'cache',  'reload',  'custom', 'initTestSite' ]

yarn bcli backUp // backs up all sites
yarn bcli backUp be // backs up belgium

yarn bcli reload  (-d)- updates ddev, drush and reverse proxy with new sites from the config

yarn bcli initTestSite ht (-d)// makes changes as per checklist 

yarn bcli custom ./scripts/bcli/my-custom-script.mjs


custom script:

export default async (branch, commandArgs, { Util }) => {

    const sites = JSON.parse(JSON.stringify(Util.config.siteCodes))

    for (const countryCode of sites ){
        await fixPagesDemo(countryCode, Util)

        await Util.endPool(countryCode)
        await Util.sleep(10000)
    }
}

async function fixPagesDemo(site, Util){

    const locale        = await Util.getDefaultLocale(site)
    const defaultLocale = locale === 'en'? '' : 'en'

    await Util.deleteNode(site, 'node/article', '0daa3f7b-373d-427a-8051-19fb1d44d4d0', defaultLocale)

    await Util.deleteNode(site, 'node/article', 'b8dfd60a-1a51-4621-92ac-fd2b05c305b5', defaultLocale)
    await Util.deleteNode(site, 'node/article', '8cfac351-900b-4024-a519-5784db8d3f2b', defaultLocale)

    const data    = { data: { type: "menu_link_content--menu_link_content", id:'72aff607-a2e4-4635-80ad-623b3fa35cce', attributes: { enabled: 0   } } }

    await Util.patch(site, 'menu_link_content/menu_link_content', '72aff607-a2e4-4635-80ad-623b3fa35cce', data, defaultLocale)

    consola.info(`${site}: articles deleted`)
}

initTestSite

1. ad site to config https://github.com/scbd/bioland-config.git, dev should be dev env https://github.com/scbd/bioland-config.git#dev and push
2. ssh into server
3. cd bioland && yarn clean-install - (pulls latest config)
4. yarn bcli reload (-d) - updates drupal/ddev/reverse proxy with folder and config files, (-d) for dev server
5. ddev restart (load new configs)
6. yarn bcli initTestSite ${newSiteCode}
7. if custom url, have client cname the domain  to ${code}.bioland.infra.cbd.int and  point ${code}.bioland.infra.cbd.int to cdn.bioland.infra.cbd.int
8. ddev drush @${newSiteCode} cr
9. login, manually add remove languages
10. manually add GA code if not a country
11. manually configure SAML - if not a country code such as 'asean'


SAML Config - if not a country code


1. in a local bioland directory, run 'yarn bcli generateSpList' which will create a file in that directory spList.js
2. tunnel into the main swarm (us3 usually)
3. create new secret, spList.${numberAny}.js and copy value of generated spList.js into your new secret
4. go to the website-accounts service, and change the add the new secret you created with location '/usr/src/app/saml/service-providers/list.js'
5. delete the old secret with the same location '	/usr/src/app/saml/service-providers/list.js'
6. then apply changes
7. then test the saml