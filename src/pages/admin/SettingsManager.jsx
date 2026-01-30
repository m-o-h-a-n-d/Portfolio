import { useState, useEffect } from 'react';
import { apiGet, apiPut } from '../../api/request';
import { DASHBOARD_ENDPOINTS } from '../../api/endpoints';
import { Save, Globe, Upload, FileText } from 'lucide-react';
import Swal from '../../lib/swal';
import { extractFieldErrors } from '../../lib/validationErrors';

const SettingsManager = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dragActive, setDragActive] = useState({ logo: false, favicon: false });
  const [cvFile, setCvFile] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await apiGet(DASHBOARD_ENDPOINTS.settings.list);
      const settingsList = response?.data?.settings || response?.data || [];
      const settingsItem = Array.isArray(settingsList) ? settingsList[0] : settingsList;
      setSettings({
        id: settingsItem?.id,
        company: settingsItem?.company || '',
        logo: settingsItem?.logo || '',
        favicon: settingsItem?.favicon || '',
        cv: settingsItem?.cv || ''
      });
      setLogoFile(null);
      setFaviconFile(null);
      setCvFile(null);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCvUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setCvFile(file);
      handleInputChange('cv', file.name);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Invalid File',
        text: 'Please upload a PDF file'
      });
    }
  };

  // File Upload Logic for images
  const handleFileUpload = (type, file) => {
    if (file && file.type.startsWith('image/')) {
      const previewUrl = URL.createObjectURL(file);
      if (type === 'logo') {
        setLogoFile(file);
        handleInputChange('logo', previewUrl);
      } else {
        setFaviconFile(file);
        handleInputChange('favicon', previewUrl);
      }
    }
  };

  const handleDragFile = (e, type, active) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [type]: active }));
  };

  const handleDropFile = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [type]: false }));
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(type, e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      setFieldErrors({});
      const formPayload = new FormData();
      formPayload.append('company', settings.company || '');
      if (logoFile) formPayload.append('logo', logoFile);
      if (faviconFile) formPayload.append('favicon', faviconFile);
      if (cvFile) formPayload.append('cv', cvFile);
      await apiPut(DASHBOARD_ENDPOINTS.settings.update, formPayload);
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Settings updated successfully!',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      setFieldErrors(extractFieldErrors(error));
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error updating settings'
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="h2 text-white-2">Global Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage site identity and CV</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Site Identity */}
        <div className="bg-card border border-border rounded-[20px] p-6 space-y-6" style={{ background: 'var(--bg-gradient-jet)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-5 h-5 text-primary" />
            <h3 className="h3 text-white-2">Site Identity</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-light-gray/70 text-xs uppercase mb-2 block">Company Name</label>
              <input
                type="text"
                value={settings.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                className="form-input"
                placeholder="Enter company name"
              />
              {fieldErrors.company && (
                <p className="mt-1 text-xs text-destructive">{fieldErrors.company}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Logo Upload */}
              <div>
                <label className="text-light-gray/70 text-xs uppercase mb-2 block">Logo</label>
                <div 
                  className={`relative border-2 border-dashed rounded-xl p-4 transition-all flex flex-col items-center justify-center min-h-[160px] ${
                    dragActive.logo ? 'border-primary bg-primary/5' : 'border-border bg-onyx/50'
                  }`}
                  onDragEnter={(e) => handleDragFile(e, 'logo', true)}
                  onDragLeave={(e) => handleDragFile(e, 'logo', false)}
                  onDragOver={(e) => handleDragFile(e, 'logo', true)}
                  onDrop={(e) => handleDropFile(e, 'logo')}
                >
                  {settings.logo ? (
                    <div className="relative group w-full h-full flex items-center justify-center">
                      <img src={settings.logo} alt="Logo" className="max-w-full max-h-24 object-contain rounded-lg" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                        <label className="cursor-pointer p-2 bg-primary rounded-full text-white-1 hover:scale-110 transition-transform">
                          <Upload className="w-4 h-4" />
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload('logo', e.target.files[0])} />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center gap-2 text-center">
                      <Upload className="w-8 h-8 text-muted-foreground" />
                      <div className="text-xs text-muted-foreground">
                        <span className="text-primary font-medium">Click to upload</span> or drag and drop
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload('logo', e.target.files[0])} />
                    </label>
                  )}
                </div>
                {fieldErrors.logo && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrors.logo}</p>
                )}
              </div>
              
              {/* Favicon Upload */}
              <div>
                <label className="text-light-gray/70 text-xs uppercase mb-2 block">Favicon</label>
                <div 
                  className={`relative border-2 border-dashed rounded-xl p-4 transition-all flex flex-col items-center justify-center min-h-[160px] ${
                    dragActive.favicon ? 'border-primary bg-primary/5' : 'border-border bg-onyx/50'
                  }`}
                  onDragEnter={(e) => handleDragFile(e, 'favicon', true)}
                  onDragLeave={(e) => handleDragFile(e, 'favicon', false)}
                  onDragOver={(e) => handleDragFile(e, 'favicon', true)}
                  onDrop={(e) => handleDropFile(e, 'favicon')}
                >
                  {settings.favicon ? (
                    <div className="relative group w-full h-full flex items-center justify-center">
                      <img src={settings.favicon} alt="Favicon" className="w-12 h-12 object-contain rounded-lg" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                        <label className="cursor-pointer p-2 bg-primary rounded-full text-white-1 hover:scale-110 transition-transform">
                          <Upload className="w-4 h-4" />
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload('favicon', e.target.files[0])} />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center gap-2 text-center">
                      <Upload className="w-8 h-8 text-muted-foreground" />
                      <div className="text-xs text-muted-foreground">
                        <span className="text-primary font-medium">Click to upload</span> or drag and drop
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload('favicon', e.target.files[0])} />
                    </label>
                  )}
                </div>
                {fieldErrors.favicon && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrors.favicon}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CV Section */}
        <div className="bg-card border border-border rounded-[20px] p-6 space-y-6" style={{ background: 'var(--bg-gradient-jet)' }}>
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-primary" />
            <h3 className="h3 text-white-2">CV / Resume File</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-8 bg-onyx/50">
              <FileText className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-4 text-center">
                {cvFile ? `Selected: ${cvFile.name}` : settings.cv ? `Current: ${settings.cv.split('/').pop()}` : 'No CV uploaded yet'}
              </p>
              <label className="form-btn !w-auto cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>{settings.cv ? 'Replace CV' : 'Upload CV'}</span>
                <input type="file" className="hidden" accept=".pdf" onChange={handleCvUpload} />
              </label>
              <p className="text-[10px] text-muted-foreground mt-4 uppercase tracking-wider">PDF format only</p>
              {fieldErrors.cv && (
                <p className="mt-1 text-xs text-destructive">{fieldErrors.cv}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsManager;
