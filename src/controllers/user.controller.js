import { asyncHandler } from "../utils/asyncHandler.js"; 
import {ApiError} from "../utils/apiError.js"

import {User} from "../models/user.model.js"

import {uploadToCloudinary}  from "../utils/cloudinary.js"

import { apiResponse } from "../utils/apiResponse.js";

const registerUser= asyncHandler(async (req, res)=> { 

    // get user details from frontend
    // validations -not empty
    //check if user already ecists : username , email
    //check for images , check for avtar
    //upload then to cloudinary , avatar
    // create user object - create entry in db  
    //remove password and refresh token field from response
    // check for user creation
    //return 

    const { fullName, email, username, password} = req.body;
    console.log("email: " ,email) 




    if ( 
        [fullName, email , username, password].some((field)=>
        field?.trim() === " ")
    ) {

        throw  new ApiError(400, "All fields are required")
    }


    const existingUser = User.findOne({ 

        $or: [{username}, {email}] 

    })

    if(existingUser) { 
        throw new ApiError (409, "username or email already exists")
    }


    const avatarLocalPath= req.files?.avatar[0]?.path;
    const coverImageLocalPath= req.files?.coverImage[0]?.path; 

    if(!avatarLocalPath) { 
        throw new ApiError(400, "Avatar file is required") 

    }


  const avatar  =  await  uploadToCloudinary(avatarLocalPath)
  const coverImage  =  await  uploadToCloudinary(coverImageLocalPath)


  if(!avatar) { 
    throw new ApiError(400,"Avatar file is required")
  }


  const user = await User.create({ 
    fullName,
     avatar: avatar.url, 
    coverImage: coverImage?.url || " " ,
    email,
    password,
    username :username.toLowerCase()
  })

  const createdUser= await User.findById(user._id).select(

    "-password -refreshToken"
  )

  if (!createdUser) {
    throw new ApiError (500, "something went wrong while registerig user")
  }

  return res.status(201).json(
    new apiResponse(200,  createdUser, "user registered successfully")
  )

})


export {registerUser}
 