import { asyncHandler } from "../utils/asyncHandler"
import { ApiError } from "../utils/apiError"
import { uploadToCloudinary } from "../utils/cloudinary"
import { apiResponse } from "../utils/apiResponse"
import { User } from "../models/user.model"

// Generate access and refresh tokens
const generateAccessAndRefreshTokens = async (userId) => {
  const user = await User.findById(userId)

  const accessToken = user.generateAccessToken()
  const refreshToken = user.generateRefreshToken()

  user.refreshToken = refreshToken
  await user.save({ validateBeforeSave: false })

  return { accessToken, refreshToken }
}

// Register user
const registerUser = asyncHandler(async (req, res) => {
  const { fullName, username, email, password } = req.body

  if ([fullName, email, username, password].some((field) => field?.trim() === ""))
    throw new ApiError(400, "All fields are required")

  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  })
  if (existingUser) throw new ApiError(409, "Username or email already exists")

  const avatarLocalPath = req.files?.avatar?.[0]?.path
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path

  if (!avatarLocalPath) throw new ApiError(400, "Avatar is required")

  const avatar = await uploadToCloudinary(avatarLocalPath)
  const coverImage = await uploadToCloudinary(coverImageLocalPath)

  if (!avatar) throw new ApiError(400, "Avatar file is invalid")

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  })

  const createdUser = await User.findById(user._id).select("-password -refreshToken")
  if (!createdUser)
    throw new ApiError(500, "Something went wrong while registering user")

  return res
    .status(201)
    .json(new apiResponse(200, createdUser, "User registered successfully"))
})

// Login user
const userLogin = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body

  if (!username && !email)
    throw new ApiError(400, "Username or email is required")

  const user = await User.findOne({
    $or: [{ username }, { email }],
  })
  if (!user) throw new ApiError(404, "User does not exist")

  const isPasswordValid = await user.isPasswordCorrect(password)
  if (!isPasswordValid)
    throw new ApiError(401, "Invalid user credentials")

  const { accessToken, refreshToken } =
    await generateAccessAndRefreshTokens(user._id)

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

  const options = {
    httpOnly: true,
    secure: true,
  }

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new apiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    )
})

export { registerUser, userLogin }
