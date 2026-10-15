import User from '../models/user.js'
import bcrypt from 'bcrypt'
import ApiError from '../utils/ApiError.js'
import Destination from '../models/destination.js'

const saltRounds = 12

const UserService = {
    async register({username, password, email}) {
        try{
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
        }
        catch{
            throw new ApiError('User registration failed in register()', 500, 'Käyttäjän luonti epäonnistui')
        }
        
    },

    async checkCredentials({username, password}){
        try{
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
        }
        catch{
            throw new ApiError('Checking credintials failed in checkCredentials()', 500, 'Kirjautuminen epäonnistui')
        }
        

    },

    async getById(id){
        try{
            return await User.findById(id)
        }
        catch{
            throw new ApiError('Getting user by id failed in getById()', 500, 'Käyttäjän haku epäonnistui')
        }
        
    },

    async UpdateUserSettings(id, { username, email, default_destination_id }){
        try{
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
        }
        catch{
            throw new ApiError('Updating user settings failed in UpdateUserSettings()', 500, 'Käyttäjä asetusten päivitys epäonnistui')
        }
        
    },

    async ChangePassword(id, { old_password, new_password }){
        try{
            const user = await User.findById(id)

            if(!user){
                throw new ApiError('User not found', 404, 'Käyttäjää ei löydetty')
            }

            if(!await bcrypt.compare(old_password, user.password_hash)){
                throw new ApiError('Old password is wrong in ChangePassword()', 400, 'Väärä salasana')
            }
            const password_hash = await bcrypt.hash(new_password, saltRounds)

            return await User.UpdatePassword(id, password_hash)
        }
        catch{
            throw new ApiError('Changing password failed in ChangePassword()', 500, 'Käyttäjä salasanan vaihto epäonnistui')
        }
        
    },

    async DeleteUser(id){
        try{
            const user = await User.findById(id)

            if(!user){
                throw new ApiError('User not found', 404, 'Käyttäjää ei löydetty')
            }

            return await User.RemoveUser(id)
        }
        catch{
            throw new ApiError('User deletion failed in DeleteUser()', 500, 'Käyttäjä poisto epäonnistui')
        }
    }
}

export default UserService