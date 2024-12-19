import {REMS} from "./index.js";
import {v4 as uuidv4} from "uuid";
import fs from 'fs';

(async function () {
    let configuration = null;
    let access = null;
    if (process.argv[2]) {
        console.log(`Configuration file ${process.argv[2]}`);
        configuration = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
    }
    if (process.argv[3]) {
        console.log(`Access file ${process.argv[3]}`);
        access = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
    }
    if (configuration && access) {
        await setup({configuration, access});
    } else {
        throw new Error('Configuration and Access files missing');
    }

})();

async function setup({configuration, access}) {
    let rems;
    try {
        rems = new REMS({
            host: configuration.host,
            userId: configuration.userId,
            key: configuration.api_key,
            apis: configuration.apis
        });

    } catch (e) {
        console.log('error instance for organization');
        throw new Error(e);
    }
    let organization;
    try {
        organization = await rems.getOrganization({id: configuration.organizationId});
        if (!organization?.id) {
            organization = await rems.organization({
                id: configuration.organizationId,
                archived: false,
                enabled: true,
                shortName: access.organization.shortName,
                organizationEmail: access.organization.email,
                organizationName: access.organization.name,
                reviewEmailName: access.organization.reviewEmailName,
                ownerId: configuration.userId,
                userId: configuration.userId,
                userName: configuration.userName,
                userEmail: configuration.userEmail,
                organizationId: configuration.organizationId
            });
        } else {
            console.log('organization already created', organization['id']);
        }
    } catch (e) {
        console.log('error instance for organization');
        throw new Error(e);
    }
}
