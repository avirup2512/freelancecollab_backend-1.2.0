const ClientModel = require("../Models/clientModel");

const ClientService = {
    async createClient(data) {
        return await ClientModel.create(data);
    },

    async updateClient(id, data) {
        return await ClientModel.update(id, data);
    },

    async deleteClient(id) {
        return await ClientModel.delete(id);
    },

    async changeRole(id, role) {
        return await ClientModel.changeRole(id, role);
    },

    async getClientById(id) {
        const [rows] = await ClientModel.getById(id);
        return rows[0] || null;
    },

    async getProjectsByClientId(clientId) {
        const [rows] = await ClientModel.getProjectsByClientId(clientId);
        return rows;
    }
};

module.exports = ClientService;
