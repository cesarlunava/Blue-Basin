const bcrypt = require('bcryptjs');
const helpers = {};

helpers.encryptPassword = async(password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

helpers.matchPassword = async (password, savedHash) => {
    try {
        if (!password || !savedHash) {
            console.log('Password:', password);
            console.log('Saved hash:', savedHash);
            throw new Error('Password or saved hash is missing');
        }
        return await bcrypt.compare(password, savedHash);
    } catch(error) {
        console.error('Error al comparar contraseñas', error);
        throw error;
    }
}; 

module.exports = helpers;