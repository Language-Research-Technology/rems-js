import assert from 'assert';
import {REMS} from '../index.js';
import configuration from './configuration.json' assert {type: 'json'};
import {v4 as uuidv4} from 'uuid';

let rems;
let workflow1;
describe('Workflow', function () {

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
    it('should create a workflow', async function () {
      const forms = [
        1 // Link the forms ID (it's an integer!)
      ];
      const licenses = [
        1
      ];
      workflow1 = await rems.workflow({
        resId: 'https://example.com/license', //In our case a license === workflow
        organizationId: 'ldaca',
        title: '',
        url: '',
        handlers: [configuration.userId], //Add all of your handlers here.
        licenses,
        forms
      });
      assert.equal(workflow1['success'], true);
    });
    it('should get the workflow created', async function () {
      const workflow = await rems.getWorkflow({id: workflow1.id});
      assert.equal(workflow['id'], workflow1.id);
    });
  });
});
