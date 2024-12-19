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
    try {
        const rems = new REMS({
            host: configuration.host,
            userId: configuration.userId,
            key: configuration.api_key,
            apis: configuration.apis
        });
        const resourceId = 'https://language-research-technology.github.io/qa/licenses/farms-to-freeways/all/v1/';
        let catalogueItems = await rems.getCatalogueItems();

        for (let item of catalogueItems) {
            // console.log(item['resid']);
            if (item['resid'] === resourceId) {
                console.log(item['id'])
            }
        }
        let catalogueItem = await rems.getCatalogueItem({resource: resourceId});
        console.log(catalogueItem['id']);

    } catch (e) {
        throw new Error(e);
    }
}
