import assert from 'assert';
import {REMS} from '../index.js';
import configuration from './configuration.json' assert {type: 'json'};
import {v4 as uuidv4} from 'uuid';

let rems;
let form1;
describe('Form', function () {

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
    it('should create a form', async function () {
      const numberOfFields = 2;
      const fields = [];
      for (let f = 0; f <= numberOfFields; f++) {
        const field = rems.formField({
          type: 'text',
          privacy: 'public',
          title: 'Title 1',
          info: 'info',
          optional: true,
          fieldId: uuidv4(),
          placeholder: 'write something here'
        });
        fields.push(field);
      }
      form1 = await rems.form({
        formId: 10,
        organizationId: 'ldaca',
        name: 'form1',
        title: 'Form 1',
        content: 'http://example.com/form1',
        fields
      });
      assert.equal(form1['success'], true);
    });
    it('should get the form created', async function () {
      const form = await rems.getForm({id: form1.id});
      assert.equal(form['id'], form1.id);
    });
  });
});
