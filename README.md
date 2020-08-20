# enacthub
Central repository for Enact tools

# Install
```
cd docker
docker-compose up
```

# Initialize database
```
cd init
npm install
npm start
```

# Register an artefact
Registering an artefact has two steps.

Step 1: Create or modify an entry.

Request:
```
POST /public/_design/edit/_update/register
Authorization: Basic ${token}
Content-Type: application/json

{
    "type": "divenact.template",
    "app": "tellu-1",
    "name": "divenact.test.5",
    "licence": "Apache-2.0"
}
```

Response:
```
HTTP/1.1 200 OK
X-Couch-Id: {id}
X-Couch-Update-NewRev: {rev} 

{ ok: true, status: 'created', id: '{id}' }
```

Step 2: Upload the actual model

Request:
```
POST /public/{id}/model
Authorization: Basic ${token}
Content-Type: application/json (or, e.g., image/jpeg)
If-Match: {rev}

{Actual data}
```

Response:
```
HTTP/1.1 200 OK

{
  ok: true,
  id: {id},
  rev: {rev}
}
```

Examples in JavaScript can be found [here](samples/register.js)

# Get registered artefacts

No authorization is required.

For meta-info
```
GET /public/{id}
```

For artefact
```
GET /public/{id}/model
```

# Query and Browse
Coming soon...