import assert from 'assert';
import {REMS} from '../index.js';
import configuration from './configuration.json' assert {type: 'json'};
import {v4 as uuidv4} from 'uuid';

let rems;
let resource1;
describe('Resource', function () {

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
    it('should create a resource', async function () {
      const numberOfFields = 2;
      const licenses = [
        1
      ];
      resource1 = await rems.resource({
        resId: 'http://example.com/license', //In our case a license === resource
        organizationId: 'ldaca',
        enabled: true,
        archived: true,
        licenses
      });
      assert.equal(resource1['success'], true);
    });
    it('should get the resource created', async function () {
      const resource = await rems.getResource({id: resource1.id});
      assert.equal(resource['id'], resource1.id);
    });
  });
});
