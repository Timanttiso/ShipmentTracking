import User from '../models/user.js'
import bcrypt from 'bcrypt'
import ApiError from '../utils/ApiError.js'
import Destination from '../models/destination.js'

const saltRounds = process.env.NODE_ENV === 'test' ? 4 : 12 // 12 salt rounds is very time taxing in testing


const UserService = {
    async register({username, password, email}) {
        const password_hash = await bcrypt.hash(password, saltRounds)
        try{
            return await User.register({ username, password_hash, email })
        }
        catch(error){
            // 23505 error code is for a unique constraint violation
            if(error.code === '23505'){
                if(error.constraint.includes('email')) {
                    throw new ApiError('Email already taken in register()', 409, 'Sähköposti on jo käytössä')
                }
                throw new ApiError('Username already taken in register()', 409, 'Käyttäjänimi on jo käytössä')
            }
        }
    },

    async checkCredentials({username, password}){
        let user = await User.findByName(username)
        if(!user){
            user = await User.findByEmail(username);
            if(!user){
                throw new ApiError('Wrong credentials in checkCredentials()', 401, 'Väärä käyttäjänimi tai salasana')
            }
        }
            
        if(!await bcrypt.compare(password, user.password_hash)){
            throw new ApiError('Wrong credentials in checkCredentials()', 401, 'Väärä käyttäjänimi tai salasana')
        }

        return user
    },

    async getById(id){
        return await User.findById(id)
    },

    async UpdateUserSettings(id, { username, email, default_destination_id }){
        const currentUser = await User.findById(id)

        if(username){
            const existingUsername = await User.findByName(username)
            if(existingUsername && existingUsername.username != currentUser.username){
                throw new ApiError('Username already taken in UpdateUserSettings()', 409, 'Tämä käyttäjänimi on jo käytössä')
            }
        }
        else{
            username = currentUser.username
        }

        if(email){
            const existingEmail = await User.findByEmail(email)
            if(existingEmail && existingEmail.email != currentUser.email){
                throw new ApiError('An account with an existing email found in UpdateUserSettings()', 409, 'Tämä sähköposti on jo käytössä')
            }
        }
        else{
            email = currentUser.email
        }
            

        if(default_destination_id){
            const existingDestination = await Destination.getById(default_destination_id, id)
            if(!existingDestination){
                throw new ApiError('Destination not found in UpdateUserSettings()', 404, 'Päämäärää ei löydetty')
            }
        }

        return await User.updateUserSettings(id, { username, email, default_destination_id})
    },

    async ChangePassword(id, { old_password, new_password }){
        const user = await User.findById(id)

        if(!user){
            throw new ApiError('User not found', 404, 'Käyttäjää ei löydetty')
        }

        if(!await bcrypt.compare(old_password, user.password_hash)){
            throw new ApiError('Old password is wrong in ChangePassword()', 400, 'Väärä salasana')
        }
        const password_hash = await bcrypt.hash(new_password, saltRounds)

        return await User.UpdatePassword(id, password_hash)
        
    },

    async DeleteUser(id){
        const user = await User.findById(id)

        if(!user){
            throw new ApiError('User not found', 404, 'Käyttäjää ei löydetty')
        }

        return await User.RemoveUser(id)
    }
}

export default UserService