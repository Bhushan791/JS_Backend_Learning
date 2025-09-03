
import mongoose , {Schema} from "mongoose";

import mongooseAggreatePaginate from  "mongoose-aggregate-paginate-v2"



const videoSchema =   new Schema({
    
    
    videoFile :{type: String, required:true },   //cloudinary url for youtube video



    thumbnail:  {
        type:String, //cloudiinary url for thumbnail image
        requried:true
    }, 

    title: {type:String, required:true} ,
    description: {type:String, required:true} , 

    duration : {
        type:Number ,  requried:true    //duration of video from cloudinary

    }, 


    views :{type:Number,  default:0},

    isPublished: {type:Boolean, default:true}, 

    ownwer : {type: Schema.Types.ObjectId, ref :"User"},













}, { timestamps:true})




videoSchema.plugin(mongooseAggreatePaginate)


//bycript continue

export const Video = mongoose.model("Video", videoSchema)