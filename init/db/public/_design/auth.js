let validate_doc_update = function(newDoc, oldDoc, userCtx, secObj) 
{ 
    if(! userCtx.roles.includes('_admin') && !userCtx.roles.includes('dev')) 
        throw ({forbidden: 'Not authorized for writing.'}) 
}

const doc = {
    validate_doc_update: validate_doc_update.toString()
}

module.exports = doc
