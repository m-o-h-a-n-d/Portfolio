import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, CheckCircle } from 'lucide-react';
import { apiPost } from '../../api/request';
import { DASHBOARD_ENDPOINTS } from '../../api/endpoints';
import { extractFieldErrors } from '../../lib/validationErrors';
import Swal from '../../lib/swal';

const OTPVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || 'your email';

  useEffect(() => {
    if (!location.state?.email) {
      navigate('/admin/forget-password');
    }
  }, [location, navigate]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus next input
    if (element.nextSibling && element.value !== '') {
      element.nextSibling.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && e.target.previousSibling) {
      e.target.previousSibling.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length < 6) {
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete OTP',
        text: 'Please enter all 6 digits.'
      });
      return;
    }

    setLoading(true);
    try {
      setFieldErrors({});
      const response = await apiPost(DASHBOARD_ENDPOINTS.auth.verifyOtp, { email, otp: otpValue });
      const resetToken = response?.data?.reset_token || response?.reset_token;
      
      Swal.fire({
        icon: 'success',
        title: 'Verified',
        text: 'OTP verified successfully!',
        timer: 1500,
        showConfirmButton: false
      });
      
      if (!resetToken) {
        Swal.fire({
          icon: 'error',
          title: 'Missing Token',
          text: 'Reset token was not provided by the server. Please try again.'
        });
        return;
      }

      navigate('/admin/reset-password', { state: { email, token: resetToken } });
    } catch (error) {
      setFieldErrors(extractFieldErrors(error));
      Swal.fire({
        icon: 'error',
        title: 'Invalid OTP',
        text: 'The code you entered is incorrect or expired.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div 
          className="relative bg-card border border-border rounded-[20px] p-8 shadow-portfolio-5"
          style={{ background: 'var(--bg-gradient-jet)' }}
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-[20px] flex items-center justify-center" style={{ background: 'var(--bg-gradient-onyx)' }}>
              <ShieldCheck className="w-10 h-10 text-primary" />
            </div>
            <h1 className="h2 text-white-2 mb-2">Verify OTP</h1>
            <p className="text-light-gray text-sm font-light">
              We've sent a code to <span className="text-primary font-medium">{email}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="flex justify-between gap-2 mb-8">
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  value={data}
                  onChange={(e) => handleChange(e.target, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="w-12 h-14 text-center text-xl font-bold bg-onyx border border-border rounded-xl text-white-2 focus:border-primary focus:outline-none transition-all"
                />
              ))}
            </div>
            {fieldErrors.otp && (
              <p className="mt-1 text-xs text-destructive">{fieldErrors.otp}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="form-btn disabled:opacity-50"
            >
              <CheckCircle className="w-5 h-5" />
              <span>{loading ? 'Verifying...' : 'Verify Code'}</span>
            </button>
          </form>

          <div className="mt-6 text-center space-y-4">
            <p className="text-light-gray text-sm">
              Didn't receive the code?{' '}
              <button className="text-primary hover:underline">Resend</button>
            </p>
            <Link 
              to="/admin/forget-password" 
              className="text-light-gray text-sm hover:text-primary transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Change Email
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
