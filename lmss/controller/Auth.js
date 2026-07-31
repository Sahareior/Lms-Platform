import User from "../models/User.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/jwt.js"

/** Generate a JWT for the given user object (without password). */
function generateToken(user) {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role || 'student',
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )
}

/** Strip password and __v from a user document and return a plain object. */
function sanitizeUser(userDoc) {
  const user = userDoc.toObject()
  delete user.password
  delete user.__v
  return user
}

export const handelSignUps = async(req,res) => {
    const {email,password,name} = req.body 

    try{
        const isExisting = await User.findOne({email})
        if(isExisting){
            return res.status(409).json({ message: 'User with this email already exists' })
        }
        const hashPass = await bcrypt.hash(password, 10)
        const newUser = new User({email, password: hashPass, name})
        await newUser.save()

        const userData = sanitizeUser(newUser)
        const token = generateToken(userData)

        res.status(201).json({
            message: 'User created successfully',
            user: userData,
            token
        })
    }
    catch(err){
        console.log(err)
        res.status(500).json({ message: 'Something went wrong' })
    }

}

export const handelSingIn = async (req,res)=> {
    const {email,password} = req.body

    try{
        const user = await User.findOne({email})
        if(!user){
            return res.status(404).json({ message: 'User not found' })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch){
            return res.status(400).json({ message: 'Invalid credentials' })
        }

        const userData = sanitizeUser(user)
        const token = generateToken(userData)

        res.status(200).json({
            message: 'User signed in successfully',
            user: userData,
            token
        })
    }
    catch(err){
        console.log(err)
        res.status(500).json({ message: 'Something went wrong' })
    }
}

export const updateUser = async (req, res) => {
    const { userId } = req.params;
    const { name, email } = req.body;
   try{
     const findUser = await User.findById(userId);
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (!findUser) {
        return res.status(404).json({ message: 'User not found' });
    }
    const updatedUser = await User.findByIdAndUpdate(userId, req.body, { new: true });
    res.status(200).json(updatedUser);
   }
   catch(err){
    res.status(500).json({ message: 'Something went wrong' });
   }

}

export const allUsers = async (req, res) => {
    try {
        const users = await User.find({}, '-password'); // Exclude the password field
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: 'Something went wrong' });
    }
}

export const deleteUser = async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Something went wrong' });
    }
}

export const getUserById = async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await User.findById(userId, '-password').populate('selectedExams'); // Exclude the password field and populate exam details
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: 'Something went wrong' });
    }
}

/**
 * GET /auth/me — returns the currently authenticated user.
 * Uses the JWT token (via `authenticate` middleware) to identify the user.
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId, '-password -__v').populate('selectedExams');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}