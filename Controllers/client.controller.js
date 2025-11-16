const ClientService = require("../services/ClientService");

const ClientController = {
    async create(req, res) {
        try {
            const data = {
                ...req.body,
                created_by: req.user.id
            };

            await ClientService.createClient(data);
            return res.json({ success: true, message: "Client created successfully" });
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    },

    async update(req, res) {
        try {
            await ClientService.updateClient(req.params.id, req.body);
            res.json({ success: true, message: "Client updated" });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async delete(req, res) {
        try {
            await ClientService.deleteClient(req.params.id);
            res.json({ success: true, message: "Client deleted" });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async changeRole(req, res) {
        try {
            await ClientService.changeRole(req.params.id, req.body.role);
            res.json({ success: true, message: "Role updated" });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async getById(req, res) {
        try {
            const client = await ClientService.getClientById(req.params.id);
            res.json({ success: true, data: client });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async getProjects(req, res) {
        try {
            const projects = await ClientService.getProjectsByClientId(req.params.id);
            res.json({ success: true, data: projects });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = ClientController;
