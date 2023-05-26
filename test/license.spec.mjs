import assert from 'assert';
import {REMS} from '../index.js';
import configuration from './configuration.json' assert {type: 'json'};

let rems;
let lic1;
describe('License', function () {

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
    it('should create a license', async function () {
      lic1 = await rems.license({
        type: 'link',
        organizationId: 'ldaca',
        title: 'license1',
        content: 'http://example.com/license1'
      });
      assert.equal(lic1['success'], true);
    });
    it('should get the lic created', async function () {
      const license = await rems.getLicense({id: lic1.id});
      assert.equal(license.id, lic1.id);
    });
  });
});
