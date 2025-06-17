## REMS run in docker compose for testing

All below commands should be run in the `rems` directory. Change directories to the `rems` folder:
```
cd rems
```

Build docker:
```
docker compose up -d
```
Note the server and user number list in the URL http://cilogon.org/serverX/users/XXXX - these will be required for later commands.

Migrate (you may need to run this and then loop back to the first command):
```
docker compose run --rm -e CMD="migrate" app
```

Check the URL is working at http://localhost:3000/

<br>

Create an API Key (update the API key if not using localhost):
```bash
docker compose run --rm -e CMD="api-key add 12345678 admin_api_key;run" app
```
Set up api-key users (update with your server and user number):
```bash
docker compose run --rm -e CMD="api-key set-users http://cilogon.org/serverE/users/4497;run" app
```

Set up an admin user:
```bash
docker compose run --rm -e CMD="grant-role owner http://cilogon.org/serverE/users/4497;run" app
```

Grant user role:
```bash
docker compose run --rm -e CMD="grant-role user-owner http://cilogon.org/serverE/users/4497;run" app
```

```bash
java --illegal-access=deny -Drems.config=config/config.edn -jar rems.jar grant-role owner http://cilogon.org/serverE/users/4497
```

### Backup


```
docker run --rm \
   --user root \
   --volumes-from rems-db-1 \
   -v /Users/moises/source/play/rems/backups/db-backup:/backup \
   debian tar cvf /backup/db_$(date '+%Y-%m-%d_%H:%M:%S').tar /var/lib/postgresql/data
```

### Swagger

The local development instance of the REMS API is accessible at http://localhost:3000/swagger-ui. For more information, see [Using the API](https://github.com/CSCfi/rems/blob/master/docs/using-the-api.md).
