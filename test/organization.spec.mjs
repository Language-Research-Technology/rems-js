import assert from 'assert';
import {REMS} from '../index.js';
import configuration from './configuration.json' assert {type: 'json'};

let rems;
describe('Organization', function () {

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
    it('should create an organization', async function () {
      const response = await rems.organization({
        id: "ldaca",
        archived: false,
        enabled: true,
        shortName: 'LDaCA',
        organizationEmail: 'info@ldaca.edu.au',
        organizationName: 'LDaCA',
        reviewEmailName: 'Moises',
        ownerId: configuration.userId,
        userId: configuration.userId,
        userName: 'Mr Moises Sacal Bonequi',
        userEmail: 'm.sacalbonequi@uq.edu.au',
        organizationId: 'ldaca'
      });
      assert.equal(response['success'], true);
      assert.equal(response['id'], 'ldaca');
    });
    it('should get the org created', async function () {
      const organization = await rems.getOrganization({id: 'ldaca'});
      assert.equal(organization['id'], 'ldaca');
    });
  });
});
