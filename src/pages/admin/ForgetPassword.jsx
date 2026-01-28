import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { apiPost } from '../../api/request';
import { DASHBOARD_ENDPOINTS } from '../../api/endpoints';
import { extractFieldErrors } from '../../lib/validationErrors';
import Swal from '../../lib/swal';

const ForgetPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      setFieldErrors({});
      await apiPost(DASHBOARD_ENDPOINTS.auth.forgotPassword, { email });
      
      Swal.fire({
        icon: 'success',
        title: 'OTP Sent',
        text: 'A 6-digit code has been sent to your email.',
        timer: 2000,
        showConfirmButton: false
      });
      
      navigate('/admin/otp-verification', { state: { email } });
    } catch (error) {
      setFieldErrors(extractFieldErrors(error));
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to send OTP. Please try again.'
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
              <Mail className="w-10 h-10 text-primary" />
            </div>
            <h1 className="h2 text-white-2 mb-2">Forgot Password</h1>
            <p className="text-light-gray text-sm font-light">Enter your email to receive a verification code</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="text-light-gray/70 text-xs uppercase mb-2 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input pl-12"
                  placeholder="your@email.com"
                  required
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-destructive">{fieldErrors.email}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="form-btn disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
              <span>{loading ? 'Sending...' : 'Send Reset Code'}</span>
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link 
              to="/admin/login" 
              className="text-light-gray text-sm hover:text-primary transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;
