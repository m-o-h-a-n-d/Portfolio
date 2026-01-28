import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Eye, EyeOff, Save, CheckCircle } from 'lucide-react';
import { apiPost } from '../../api/request';
import { DASHBOARD_ENDPOINTS } from '../../api/endpoints';
import { extractFieldErrors } from '../../lib/validationErrors';
import Swal from '../../lib/swal';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!location.state?.email || !location.state?.token) {
      navigate('/admin/forget-password');
    }
  }, [location, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Mismatch',
        text: 'Passwords do not match!'
      });
      return;
    }

    if (password.length < 8) {
      Swal.fire({
        icon: 'warning',
        title: 'Weak Password',
        text: 'Password must be at least 8 characters long.'
      });
      return;
    }

    setLoading(true);
    try {
      setFieldErrors({});
      await apiPost(DASHBOARD_ENDPOINTS.auth.resetPassword, {
        email: location.state?.email,
        token: location.state?.token,
        password,
        password_confirmation: confirmPassword
      });
      
      await Swal.fire({
        icon: 'success',
        title: 'Password Reset',
        text: 'Your password has been updated successfully!',
        timer: 2000,
        showConfirmButton: false
      });
      
      navigate('/admin/login');
    } catch (error) {
      setFieldErrors(extractFieldErrors(error));
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to reset password. Please try again.'
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
              <Lock className="w-10 h-10 text-primary" />
            </div>
            <h1 className="h2 text-white-2 mb-2">Reset Password</h1>
            <p className="text-light-gray text-sm font-light">Create a new secure password for your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-light-gray/70 text-xs uppercase mb-2 block">New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input pl-12 pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-destructive">{fieldErrors.password}</p>
              )}
            </div>

            <div>
              <label className="text-light-gray/70 text-xs uppercase mb-2 block">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input pl-12"
                  placeholder="••••••••"
                  required
                />
              </div>
              {fieldErrors.password_confirmation && (
                <p className="mt-1 text-xs text-destructive">{fieldErrors.password_confirmation}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="form-btn disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span>{loading ? 'Updating...' : 'Update Password'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
