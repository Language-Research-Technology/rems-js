
class REMS {
  constructor({ host, key, userId, apis }) {
    this.host = host;
    this.headers = {
      'Content-Type': 'application/json',
      'x-rems-api-key': key,
      'x-rems-user-id': userId
    }
    this.apis = apis;
  }

  async post({ url, data }) {
    let response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(data)
      });
      if (response.status !== 200) {
        console.error(url);
        console.error(response.statusText);
      }
      const responseData = await response.json();
      // console.log('Response:', responseData);
      if (responseData.errors) {
        if (responseData['schema']) {
          console.error(`Error Schema: ${responseData['schema']}`)
        }
        throw new Error(`Error: ${JSON.stringify(responseData['errors'])}`);
      }
      return responseData;
    } catch (error) {
      console.error('Error:', error);
      throw new Error(`HTTP error! Status: ${response?.status}:${response?.statusText}`);
    }
  }

  async get({ url }) {
    let response;
    try {
      response = await fetch(url, {
        method: 'GET',
        headers: this.headers
      });
      if (response) {
        if (response?.status !== 200) {
          console.error(url);
          console.error('GET Error:', response?.statusText);
        }
        const responseData = await response.json();
        // console.log('GET Response:', responseData);
        return responseData;
      } else {
        return null;
      }
    } catch (error) {
      console.log(error.cause);
      throw new Error(`GET request failed! Status: ${response?.status}:${response?.statusText}`);
    }

  }

  async organization({
    id,
    archived,
    enabled,
    shortName,
    organizationEmail,
    reviewEmailName,
    ownerId,
    userName,
    userEmail,
    organizationName,
    userId,
    organizationId
  }) {
    const payload = {
      "archived": archived,
      "organization/id": id,
      "organization/short-name": {
        "en": shortName
      },
      "organization/review-emails": [
        {
          "name": {
            "en": reviewEmailName
          },
          "email": organizationEmail
        }
      ],
      "enabled": enabled,
      "organization/owners": [
        {
          "userid": ownerId
        }
      ],
      "organization/name": {
        "en": organizationName
      }
    }

    const organization = await this.post({
      url: `${this.host}${this.apis.create_organization}`,
      data: payload
    });
    if (organization['organization/id']) {
      organization['id'] = organization['organization/id']
    }
    return organization;
  }

  async getOrganization({ id }) {

    const organization = await this.get({
      url: `${this.host}${this.apis.get_organization}/${encodeURIComponent(id)}`
    });
    if (organization['organization/id']) {
      organization['id'] = organization['organization/id']
    }
    return organization;
  }

  async license({ type, organizationId, title, content }) {
    const payload = {
      "licensetype": type,
      "organization": {
        "organization/id": organizationId
      },
      "localizations": {
        "en": {
          "title": title,
          "textcontent": content
        }
      }
    }
    return await this.post({
      url: `${this.host}${this.apis.create_license}`,
      data: payload
    });

  }

  async getLicense({ id, content }) {
    if (id) {
      return await this.get({
        url: `${this.host}${this.apis.get_license}/${id}`
      });
    } else if (content) {
      const licenses = await this.get({
        url: `${this.host}${this.apis.get_license}`
      });
      for (let l of licenses) {
        if (l?.localizations?.en?.textcontent === content) {
          return { id: l.id, success: true }
        }
      }
    }
  }

  async form({ formId, organizationId, title, name, titleExternal, fields }) {
    const payload = {
      // "form-id": formId,
      "organization": {
        "organization/id": organizationId
      },
      "form/title": title,
      "form/internal-name": name,
      "form/external-title": {
        "en": title
      },
      "form/fields": fields
    }
    const form = await this.post({
      url: `${this.host}${this.apis.create_form}`,
      data: payload
    })
    if (form['form/id']) {
      form['id'] = form['form/id']
    }
    return form;
  }

  formField({ type, info, title, columns = [], options = [], privacy, optional, fieldId, placeholder }) {

    const cols = columns.map((col) => {
      return {
        "key": col.key,
        "label": {
          "en": col.label
        }
      }
    });
    const opts = options.map((opt) => {
      return {
        "key": opt.key,
        "label": {
          "en": opt.label
        }
      }
    });
    const construct = {
      "field/info-text": {
        "en": info
      },
      "field/title": {
        "en": title
      },

      "field/privacy": privacy,
      "field/type": type,
      "field/id": fieldId,
      "field/optional": optional,

    };
    if (type === 'text') {
      construct["field/max-length"] = 0;
    }
    if (placeholder) {
      construct["field/placeholder"] = {
        "en": placeholder
      }
    }
    if (opts.length > 0) {
      construct['field/options'] = opts
    }
    if (cols.length > 0) {
      construct['field/columns'] = cols
    }
    return construct;
  }

  async getForm({ id }) {
    try {
      const form = await this.get({
        url: `${this.host}${this.apis.get_form}/${id}`
      });
      if (form.error === "not found") {
        throw new Error('No Form Found')
      }
      return form
    }
    catch (e) {
      return null;
    }
  }

  async resource({ resId, organizationId, enabled, archived, licenses }) {
    const payload = {
      "resid": resId,
      "organization": {
        "organization/id": organizationId
      },
      "licenses": licenses
    }
    return await this.post({
      url: `${this.host}${this.apis.create_resource}`,
      data: payload
    });
  }

  async getResource({ id, resid }) {
    let resource;
    if (resid) {
      const resources = await this.get({
        url: `${this.host}${this.apis.get_resource}?resid=${encodeURIComponent(resid)}`
      });
      if (resources[0]) {
        resource = resources[0];
      }
    } else if ({ id }) {
      resource = await this.get({
        url: `${this.host}${this.apis.get_resource}/${id}`
      });
    }
    if (resource?.success) {
      return resource;
    } else {
      return resource;
    }
  }

  async category({ title, description, children = [] }) {
    const cs = children.map((c) => {
      return { "category/id": c }
    });
    const payload = {
      "category/title": {
        "en": title
      },
      "category/description": {
        "en": description
      },
      "category/display-order": 0
    }
    if (cs.length > 0) {
      payload["category/children"] = cs;
    }
    const category = await this.post({
      url: `${this.host}${this.apis.create_category}`,
      data: payload
    });
    if (category['category/id']) {
      category['id'] = category['category/id']
    }

    return category;
  }

  async getCategory({ id }) {
    const category = await this.get({
      url: `${this.host}${this.apis.get_category}/${id}`
    });
    if (category['category/id']) {
      category['id'] = category['category/id']
    }
    return category;
  }


  async catalogueItem({
    resId,
    formId,
    workflowId,
    organizationId,
    title,
    url,
    enabled,
    archived,
    categories = []
  }) {
    const cats = categories.map((c) => {
      return { "category/id": c }
    });

    const payload = {
      "resid": resId,
      "wfid": workflowId,
      "form": formId || null,
      "organization": {
        "organization/id": organizationId
      },
      "localizations": {
        "en": {
          "title": title,
          "infourl": url
        }
      },
      "enabled": enabled,
      "archived": archived
    }
    if (cats.length > 0) {
      payload['categories'] = cats
    }
    return await this.post({
      url: `${this.host}${this.apis.create_catalogueItem}`,
      data: payload
    });
  }

  async getCatalogueItem({ id, resource }) {
    let catalogueItem;
    if (resource) {
      const catalogueItems = await this.get({
        url: `${this.host}${this.apis.get_catalogueItem}/?resource=${encodeURIComponent(resource)}`
      });
      if (catalogueItems[0]) {
        catalogueItem = catalogueItems[0];
      }
    } else if (id) {
      catalogueItem = await this.get({
        url: `${this.host}${this.apis.get_catalogueItem}/${id}`
      });
    }
    return catalogueItem;
  }

  async getCatalogueItems() {
    const catalogueItems = await this.get({
      url: `${this.host}${this.apis.get_catalogueItem}`
    });
    return catalogueItems;
  }

  async workflow({
    forms = [],
    licenses = [],
    organizationId,
    title,
    handlers
  }) {
    const fs = forms.map((c) => {
      return { "form/id": c }
    });
    const ls = licenses.map((c) => {
      return { "license/id": c }
    });
    const payload = {
      "organization": {
        "organization/id": organizationId
      },
      "title": title,
      "type": "workflow/default", //can be 'workflow/decider'
      "handlers": handlers, //string array
    }
    if (fs) {
      payload["licenses"] = ls;
    }
    if (fs) {
      payload["forms"] = fs;
    }
    return await this.post({
      url: `${this.host}${this.apis.create_workflow}`,
      data: payload
    });
  }

  async getWorkflow({ id, title }) {
    let workflow;
    if (id) {
      workflow = await this.get({
        url: `${this.host}${this.apis.get_workflow}/${id}`
      });
      return workflow;
    } else if (title) { //Will fail if there is pagination;
      const workflows = await this.get({
        url: `${this.host}${this.apis.get_workflow}`
      });
      for (let w of workflows) {
        if (w?.title === title) {
          return { id: w.id, success: true };
        }
      }
    }
  }
}

module.exports = { REMS };
