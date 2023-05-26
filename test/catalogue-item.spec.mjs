import assert from 'assert';
import {REMS} from '../index.js';
import configuration from './configuration.json' assert {type: 'json'};
import {v4 as uuidv4} from 'uuid';

let rems;
let catalogueItem1;
let category1;
describe('CatalogueItem', function () {

  describe('init', function () {
    it('should init', function () {
      rems = new REMS({
        host: configuration.host,
        userId: configuration.userId,
        key: configuration.api_key,
        apis: configuration.apis
      });
    });
  });
  describe('create', function () {
    it('should create a category if doesnt exist', async function () {
      category1 = await rems.category({
        title: 'category 1',
        description: 'category description'
      });
      assert.equal(category1['success'], true);
    });
    it('should get the category created', async function () {
      const category = await rems.getCategory({id: category1['id']});
      assert.equal(category['id'], category1['id']);
    });
    it('should create a catalogueItem', async function () {
      const categories = [
        category1['category/id'] // Link the categories ID (it's an integer!)
      ];
      catalogueItem1 = await rems.catalogueItem({
        resId: 1, //In our case a license === catalogueItem
        formId: 1,
        workflowId: 1,
        organizationId: 'ldaca',
        title: 'Catalogue Item 1',
        url: 'https://example.com/license',
        enabled: true,
        archived: true,
        categories
      });
      assert.equal(catalogueItem1['success'], true);
    });
    it('should get the catalogueItem created', async function () {
      const catalogueItem = await rems.getCatalogueItem({id: catalogueItem1.id});
      assert.equal(catalogueItem['id'], catalogueItem1.id);
    });
  });
});
