
import { pb }  from './pocketbase.js'

const tableCrud = {
    getAll : async function(table,options) {
        return await pb.collection(table).getFullList(options);
    },
    getById: async function(table,id,options) {
        return await pb.collection(table).getOne(id,options);
    },
    create : async function(table,data) {
        return await pb.collection(table).create(data);
    },
    update : async function(table,data) {
        return await pb.collection(table).update(data.id,data);
    }
}

export { tableCrud }