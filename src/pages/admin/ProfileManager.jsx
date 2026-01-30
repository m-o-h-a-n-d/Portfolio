import { useState, useEffect } from 'react';
import { apiGet, apiPut } from '../../api/request';
import { DASHBOARD_ENDPOINTS } from '../../api/endpoints';
import { Save, Upload, User, Share2 } from 'lucide-react';
import Swal from '../../lib/swal';
import { extractFieldErrors, getFieldError } from '../../lib/validationErrors';

const ProfileManager = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const socialPlatforms = ['github', 'facebook', 'linkedin', 'instagram'];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await apiGet(DASHBOARD_ENDPOINTS.user.list);
      const profileData = response.data || {};
      setProfile({
        ...profileData,
        contact_email: profileData?.contact_email || '',
        social_links: {
          github: profileData?.social_links?.github || '',
          facebook: profileData?.social_links?.facebook || '',
          linkedin: profileData?.social_links?.linkedin || '',
          instagram: profileData?.social_links?.instagram || ''
        }
      });
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSocialChange = (platform, value) => {
    setProfile(prev => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: value
      }
    }));
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      // Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);

    try {
      setFieldErrors({});
      const formData = new FormData();
      formData.append('name', profile?.name || '');
      formData.append('title', profile?.title || '');
      formData.append('email', profile?.email || '');
      formData.append('contact_email', profile?.contact_email || '');
      formData.append('phone', profile?.phone || '');
      formData.append('birthday', profile?.birthday || '');
      formData.append('location', profile?.location || '');
      formData.append('about', profile?.about || '');
      formData.append('map_embed', profile?.map_embed || '');
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }
      const socialLinks = profile?.social_links || {};
      Object.entries(socialLinks).forEach(([key, value]) => {
        formData.append(`social_links[${key}]`, value || '');
      });
      await apiPut(DASHBOARD_ENDPOINTS.user.update, formData);
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Profile updated successfully!',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      setFieldErrors(extractFieldErrors(error));
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error saving profile',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="h2 text-white-2">Profile Manager</h1>
          <p className="text-muted-foreground text-sm mt-1">Update your personal information and social links</p>
        </div>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="form-btn !w-auto !px-6"
        >
          <Save className="w-5 h-5" />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Photo + Social (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Avatar Section */}
          <div className="bg-card border border-border rounded-[20px] p-6" style={{ background: 'var(--bg-gradient-jet)' }}>
            <h3 className="h3 text-white-2 mb-4">Profile Photo</h3>
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                {profile?.avatar ? (
                  <img 
                    src={profile.avatar} 
                    alt="Avatar" 
                    className="w-48 h-48 rounded-[20px] object-cover border-2 border-border"
                  />
                ) : (
                  <div className="w-48 h-48 rounded-[20px] bg-onyx flex items-center justify-center border-2 border-border">
                    <User className="w-16 h-16 text-muted-foreground" />
                  </div>
                )}
              </div>
              <label className="form-btn !w-full cursor-pointer inline-flex">
                <Upload className="w-4 h-4" />
                <span>Upload Photo</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleAvatarUpload}
                />
              </label>
              {fieldErrors.avatar && (
                <p className="mt-1 text-xs text-destructive">{fieldErrors.avatar}</p>
              )}
            </div>
          </div>

          {/* Social Media Links */}
          <div className="bg-card border border-border rounded-[20px] p-6 space-y-4" style={{ background: 'var(--bg-gradient-jet)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Share2 className="w-5 h-5 text-primary" />
              <h3 className="h3 text-white-2">Social Media</h3>
            </div>
            
            <div className="space-y-4">
              {socialPlatforms.map((platform) => (
                <div key={platform}>
                  <label className="text-light-gray/70 text-[10px] uppercase mb-1 block capitalize">{platform}</label>
                  <input
                    type="url"
                    value={profile?.social_links?.[platform] || ''}
                    onChange={(e) => handleSocialChange(platform, e.target.value)}
                    className="form-input text-sm py-2"
                    placeholder={`https://${platform}.com/yourprofile`}
                  />
                  {getFieldError(fieldErrors, `social_links.${platform}`) && (
                    <p className="mt-1 text-xs text-destructive">
                      {getFieldError(fieldErrors, `social_links.${platform}`)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Basic Info + About (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Basic Info */}
          <div className="bg-card border border-border rounded-[20px] p-6" style={{ background: 'var(--bg-gradient-jet)' }}>
            <h3 className="h3 text-white-2 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-light-gray/70 text-xs uppercase mb-2 block">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={profile?.name || ''}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
                {fieldErrors.name && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrors.name}</p>
                )}
              </div>
              <div>
                <label className="text-light-gray/70 text-xs uppercase mb-2 block">Job Title</label>
                <input
                  type="text"
                  name="title"
                  value={profile?.title || ''}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
                {fieldErrors.title && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrors.title}</p>
                )}
              </div>
              <div>
                <label className="text-light-gray/70 text-xs uppercase mb-2 block">Email</label>
                <input
                  type="email"
                  name="email"
                  value={profile?.email || ''}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
                {fieldErrors.email && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrors.email}</p>
                )}
              </div>
              <div>
                <label className="text-light-gray/70 text-xs uppercase mb-2 block">Email Contact</label>
                <input
                  type="email"
                  name="contact_email"
                  value={profile?.contact_email || ''}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
                {fieldErrors.contact_email && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrors.contact_email}</p>
                )}
              </div>
              <div>
                <label className="text-light-gray/70 text-xs uppercase mb-2 block">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={profile?.phone || ''}
                  onChange={handleInputChange}
                  className="form-input"
                />
                {fieldErrors.phone && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrors.phone}</p>
                )}
              </div>
              <div>
                <label className="text-light-gray/70 text-xs uppercase mb-2 block">Birthday</label>
                <input
                  type="date"
                  name="birthday"
                  value={profile?.birthday || ''}
                  onChange={handleInputChange}
                  className="form-input"
                />
                {fieldErrors.birthday && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrors.birthday}</p>
                )}
              </div>
              <div>
                <label className="text-light-gray/70 text-xs uppercase mb-2 block">Location</label>
                <input
                  type="text"
                  name="location"
                  value={profile?.location || ''}
                  onChange={handleInputChange}
                  className="form-input"
                />
                {fieldErrors.location && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrors.location}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="text-light-gray/70 text-xs uppercase mb-2 block">Map Embed</label>
                <input
                  type="text"
                  name="map_embed"
                  value={profile?.map_embed || ''}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="https://www.google.com/maps/embed?..."
                />
                {fieldErrors.map_embed && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrors.map_embed}</p>
                )}
              </div>
            </div>
          </div>

          {/* About */}
          <div className="bg-card border border-border rounded-[20px] p-6" style={{ background: 'var(--bg-gradient-jet)' }}>
            <h3 className="h3 text-white-2 mb-4">About Me</h3>
            <div>
              <label className="text-light-gray/70 text-xs uppercase mb-2 block">Biography</label>
              <textarea
                name="about"
                value={profile?.about || ''}
                onChange={handleInputChange}
                className="form-input min-h-[250px] resize-y"
                placeholder="Write your biography here..."
              />
              {fieldErrors.about && (
                <p className="mt-1 text-xs text-destructive">{fieldErrors.about}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileManager;
