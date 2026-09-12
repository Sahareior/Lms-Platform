import crypto from "crypto"
import User from "../models/User.js"
import PasswordResetToken from "../models/PasswordResetToken.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/jwt.js"
import { sendEmail } from "../config/resend.js"

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
        // Use the same response for "no such user" and "wrong password" so the
        // endpoint doesn't leak which emails are registered (user enumeration).
        if(!user || !(await bcrypt.compare(password, user.password))){
            return res.status(401).json({ message: 'Invalid email or password' })
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

// Fields a user (or admin) is allowed to change via the profile endpoint.
// `role` and `password` are intentionally NOT whitelisted — changing them via
// this endpoint would be a privilege-escalation / account-takeover vector.
const UPDATABLE_PROFILE_FIELDS = [
  'name',
  'username',
  'phone',
  'email',
  'profilePic',
  'dateOfBirth',
  'division',
  'district',
  'thana',
  'village',
  'postCode',
  'fullAddress',
  'education',
  'institute',
  'targetDate',
  'preferredCenter',
  'hearAbout',
  'notes',
  'agreed',
  'selectedExams',
];

export const updateUser = async (req, res) => {
    const { userId } = req.params;
   try{
     const findUser = await User.findById(userId);
     if (!findUser) {
        return res.status(404).json({ message: 'User not found' });
     }

     // Whitelist the incoming fields so callers can never set role/password
     // or inject arbitrary schema keys (mass-assignment protection).
     const updateData = {};
     for (const field of UPDATABLE_PROFILE_FIELDS) {
       if (req.body[field] !== undefined) updateData[field] = req.body[field];
     }

     // If the email is being changed, make sure no other account uses it.
     if (updateData.email && updateData.email !== findUser.email) {
       const existing = await User.findOne({ email: updateData.email, _id: { $ne: userId } });
       if (existing) {
         return res.status(409).json({ message: 'Email is already in use by another account' });
       }
     }

     const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true });
     res.status(200).json(sanitizeUser(updatedUser));
   }
   catch(err){
    console.error(err);
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
 * POST /auth/forgot-password — sends a password reset link by email.
 * Always returns the same response whether or not the email exists
 * (no user enumeration).
 */
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    const resetUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    if (user) {
      // Invalidate any previous tokens for this user.
      await PasswordResetToken.deleteMany({ user: user._id, usedAt: null });

      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      await PasswordResetToken.create({
        user: user._id,
        tokenHash,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      });

      const resetLink = `${resetUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(user.email)}`;
      try {
        await sendEmail({
          to: user.email,
          subject: 'Reset your Geneseon password',
          html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px">
            <h2 style="margin:0 0 8px;color:#0f172a">Password reset</h2>
            <p style="color:#475569;font-size:14px">We received a request to reset your password. This link is valid for 1 hour.</p>
            <a href="${resetLink}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#2F80ED;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold">Reset password</a>
            <p style="color:#94a3b8;font-size:12px">If you didn't request this, you can safely ignore this email.</p>
          </div>`,
        });
      } catch (emailErr) {
        console.error('Failed to send reset email:', emailErr.message);
      }
    }

    // Same response either way — never reveals whether the email is registered.
    return res.status(200).json({
      message: 'If that email is registered, a reset link has been sent.',
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

/**
 * POST /auth/reset-password — sets a new password using a reset token.
 */
export const resetPassword = async (req, res) => {
  const { token, email, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ message: 'Token and new password are required' });
  }
  if (typeof newPassword !== 'string' || newPassword.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  try {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const resetToken = await PasswordResetToken.findOne({ tokenHash });

    if (!resetToken || resetToken.usedAt) {
      return res.status(400).json({ message: 'Invalid or already-used reset link' });
    }
    if (resetToken.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Reset link has expired. Please request a new one.' });
    }

    const user = await User.findById(resetToken.user);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Optionally double-check the email matches the token holder.
    if (email && user.email.toLowerCase() !== String(email).toLowerCase()) {
      return res.status(400).json({ message: 'Email does not match this reset link' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    resetToken.usedAt = new Date();
    await resetToken.save();

    res.status(200).json({ message: 'Password updated. You can now sign in.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

/**
 * GET /auth/users/export — admin-only CSV download of all users.
 */
export const exportUsersCsv = async (req, res) => {
  try {
    const users = await User.find({}, '-password -__v').lean();
    const headers = ['name', 'username', 'email', 'phone', 'role', 'division', 'district', 'thana', 'education', 'institute', 'targetDate', 'createdAt'];
    const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = users.map((u) => headers.map((h) => escape(u[h])).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="users.csv"');
    res.status(200).send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to export users' });
  }
};

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