const Jimp = require('jimp');
const path = require('path');
const userService = require('../services/user-service');
const UserDto = require('../dtos/user-dto');

class ActivateController {
    async activate(req, res) {
        // activation logic
        const { name, avatar } = req.body;
        if (!name || !avatar) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Image base64
        const buffer = Buffer.from(avatar.replace(/^data:image\/png;base64,/, ''), 'base64');
        const imagePath = `${Date.now()}-${Math.round(Math.random() * 1e9)}.png`;

        // compress image
        try {
            const jimpResp = await Jimp.read(buffer);
            jimpResp.resize(150, Jimp.AUTO).write(path.resolve(__dirname, `../storage/${imagePath}`));
        } catch (error) {
            return res.status(500).json({ message: "Could Not Process the image" });
        }

        const userId = req.user._id;
        // update user
        try {
            const user = await userService.findUser({ _id: userId });

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            user.activated = true;
            user.name = name;
            user.avatar = `/storage/${imagePath}`;
            await user.save(); // Don't forget to await the save operation

            return res.json({ user: new UserDto(user), auth: true });

        } catch (error) {
            return res.status(500).json({ message: "DB error" });
        }
    }
}

module.exports = new ActivateController();
