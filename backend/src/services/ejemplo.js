// backend/src/services/userService.js
const supabase = require('../config/supabase');

const getAllUsers = async () => {
    const { data, error } = await supabase
        .from('users')
        .select('*');

    if (error) throw error;
    return data;
};

module.exports = {
    getAllUsers
};