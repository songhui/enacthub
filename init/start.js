const fs = require('fs');
const path = require('path');

async function initDesign(db, dbname, docname){
    const designPath = path.join(__dirname, 'db', dbname, '_design', docname)
    const doc = require(designPath)
    if(docname.endsWith('.js'))
        docname = docname.substring(0, docname.length-3)
    docid = `_design/${docname}`
    doc['_id'] = docid

    try{
        let olddoc = await db.get(docid)
        doc['_rev'] = olddoc['_rev']
    }
    catch(err){

    }
    db.insert(doc)
}

async function initAccess(db){
    users = require('./users.json');
    names = users.map(item => item.name)
    doc = {
        admins: {
            names: names,
            roles: []
        },
        members: {
            names: [],
            roles: []
        }
    }
    try{
        db.insert(doc, "_security")
    }
    catch(error){
        console.log("hi")
        console.log(error)
    }
}

function filetype(filename){
    if(filename.endsWith('png'))
        return "image/png"
    else if(filename.endsWith('json'))
        return "application/json"
}

async function initData(db, dataPath, docname){
    let docPath = path.join(dataPath, docname)
    let doc = require(docPath)
    console.log(doc)
    let attachPath = null
    if(doc.attach !== undefined){
        attachPath = doc.attach
        delete doc.attach
    }
    try{
        let olddocs = await db.find({selector:{name: {"$eq": doc.name}}, fields:["_rev", "_id"]})
        console.log(olddocs)
        olddoc = olddocs.docs[0]
        Object.assign(doc, olddoc)
    }
    catch(err){
        console.log(err)
    }
    let inserted = await db.insert(doc)
    if(attachPath!=null){
        data = fs.readFileSync(path.join(dataPath, attachPath))
        console.log( 
            await db.attachment.insert(
                inserted.id, 'data', data, 
                filetype(attachPath), {rev: inserted.rev}
            )
        )
    }

}

async function initDB(nano, dbname){
    let alldbs = await nano.db.list()
    if(!alldbs.includes(dbname)){
        await nano.db.create(dbname)
        console.log("new database created")
    }
    console.log(await nano.db.get(dbname))
    const db = nano.use(dbname)

    const designPath = path.join(__dirname, 'db', dbname, '_design')
    const designdir = fs.opendirSync(designPath)
    while(true){
        dirent = designdir.readSync();
        if(dirent == null)
            break;
        console.log(dirent)
        await initDesign(db, dbname, dirent.name)
    }
    initAccess(db);

    const dataPath = path.join(__dirname, 'db', dbname, 'data')
    const datadir = fs.opendirSync(dataPath)
    while(true){
        dirent = datadir.readSync()
        if(dirent == null)
            break;
        if(dirent.name.endsWith(".data.json"))
            initData(db, dataPath, dirent.name);
    }
}

async function initUsers(nano){
    try{
        console.log(await nano.db.create('_users'))
    }
    catch(error){
        console.log(error)
    }
    users = require('./users.json');
    let userdb = nano.use("_users")
    for(let user of users){
        user["roles"] = ["dev"]
        user["type"] = "user"
        let fullname  = `org.couchdb.user:${user["name"]}`;
        user["_id"] = fullname
        try{
            let olduser = await userdb.get(fullname)
            console.log(olduser)
            user["_rev"] = olduser["_rev"]
        }
        catch(error){
            console.log("user exists")
        }
        try{
            userdb.insert(user, fullname)
        }
        catch(error){
            console.log(error)
        }
    }
}

const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let connectionString = null;

rl.question("CouchDB host: ", function(host) {
    rl.question("Username: ", function(user) {
        rl.question("Password: ", function(password) {
            connectionString = `http://${user}:${password}@${host}:5984`
            if(connectionString.startsWith("http://:@:5984"))
                connectionString = "http://admin:password@127.0.0.1:5984" //Use for debugging
            console.log(connectionString);
            rl.close();
        });
    });
});

rl.on("close", async function() {
    const nano = require('nano')(connectionString);
    const directoryPath = path.join(__dirname, 'db')
    const dbdir = fs.opendirSync(directoryPath)

    await initUsers(nano);

    while(true){
        dirent = dbdir.readSync();
        if(dirent == null)
            break;
        console.log(dirent)
        await initDB(nano, dirent.name)
    }

});