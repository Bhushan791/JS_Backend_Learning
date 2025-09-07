import  {v2 as cloudinary} from "cloudinary"

import fs from "fs"   //files system 



cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME ,

        api_key:  process.env.CLOUDINARY_API_KEY, 

        api_secret: CLOUDINARY_API_SECRET
    });





const uploadToCloudinary =   async (localFilePath)   => {


    try { 

        if(!localFilePath) return null

        //upload file to cloudinary
     const response = await   cloudinary.uploader.upload(localFilePath, { resource_type: "auto"} )
        //file has been uploaded successfully
        console.log( " file is uploaded on cloudinary..!", response.url)

        return response;

    }
    catch(Error)  {

        fs.unlinkSync(localFilePath)  //remove the locally saved temp file as the upload operation got failed




    }
}

export  default uploadToCloudinary