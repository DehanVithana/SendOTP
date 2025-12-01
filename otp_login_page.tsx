import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, CheckCircle, XCircle } from 'lucide-react';

const OTPLoginSystem = () => {
  const [step, setStep] = useState(1);
  const [selectedUser, setSelectedUser] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const users = [
    { name: 'Dehan Vithana', email: 'dehanv@masholdings.com' },
    { name: 'Thushani Imbulamure', email: 'thushanii@masholdings.com' },
    { name: 'Shenuka Abeyratne', email: 'ShenukaA@masholdings.com' },
    { name: 'Riley Dougles', email: 'RileyD@masholdings.com' },
    { name: 'Hiran Mendis', email: 'hiranme@masholdings.com' }
  ];

  // SendGrid configuration - Replace these with your actual values
  const SENDGRID_API_KEY = 'YOUR_SENDGRID_API_KEY'; // Replace with your SendGrid API key
  const FROM_EMAIL = 'noreply@masholdings.com'; // Replace with your verified sender email
  const FROM_NAME = 'MAS Holdings';

  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const sendOTPEmail = async (email, otp, userName) => {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SENDGRID_API_KEY}`
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [
                {
                  email: email,
                  name: userName
                }
              ],
              subject: 'Your OTP Code - MAS Holdings Login'
            }
          ],
          from: {
            email: FROM_EMAIL,
            name: FROM_NAME
          },
          content: [
            {
              type: 'text/html',
              value: `
                <!DOCTYPE html>
                <html>
                <head>
                  <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .otp-box { background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
                    .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; }
                    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h1>MAS Holdings</h1>
                      <p>One-Time Password</p>
                    </div>
                    <div class="content">
                      <p>Dear ${userName},</p>
                      <p>Your One-Time Password (OTP) for login is:</p>
                      <div class="otp-box">
                        <div class="otp-code">${otp}</div>
                      </div>
                      <p><strong>Important:</strong></p>
                      <ul>
                        <li>This OTP is valid for 10 minutes</li>
                        <li>Do not share this code with anyone</li>
                        <li>If you didn't request this code, please ignore this email</li>
                      </ul>
                      <div class="footer">
                        <p>This is an automated message from MAS Holdings. Please do not reply to this email.</p>
                      </div>
                    </div>
                  </div>
                </body>
                </html>
              `
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('SendGrid error:', errorData);
        throw new Error('Failed to send email via SendGrid');
      }

      return true;
    } catch (error) {
      console.error('Email send error:', error);
      throw error;
    }
  };

  const handleNext = async () => {
    if (!selectedUser) {
      setError('Please select a user');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    const otp = generateOTP();
    setGeneratedOTP(otp);

    const user = users.find(u => u.name === selectedUser);
    
    try {
      await sendOTPEmail(user.email, otp, user.name);
      setStep(2);
      setSuccessMessage('OTP sent successfully! Check your email.');
      console.log(`OTP for ${user.name}: ${otp}`); // For testing/debugging
    } catch (err) {
      setError('Failed to send OTP. Please check your SendGrid configuration and try again.');
      console.error('Error details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = () => {
    if (!otpInput) {
      setError('Please enter the OTP');
      return;
    }

    if (otpInput === generatedOTP) {
      setError('');
      setStep(3);
    } else {
      setError('Invalid OTP. Please check your email and try again.');
      setOtpInput('');
    }
  };

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError('');
    setSuccessMessage('');

    const otp = generateOTP();
    setGeneratedOTP(otp);
    setOtpInput('');

    const user = users.find(u => u.name === selectedUser);
    
    try {
      await sendOTPEmail(user.email, otp, user.name);
      setSuccessMessage('OTP resent successfully! Check your email.');
      console.log(`New OTP for ${user.name}: ${otp}`); // For testing/debugging
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome!</h1>
            <p className="text-gray-600">You have successfully logged in</p>
            <p className="text-lg font-semibold text-indigo-600 mt-4">{selectedUser}</p>
            <p className="text-sm text-gray-500 mt-2">
              {users.find(u => u.name === selectedUser)?.email}
            </p>
          </div>
          <button
            onClick={() => {
              setStep(1);
              setSelectedUser('');
              setOtpInput('');
              setGeneratedOTP('');
              setError('');
              setSuccessMessage('');
            }}
            className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
            <Lock className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {step === 1 ? 'Welcome Back' : 'Verify OTP'}
          </h1>
          <p className="text-gray-600">
            {step === 1 ? 'Select your name to continue' : 'Enter the code sent to your email'}
          </p>
        </div>

        {step === 1 ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select User
              </label>
              <div className="relative">
                <select
                  value={selectedUser}
                  onChange={(e) => {
                    setSelectedUser(e.target.value);
                    setError('');
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none appearance-none bg-white"
                >
                  <option value="">Choose your name...</option>
                  {users.map((user) => (
                    <option key={user.email} value={user.name}>
                      {user.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <XCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleNext}
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending OTP...
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
              <p className="font-semibold mb-2">📧 SendGrid Setup:</p>
              <ol className="list-decimal ml-4 space-y-1">
                <li>Replace <code className="bg-blue-100 px-1 rounded">SENDGRID_API_KEY</code> with your API key</li>
                <li>Replace <code className="bg-blue-100 px-1 rounded">FROM_EMAIL</code> with your verified sender email</li>
                <li>Make sure your sender email is verified in SendGrid</li>
              </ol>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex items-start gap-3">
              <Mail className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-indigo-800">
                <p className="font-medium">OTP sent to:</p>
                <p className="mt-1">{users.find(u => u.name === selectedUser)?.email}</p>
              </div>
            </div>

            {successMessage && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter OTP
              </label>
              <input
                type="text"
                value={otpInput}
                onChange={(e) => {
                  setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6));
                  setError('');
                }}
                onKeyPress={(e) => handleKeyPress(e, handleVerifyOTP)}
                placeholder="000000"
                maxLength="6"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-center text-2xl font-semibold tracking-widest"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <XCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleVerifyOTP}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                Verify OTP
              </button>

              <button
                onClick={handleResendOTP}
                disabled={loading}
                className="w-full bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Resending...
                  </>
                ) : (
                  'Resend OTP'
                )}
              </button>
              
              <button
                onClick={() => {
                  setStep(1);
                  setOtpInput('');
                  setError('');
                  setSuccessMessage('');
                }}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Back
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              Check the browser console for the OTP (development mode)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OTPLoginSystem;