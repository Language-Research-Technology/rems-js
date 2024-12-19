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
        console.log('error instance for rems');
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
    let lic;
    try {
        if (access.license.id) {
            lic = await rems.getLicense({id: access.license.id})
        } else {
            //It may break but there doesn't seem to be pagination on licenses on REMS...
            //If there is pagination, code to search license.
            lic = await rems.getLicense({content: access.license.content});
        }
        if (!lic?.id) {
            lic = await rems.license({
                type: 'link',
                organizationId: configuration.organizationId,
                title: access.license.title,
                content: access.license.content
            });
        } else {
            console.log('lic already created', lic['id']);
        }
    } catch (e) {
        console.log('error instance for licence');
        throw new Error(e);
    }
    let form;
    try {
        if (access.form) {
            //If you know the form id do not create another one.
            if (access.form.id) {
                form = await rems.getForm({id: access.form.id});
            } else {
                const fields = [];
                for (let f of access.form.fields) {
                    const field = rems.formField({
                        type: f.type,
                        privacy: f.privacy,
                        title: f.title,
                        info: f.info,
                        optional: f.optional,
                        options: f.options,
                        fieldId: uuidv4(),
                        placeholder: f.placeholder
                    });
                    fields.push(field);
                }
                form = await rems.form({
                    // formId: access.form.newId,
                    organizationId: configuration.organizationId,
                    name: access.form.name,
                    title: access.form.title,
                    content: access.form.content,
                    fields
                });
            }
        }
    } catch (e) {
        console.log('error instance for forms');
        throw new Error(e);
    }
    let resource;
    try {
        resource = await rems.getResource({resid: access.resource.id});
        if (!resource?.id) {
            resource = await rems.resource({
                resId: access.resource.id, //In our case a license === resource
                organizationId: organization.id,
                enabled: true,
                archived: true,
                licenses: [lic.id]
            });
        } else {
            console.log('resource already created', resource['id']);
        }
    } catch (e) {
        console.log('error instance for resource');
        throw new Error(e);
    }
    let workflow;
    try {
        workflow = await rems.getWorkflow({title: access.workflow.title});
        if (!workflow?.id) {
            workflow = await rems.workflow({
                forms: form ? [form.id] : [],
                licenses: lic ? [lic.id] : [],
                organizationId: configuration.organizationId,
                title: access.workflow.title,
                handlers: access.workflow.handlers //Add all of your handlers here.
            });
        } else {
            console.log('workflow already created', workflow['id']);
        }
    } catch (e) {
        console.log('error instance for workflow');
        throw new Error(e);
    }
    if(configuration.categoryId) {
        let category;
        try {
            category = await rems.getCategory({id: configuration.categoryId});
            if (!category?.id) {
                category = await rems.category({
                    title: access.category.title,
                    description: access.category.description
                });
            } else {
                console.log('category already created', category);
            }
        } catch (e) {
            console.log('error instance for category');
            throw new Error(e);
        }
    }
    let catalogueItem;
    try {
        catalogueItem = await rems.getCatalogueItem({resource: access.resource.id});
        // Only create a catalogue item if no other catalogue item with the resource is present
        // And will ignore if enabled: false
        if (!catalogueItem?.id) {
            catalogueItem = await rems.catalogueItem({
                resId: resource.id, //In our case a license === catalogueItem
                formId: form?.id,
                workflowId: workflow.id,
                organizationId: configuration.organizationId,
                title: access.catalogue.title,
                url: access.catalogue.url,
                enabled: true,
                archived: false,
                categories: [category.id]
            });
        } else {
            console.log('Catalogue already assign to resource');
            console.log(`Id: ${catalogueItem.id}`);
            console.log(`Resource Id: ${catalogueItem.resid}`);
        }
        const cI = await rems.getCatalogueItem({id: catalogueItem.id});
        console.log('Catalogue Item:')
        console.log(JSON.stringify(cI));
    } catch (e) {
        console.log('error instance for catalogueItem');
        throw new Error(e);
    }
}
