import { REMS } from "./index.js";
import { v4 as uuidv4 } from "uuid";
import fs from 'fs';

(async function () {
  let configuration = null;
  let access = null;
  if (process.argv[2]) {
    console.log(`Configuration file: ${process.argv[2]}`);
    configuration = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  }
  if (process.argv[3]) {
    console.log(`Access file: ${process.argv[3]}`);
    access = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
  }
  if (configuration && access) {
    await setup({ configuration, access });
  } else {
    throw new Error('Configuration and Access files missing');
  }

})();

async function setup({ configuration, access }) {
  try {
    const rems = new REMS({
      host: configuration.host,
      userId: configuration.userId,
      key: configuration.api_key,
      apis: configuration.apis
    });

    let organization = await rems.getOrganization({ id: configuration.organizationId });
    if (!organization?.id) {
      organization = await rems.organization({
        id: access.organization.id,
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
    }
    let lic;
    if (access.license.id) {
      lic = await rems.getLicense({ id: access.license.id })
    } else {
      //It may break but there doesn't seem to be pagination on licenses on REMS...
      //If there is pagination, code to search license.
      lic = await rems.getLicense({ content: access.license.content });
    }
    if (!lic?.id) {
      lic = await rems.license({
        type: 'link',
        organizationId: configuration.organizationId,
        title: access.license.title,
        content: access.license.content
      });
    }
    let form;
    if (access.form) {
      //If you know the form id do not create another one.
      if (access.form.id) {
        console.log('looking for form', access.form.id);
        form = await rems.getForm({ id: access.form.id });
        // console.log('form returned = ', form);
      }
      if (!form) {
        console.log('no form found')
        console.log('creating form fields')
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
        console.log('creating form')
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
    let resource;
    resource = await rems.getResource({ resid: access.resource.id });
    if (!resource?.id) {
      resource = await rems.resource({
        resId: access.resource.id, //In our case a license === resource
        organizationId: organization.id,
        enabled: true,
        archived: true,
        licenses: [lic.id]
      });
    }
    let workflow;
    workflow = await rems.getWorkflow({ title: access.workflow.title });
    if (!workflow?.id) {
      workflow = await rems.workflow({
        forms: form ? [form.id] : [],
        licenses: lic ? [lic.id] : [],
        organizationId: configuration.organizationId,
        title: access.workflow.title,
        handlers: access.workflow.handlers //Add all of your handlers here.
      });
    }
    let category;
    let categories = [];
    if (configuration.categoryId) {
      try {
        category = await rems.getCategory({ id: configuration.categoryId });
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
      categories.push(category.id);
    }
    let catalogueItem;
    catalogueItem = await rems.getCatalogueItem({ resource: access.resource.id });
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
        categories: categories
      });
    }
    const cI = await rems.getCatalogueItem({ id: catalogueItem.id });
    console.log('Catalogue Item:')
    console.log(JSON.stringify(cI));
  } catch (e) {
    throw new Error(e);
  }
};
