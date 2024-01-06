const mongosse =require('mongoose');


const userSchema = new mongosse.Schema({
    username:{type:String,unique:true},
    password:String
},{timestamps:true});


const userModel = new mongosse.model('User',userSchema);
module.exports  = userModel
