import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
const userSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
    },
    fullName:{
        type:String,
        required:true,
        lowercase:true,
        trim:true,
        index:true
    },
    password:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
    },
    avatar:{
        type:String,//cloudinary url
        required:true,
    },
    coverImage:{
        type:String,//cloudinary url
    },
    watchHistory:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Video'
        }
    ],
    password:{
        type:String,
        required:[true,"password is required"],
        minlength:[6,"password must be at least 6 characters"],
    },
    refreshToken:{
        type:String,
    }

},{timestamps:true});





userSchema.pre("save",async function(next){
    if(!this.isModified("password")){
      return  next();
    }
    this.password=await bcrypt.hash(this.password,10);
    next();
})






userSchema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password,this.password);//this.password is the hashed password stored in the database and password is the plain text password provided by the user during login
}






userSchema.methods.generateAccessToken=function(){
    return jwt.sign({_Id:this._id,
        email:this.email,
        username:this.username,
        fullname:this.fullname,
    },process.env.ACCESS_TOKEN_SECRET,{expiresIn:process.env.ACCESS_TOKEN_EXPIRY});
}





userSchema.methods.generateRefreshToken=function(){
    return jwt.sign({
        _Id:this._id,
    },process.env.REFRESH_TOKEN_SECRET,{expiresIn:process.env.REFRESH_TOKEN_EXPIRY});
}

const User=mongoose.model('User',userSchema);

export default User;