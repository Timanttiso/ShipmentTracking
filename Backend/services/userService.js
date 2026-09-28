import User from '../models/user.js'
import bcrypt from 'bcrypt'

const saltRounds = 12

const UserService = {
    async register({username, password, email}) {
        const existingUsername = await User.findByName(username);
        if(existingUsername){
            const err = new Error('Nimi on käytössä.');
            throw err;
        }
        const password_hash = await bcrypt.hash(password, saltRounds);

        return await User.register({ username, password_hash, email });
    }
}

export default UserService