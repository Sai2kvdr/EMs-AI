import User from './Models/User.js';
import bcrypt from 'bcryptjs';
import conecttoDatabase from './db/db.js';


const userRegister = async()=>{
    conecttoDatabase();
    try{
        const hashpassword = await bcrypt.hash('admin',10);
        const newUser = new User({
            name:'Admin',
            email:'admin@gmail.com',
            password:hashpassword,
            role:"admin"
        })
        await newUser.save();
    } 
    catch(err){
        console.error("Error during user registration:", err);
    }
}

userRegister();
