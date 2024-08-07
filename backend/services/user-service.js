const userModel = require("../models/user-model");

class UserService {
    async findUser(filter) {
        const user = await userModel.findOne(filter);
        return user;
    }

    async createUser(data) {
        const user = await userModel.create(data);
        return user;
    }

    async findOrCreate(filter, data) {
        let user = await this.findUser(filter);
        if (!user) {
            user = await this.createUser(data);
        }
        return user;
    }
}

module.exports = new UserService();
