import mongoose from "mongoose";
import bcrypt from "bcrypt";


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
},
    email: {
        type: String,
       required: true, 
    },
    password: {
        type: String,
        required:true,},
    role: {
        type: String,
        enum: ["Admin", "Employee","Manager"],
        required: true},
    profileimage:{type: String},
    createdAt: { type: Date, default: Date.now },
    updatdateAt: { type: Date, default: Date.now },
    });


    userSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();
    
    try {
        console.log('🔑 Hashing password...');
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        this.updatedAt = Date.now();
        console.log('✅ Password hashed successfully');
        next();
    } catch (error) {
        console.error('❌ Password hashing error:', error);
        next(error);
    }
});


userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;