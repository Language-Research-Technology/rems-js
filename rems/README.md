## REMS run in docker-compose for testing

up
```
docker-compose up -d
```

migrate
```
docker-compose run --rm -e CMD="migrate" app
```

Create an API Key
```bash
docker-compose run --rm -e CMD="api-key add 12345678 admin_api_key;run" app
```
setup api-key users
```bash
docker-compose run --rm -e CMD="api-key set-users http://cilogon.org/serverE/users/4497;run" app
```

Setup an admin user
```bash
docker-compose run --rm -e CMD="grant-role owner http://cilogon.org/serverE/users/4497;run" app
```

grant user role
```bash
docker-compose run --rm -e CMD="grant-role user-owner http://cilogon.org/serverE/users/4497;run" app
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

http://localhost:3000/swagger-ui
