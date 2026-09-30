import User from '../models/user.js'
import bcrypt from 'bcrypt'
import ApiError from '../utils/ApiError.js'

const saltRounds = 12

const UserService = {
    async register({username, password}) {
        const existingUsername = await User.findByName(username)
        if(existingUsername){
            throw new ApiError('Username already taken in register()', 409, 'Tämä käyttäjänimi on jo käytössä')
        }
        const password_hash = await bcrypt.hash(password, saltRounds)

        return await User.register({ username, password_hash, email })
    },

    async checkCredentials({username, password}){
        let user = await User.findByName(username)
        if(!user){
            user = await User.findByEmail(username);
            if(!user){
                throw new ApiError('Wrong credentials in checkCredentials()', 404, 'Väärä käyttäjänimi tai salasana')
            }
        }
        
        if(!await bcrypt.compare(password, user.password_hash)){
            throw new ApiError('Wrong credentials in checkCredentials()', 404, 'Väärä käyttäjänimi tai salasana')
        }
        return user

    }
}

export default UserService