## REMS JavaScript Wrapper

Use this library to setup REMS access for LDaCA. This library will attempt to bootstrap your access controls using REMS.

Once run you can manage the resources with REMS.

### Potential use:

Automation and with some backend that will create access controls to collections.

### Example use:

Install:
```
npm install
```

Make a copy of `example_configuration.json` and name it `configuration.YOUR_INITIALS.json`, and edit the following fields:
```
"api_key": "12345678",
"userId": "http://cilogon.org/serverX/users/XXXX",
"userEmail": "user@email.com",
"userName": "Full Name",
```

Create one access file for each catalogue item you require.

See `example_access.json` and `ldaca` folder for examples.

Run:
```bash
node setup.mjs configuration.YOUR_INITIALS.json ldaca/ITEM_access.json
```


### Docker Compose

Use docker compose to create an instance of rems in your machine. For that follow [rems/README.md](rems/README.md).
