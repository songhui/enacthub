by_app_map = function (doc){
    emit(doc.app, doc)
}

let doc = {
    views:{
        by_app:{
            map: by_app_map.toString()
        }
    }
}

module.exports = doc