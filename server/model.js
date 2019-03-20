var mongoose=require('mongoose');
mongoose.Promise=global.Promise;
mongoose.connect("mongodb://localhost:27017/search");
var schema=mongoose.Schema({
    ques:{
        type:String,
        unique:true
    },
    URL:{
        type:String,
    }
});
var search1=mongoose.model('search1',schema);
module.exports={
    search1
};