import User from '../Models/User.js';
import PasswordResetToken from '../Models/PasswordResetToken.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Email transporter configuration
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

// Login function ntdc srzd dhtt pffu
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log('🔐 LOGIN ATTEMPT:', email);
        
        const user = await User.findOne({ email });
        if (!user) {
            console.log('❌ User not found');
            return res.status(404).json({ success: false, error: "User not found" });
        }

        console.log('✅ User found, comparing passwords...');
        
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('🔍 Password match result:', isMatch);
        
        if (!isMatch) {
            return res.status(400).json({ success: false, error: "Wrong password" });
        }

        const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_KEY, { expiresIn: '10d' });
        
        res.status(200).json({
            success: true,
            token,
            user: {
                _id: user._id,
                email: user.email,
                role: user.role,
                name: user.name
            }
        });
    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Verify function
const verify = (req, res) => {
    return res.status(200).json({
        success: true,
        user: req.user
    });
};



const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    // Find user by email
    const user = await User.findOne({ email });

    // If user not found, respond with error
    if (!user) {
      return res.status(404).json({ success: false, error: 'Enter a valid email' });
    }

    // Delete previous tokens
    await PasswordResetToken.deleteMany({ userId: user._id });

    // Generate new token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Save token in DB
    await PasswordResetToken.create({
      userId: user._id,
      token: hashedToken,
      expiresAt: Date.now() + 60 * 60 * 1000 // 1 hour expiry
    });

    // Prepare reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    // Send email
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"Remedy EMS" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Reset Your Password - Remedy EMS',
      html: `
        <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; border:1px solid #eee; border-radius:8px; overflow:hidden;">
          <div style="background-color:#0d6efd; color:white; padding:20px; text-align:center;">
            <h2>🔐 Password Reset Request</h2>
          </div>
          <div style="padding:20px;">
            <p>Hi ${user.name},</p>
            <p>We received a request to reset your password.</p>
            <p>Click the button below to set a new password (valid for 1 hour):</p>
            <div style="text-align:center; margin:20px 0;">
              <a href="${resetUrl}" style="background-color:#0d6efd;color:white;padding:12px 24px;border-radius:5px;text-decoration:none;">Reset Password</a>
            </div>
            <p>If the button doesn’t work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all;">${resetUrl}</p>
            <p>If you didn’t request this, ignore this email.</p>
            <p>Thanks,<br/>Remedy EMS Team</p>
          </div>
          <div style="background-color:#f8f9fa;text-align:center;padding:10px;font-size:12px;color:#777;">
            &copy; ${new Date().getFullYear()} Remedy EMS. All rights reserved.
          </div>
        </div>
      `
    });

    console.log('Password reset email sent to:', user.email);
    console.log('Reset URL:', resetUrl);

    return res.status(200).json({ success: true, message: 'Password reset instructions have been sent to your email.' });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, error: 'Server error. Please try again later.' });
  }
};



// Reset Password function - ENHANCED VERSION
const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        console.log(' RESET PASSWORD REQUEST');
        console.log(' Token received');
        console.log(' New password length:', password?.length);

        if (!token || !password) {
            return res.status(400).json({
                success: false,
                error: 'Token and password are required'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 6 characters long'
            });
        }

        // Hash the token to compare with stored token
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Find the reset token
        const resetToken = await PasswordResetToken.findOne({
            token: hashedToken,
            expiresAt: { $gt: new Date() }
        }).populate('userId');

        if (!resetToken) {
            console.log(' Invalid or expired token');
            return res.status(400).json({
                success: false,
                error: 'Invalid or expired reset token. Please request a new password reset.'
            });
        }

        // Find the user
        const user = await User.findById(resetToken.userId._id);
        if (!user) {
            return res.status(400).json({
                success: false,
                error: 'User not found'
            });
        }

        console.log(' Resetting password for:', user.email);
        console.log(' Old password hash:', user.password);

        // METHOD 1: Direct assignment to trigger pre-save hook
        user.password = password;
        await user.save(); // This should trigger the pre-save hook
        
        console.log(' New password hash:', user.password);
        console.log(' Password updated for:', user.email);

        // Verify the new password works
        const verifyNewPassword = await bcrypt.compare(password, user.password);
        console.log('🔍 New password verification:', verifyNewPassword);

        if (!verifyNewPassword) {
            console.log(' Password hashing failed!');
            // Fallback: Manual hashing
            console.log(' Attempting manual password hashing...');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            user.password = hashedPassword;
            await user.save();
            console.log(' Password manually hashed and saved');
        }

        // Delete the used reset token
        await PasswordResetToken.deleteMany({ userId: user._id });
        console.log(' Reset token deleted');

        // Send confirmation email
        try {
            const transporter = createTransporter();
            
            const mailOptions = {
                from: `"Remedy EMS" <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: 'Password Updated Successfully - Remedy EMS',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                            .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
                            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 15px 0; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h1> Password Updated</h1>
                                <p>Remedy Employee Management System</p>
                            </div>
                            <div class="content">
                                <h2>Hello ${user.name},</h2>
                                <p>Your password has been successfully updated for your Remedy EMS account.</p>
                                
                                <div class="warning">
                                    <strong> Security Notice:</strong>
                                    <p>If you did not make this change, please contact your system administrator immediately.</p>
                                </div>
                                
                                <p>You can now login to your account with your new password.</p>
                                
                                <div style="text-align: center; margin: 20px 0;">
                                    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" 
                                       style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                                        Login to Your Account
                                    </a>
                                </div>
                            </div>
                            <div class="footer">
                                <p>This is an automated message. Please do not reply to this email.</p>
                                <p>&copy; 2025 Remedy EMS. All rights reserved.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `
            };

            await transporter.sendMail(mailOptions);
            console.log('✅ Password change confirmation email sent to:', user.email);

        } catch (emailError) {
            console.error(' Confirmation email failed, but password was reset:', emailError);
        }

        res.status(200).json({
            success: true,
            message: 'Password has been reset successfully. You can now login with your new password.'
        });

    } catch (error) {
        console.error(' Reset password error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error. Please try again later.'
        });
    }
};

// Verify Reset Token function
const verifyResetToken = async (req, res) => {
    try {
        const { token } = req.query;

        console.log('🔍 VERIFY RESET TOKEN REQUEST');

        if (!token) {
            return res.status(400).json({
                success: false,
                error: 'Token is required'
            });
        }

        // Hash the token to compare with stored token
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Find the reset token
        const resetToken = await PasswordResetToken.findOne({
            token: hashedToken,
            expiresAt: { $gt: new Date() }
        }).populate('userId');

        if (!resetToken) {
            console.log(' Invalid or expired token');
            return res.status(400).json({
                success: false,
                error: 'Invalid or expired reset token'
            });
        }

        console.log(' Valid token found for user:', resetToken.userId.email);

        res.status(200).json({
            success: true,
            message: 'Valid reset token',
            user: {
                name: resetToken.userId.name,
                email: resetToken.userId.email,
                role: resetToken.userId.role
            }
        });

    } catch (error) {
        console.error(' Verify token error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error. Please try again later.'
        });
    }
};

export { 
    login, 
    verify, 
    forgotPassword, 
    resetPassword, 
    verifyResetToken 
};