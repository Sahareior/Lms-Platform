import User from "../models/User.js"
import bcrypt from "bcrypt"

export const handelSignUps = async(req,res) => {
    const {email,password,name} = req.body 
    console.log(email,password)

    try{
        const isExisting = await User.findOne({email})
        if(isExisting){
            return res.status(404).json('User with this email already exists')
        }
        const hashPass = await bcrypt.hash(password, 10)
        const newUser = new User({email, password: hashPass,name})
        await newUser.save()
        res.status(200).json('User created successfully')
    }
    catch(err){
        console.log(err)
        res.status(500).json('Something went wrong')
    }

}

export const handelSingIn = async (req,res)=> {
    const {email,password} = req.body

    try{
        const user = await User.findOne({email})
        if(!user){
            return res.status(404).json('User not found')
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch){
            return res.status(400).json('Invalid credentials')
        }
        const userData = user.toObject()
        delete userData.password
        res.status(200).json({ message: 'User signed in successfully', user: userData })
    }
    catch(err){
        // console.log(err)
        res.status(500).json('Something went wrong')
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