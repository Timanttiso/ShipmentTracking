import User from '../models/user.js'
import bcrypt from 'bcrypt'
import ApiError from '../utils/ApiError.js'
import Destination from '../models/destination.js'

const saltRounds = 12

const UserService = {
    async register({username, password, email}) {
        const existingUsername = await User.findByName(username)
        if(existingUsername){
            throw new ApiError('Username already taken in register()', 409, 'Tämä käyttäjänimi on jo käytössä')
        }
        const existingEmail = await User.findByEmail(email)
        if(existingEmail){
            throw new ApiError('An account with an existing email found in register()', 409, 'Tämä sähköposti on jo käytössä')
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

    },

    async getById(id){
        return await User.findById(id)
    },

    async UpdateUserSettings(id, { username, email, default_destination_id }){
        const existingUsername = await User.findByName(username)
        if(existingUsername){
            throw new ApiError('Username already taken in UpdateUserSettings()', 409, 'Tämä käyttäjänimi on jo käytössä')
        }
        const existingEmail = await User.findByEmail(email)
        if(existingEmail){
            throw new ApiError('An account with an existing email found in UpdateUserSettings()', 409, 'Tämä sähköposti on jo käytössä')
        }

        if(default_destination_id){
            const existingDestination = await Destination.getById(default_destination_id, id)
            if(!existingDestination){
                throw new ApiError('Destination not found in UpdateUserSettings()', 404, 'Päämäärää ei löydetty')
            }
        }

        return await User.updateUserSettings(id, { username, email, default_destination_id})
    }
}

export default UserService