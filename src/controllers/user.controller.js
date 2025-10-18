
 ///-->>> REGISTER TODOS

 // get user details from frontend
    // validations -not empty
    //check if user already ecists : username , email
    //check for images , check for avtar
    //upload then to cloudinary , avatar
    // create user object - create entry in db  
    //remove password and refresh token field from response
    // check for user creation
    //return 

//---> LOGIN TODOS

//req body --data
// username or email 
//find the user
//password check 
//access and refresh token
// send cookie 

import { asyncHandler } from "../utils/asyncHandler.js"; 
import {ApiError} from "../utils/apiError.js"

import {User} from "../models/user.model.js"

import {uploadToCloudinary}  from "../utils/cloudinary.js"

import { apiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken" ; 

//generate access token
const generateAccessAndRefreshTokens = async (userId)  =>{
  try {

    const user = await User.findById(userId)
    
    
   const  accessToken =   user.generateAccessToken()
  const refreshToken = user.generateRefreshToken()
  user.refreshToken= refreshToken

await user.save({validateBeforeSave:false})
return {accessToken, refreshToken}

  }
  catch(err) { 

    // console.log("*****************ERROR*************:", err)
    throw new ApiError(400, "something went wrong while generating refresh and access token")
  }
}


//user register
const registerUser= asyncHandler(async (req, res)=> { 
  // console.log("req.files:", req.files);
  // console.log("*************************************************************************************")
  // console.log("req.body:", req.body);
    const { fullName, email, username, password} = req.body;
    console.log("email: " ,email) 
    if ( 
        [fullName, email , username, password].some((field)=>
        field?.trim() === "")
    ) {

        throw  new ApiError(400, "All fields are required")
    }


    const existingUser = await User.findOne({ 

        $or: [{username}, {email}] 

    })

    if(existingUser) { 
        throw new ApiError (409, "username or email already exists")
    }


    const avatarLocalPath= req.files?.avatar[0]?.path;


      //  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
  

    
  let coverImageLocalPath ; 
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0) { 
    coverImageLocalPath = req.files.coverImage[0].path
  }


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
    coverImage: coverImage?.url || "" ,
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

}) ;


//user login
const loginUser  = asyncHandler (async (req, res) => { 
  
  const  {email, username, password }  = req.body ;
if (!username && !email)  {
  throw new ApiError (400 , "username or email is required") 
  
}   
  const user = await User.findOne( { 
    $or:  [{username} ,{email}]
  })

if (!user)  { 

  throw new ApiError(404 , "user does not exist") 
}



const isPasswordValid = await user.isPasswordCorrect(password)  



if(!isPasswordValid) { 
 throw new ApiError (401 , " invalid user credentials")
}
 

const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)


const loggedInUser = await User.findById(user._id).select("-password -refreshToken")


const options  = {

  httpOnly : true , 
  secure: true

}
 
return res
.status(200)
.cookie("accessToken", accessToken, options)
.cookie("refreshToken",  refreshToken, options) 
.json(
  new apiResponse(
    200, {
      user : loggedInUser, accessToken, refreshToken
    }, 
    "user logged In successfully"
  )
)

}) ; 

//user logout
const logoutUser =  asyncHandler (async (req,res)=> { 

const currentUserId =  req.user._id
  
  const user = await User.findByIdAndUpdate(
    currentUserId , { 
    $set : { refreshToken: undefined}
  } ,

  {new:true}
); 

if(!user) { 
  throw new ApiError (404 , "user not found")  //just for the rare case errors
} 


const options =  { 
  httpOnly : true, 
   secure :true
}

return res
.status(200) 
.clearCookie("accessToken", options)
.clearCookie("refreshToken", options)
.json(
  new apiResponse (200 , { }, "User Logged out ")
)

})

//refresh Access token

const refreshAccessToken =  asyncHandler(async(req, res)=> { 

  const incomingRefreshToken  =  req.cookie.refreshToken || req.headers.refreshToken 

  if(!incomingRefreshToken) { 
    throw new ApiError(401, "Unauthorized request") 
  
  }
 try {
   const decodedToken =jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
 
   const user = await User.findById(decodedToken?._id)
 
   if(!user) {
     throw new ApiError(401,  "invalid refresh token")
   }
 
 
   if(incomingRefreshToken !== user?.refreshToken) { 
     throw new ApiError (401, "refreshToken is expired or used") 
 
   }
   const options = {  
     httpOnly:true,
     secure : true
   }
 
    const {newaccessToken, newrefreshToken} = await generateAccessAndRefreshTokens(user._id) 
   return res 
   .status(200) 
   .cookie("accessToken", newaccessToken,options)
   .cookie("refreshToken", newrefreshToken, options) 
   .json(
     new ApiError(
       200 , 
       {newaccessToken, newrefreshToken} , 
       "Access token refreshed successfully"
     )
   )
 
 } catch (error) {
  throw new ApiError(401, error?.message || "invalid refresh token"
  )
  
 }





})
export {registerUser, loginUser, logoutUser, refreshAccessToken}
 