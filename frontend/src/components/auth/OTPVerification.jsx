import React, { useState, useEffect, useRef } from 'react';

const OTPVerification = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [email, setEmail] = useState('');
    const [isEmailSent, setIsEmailSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const inputRefs = useRef([]);

    // Auto-focus first input on mount
    useEffect(() => {
        if (isEmailSent && inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, [isEmailSent]);

    // Countdown timer for resend OTP
    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => {
                setTimeLeft(timeLeft - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft]);

    const handleEmailSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            setError('Please enter your email address');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // API call to send OTP
            const response = await fetch('https://your-api-endpoint.com/api/send-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                setIsEmailSent(true);
                setTimeLeft(60); // 60 seconds countdown
                setSuccess('OTP has been sent to your email');
                setOtp(['', '', '', '', '', '']);
            } else {
                setError(data.message || 'Failed to send OTP. Please try again.');
            }
        } catch (error) {
            console.error('Error sending OTP:', error);
            setError('Network error. Please check your connection.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpChange = (index, value) => {
        // Allow only numbers
        if (value && !/^\d+$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.slice(0, 1); // Take only first character
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Handle backspace to go to previous input
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }

        // Handle left arrow key
        if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1].focus();
        }

        // Handle right arrow key
        if (e.key === 'ArrowRight' && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text');
        const pastedNumbers = pastedData.replace(/\D/g, '').slice(0, 6);

        if (pastedNumbers) {
            const newOtp = [...otp];
            for (let i = 0; i < pastedNumbers.length; i++) {
                newOtp[i] = pastedNumbers[i];
            }
            setOtp(newOtp);

            // Focus on the next empty input or last input
            const nextIndex = Math.min(pastedNumbers.length, 5);
            inputRefs.current[nextIndex].focus();
        }
    };

    const handleVerifyOtp = async () => {
        const otpValue = otp.join('');

        if (otpValue.length !== 6) {
            setError('Please enter the complete 6-digit OTP');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // API call to verify OTP
            const response = await fetch('https://your-api-endpoint.com/api/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    otp: otpValue
                })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('OTP verified successfully!');

                // Store verification token
                if (data.token) {
                    localStorage.setItem('verificationToken', data.token);
                }

                // Redirect after 2 seconds
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 2000);
            } else {
                setError(data.message || 'Invalid OTP. Please try again.');
                // Clear OTP on error
                setOtp(['', '', '', '', '', '']);
                inputRefs.current[0].focus();
            }
        } catch (error) {
            console.error('Error verifying OTP:', error);
            setError('Network error. Please check your connection.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (timeLeft > 0) return;

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('https://your-api-endpoint.com/api/resend-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                setTimeLeft(60);
                setSuccess('OTP resent successfully');
                setOtp(['', '', '', '', '', '']);
                inputRefs.current[0].focus();
            } else {
                setError(data.message || 'Failed to resend OTP');
            }
        } catch (error) {
            console.error('Error resending OTP:', error);
            setError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditEmail = () => {
        setIsEmailSent(false);
        setEmail('');
        setOtp(['', '', '', '', '', '']);
        setError('');
        setSuccess('');
        setTimeLeft(0);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 transform transition-all duration-500">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                        <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6-4h12a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6a2 2 0 012-2zm10-4V6a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">OTP Verification</h2>
                    <p className="text-gray-600 mt-2">
                        {isEmailSent
                            ? `Enter the verification code sent to ${email}`
                            : 'Enter your email to receive verification code'}
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-600 text-sm">{success}</p>
                    </div>
                )}

                {!isEmailSent ? (
                    <form onSubmit={handleEmailSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                disabled={isLoading}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Sending...
                                </span>
                            ) : (
                                'Send Verification Code'
                            )}
                        </button>
                    </form>
                ) : (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">Verification Code</span>
                            <button
                                onClick={handleEditEmail}
                                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                            >
                                Edit Email
                            </button>
                        </div>

                        <div className="flex justify-between gap-2" onPaste={handlePaste}>
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => inputRefs.current[index] = el}
                                    type="text"
                                    value={digit}
                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    maxLength="1"
                                    className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                    disabled={isLoading}
                                />
                            ))}
                        </div>

                        <div className="text-center">
                            <p className="text-sm text-gray-600">
                                {timeLeft > 0 ? (
                                    <span>Resend code in <span className="font-semibold text-indigo-600">{timeLeft}</span> seconds</span>
                                ) : (
                                    <button
                                        onClick={handleResendOtp}
                                        disabled={isLoading}
                                        className="text-indigo-600 hover:text-indigo-700 font-medium"
                                    >
                                        Resend Verification Code
                                    </button>
                                )}
                            </p>
                        </div>

                        <button
                            onClick={handleVerifyOtp}
                            disabled={isLoading}
                            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Verifying...
                                </span>
                            ) : (
                                'Verify OTP'
                            )}
                        </button>
                    </div>
                )}

                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-500">
                        By continuing, you agree to our{' '}
                        <a href="/terms" className="text-indigo-600 hover:text-indigo-700">Terms of Service</a>
                        {' '}and{' '}
                        <a href="/privacy" className="text-indigo-600 hover:text-indigo-700">Privacy Policy</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OTPVerification;