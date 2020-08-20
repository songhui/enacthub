let validate_doc_update = function(newDoc, oldDoc, userCtx, secObj) 
{ 
    if(! userCtx.roles.includes('_admin') && !userCtx.roles.includes('dev')) 
        throw ({forbidden: 'Not authorized for writing.'}) 
}

let register = function(doc, req){
    let status = 'updated'
    if (!doc){
        newdoc = {}
        try{
            newdoc = JSON.parse(req.body)
        }
        catch(error){
            return [null, 'Body not supported']
        }
        if ('id' in req && req.id){
            // create new document
            newdoc['_id'] = req.id;
        }
        else{
            newdoc["_id"] = req.uuid;
        }
        newdoc['created'] = new Date()
        newdoc['created_by'] = req.userCtx.name
        status = 'created';
        doc = newdoc;
    }
 
    doc['lastmodified'] = new Date()
    doc['modified_by'] = req.userCtx.name
    return [doc, JSON.stringify({ok: true, status: status, id: doc._id})]
}

const doc = {
    validate_doc_update: validate_doc_update.toString(),
    updates: {
        register: register.toString()
    }
}

module.exports = doc
