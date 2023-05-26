## REMS JavaScript Wrapper

Use this library to setup REMS access for LDaCA. This library will attempt to bootstrap your access controls using REMS.

Once run you can manage the resources with REMS.

### Potential use. 

Automation and with some backend that will create access controls to collections.

### Example use:

```bash
node setup.mjs configuration.json ldaca/auslit_access.json
```

You need to create one access file for each catalogue item you require.

See example_access.json and ldaca folder for examples.


### Docker-Compose

Use docker compose to create an instance of rems in your machine. For that follow [rems/README.md](rems/README.md)
