import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiGet, apiPost } from '../../api/request';
import { DASHBOARD_ENDPOINTS } from '../../api/endpoints';
import { 
  ArrowLeft, Plus, X, Save, Upload, Image, ChevronDown, 
  Trash2, Code, Link as LinkIcon, Users, Tag
} from 'lucide-react';
import Select from 'react-select';
import Swal from '../../lib/swal';
import { extractFieldErrors } from '../../lib/validationErrors';

const ProjectEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [portfolio, setPortfolio] = useState(null);
  const [team, setTeam] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [techInput, setTechInput] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    title: '',
    service_id: '',
    short_desc: '',
    description: '',
    link: '',
    github: '',
    technologies: [],
    team_members: [],
    images: [], // This will hold both URLs (strings) and DataURLs (for preview)
    status: true
  });

  // To keep track of actual File objects for new uploads
  const [imageFiles, setImageFiles] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (isEditMode && portfolio) {
      const project = portfolio.projects?.find(p => p.id === parseInt(id));
      if (project) {
        const serviceId =
          project.service_id ||
          services.find(s => s.title === project.category || s.title === project.service_name)?.id ||
          '';
        
        // Normalize images: image_cover should be first if it exists
        const coverValue = project.image_cover || '';
        const imagesValue = Array.isArray(project.images) ? project.images : [];
        
        let mergedImages = [...imagesValue];
        if (coverValue && !mergedImages.includes(coverValue)) {
          mergedImages = [coverValue, ...mergedImages];
        } else if (coverValue && mergedImages.includes(coverValue)) {
          // Move cover to front
          mergedImages = [coverValue, ...mergedImages.filter(img => img !== coverValue)];
        }

        // IMPORTANT: We need to store the relative paths for the backend, 
        // but the full URLs for the preview.
        // However, since the backend returns full URLs via ProjectResource, 
        // we need to be careful when sending them back.
        
        setFormData({
          title: project.title,
          service_id: serviceId,
          short_desc: project.short_desc || '',
          description: project.description || project.short_desc || project.desc || project.full_description || '',
          link: project.link || '',
          github: project.github || '',
          technologies: project.technologies || [],
          team_members: project.team_members || [],
          images: mergedImages,
          status: project.status === true || project.status === 1 || project.status === '1'
        });
      }
    }
  }, [portfolio, id, isEditMode, services]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [portfolioRes, teamRes, servicesRes] = await Promise.allSettled([
        apiGet(DASHBOARD_ENDPOINTS.portfolio.list),
        apiGet(DASHBOARD_ENDPOINTS.team.list),
        apiGet(DASHBOARD_ENDPOINTS.services.list)
      ]);
      const getValue = (res) => (res?.status === 'fulfilled' ? res.value : null);
      const portfolioValue = getValue(portfolioRes);
      const teamValue = getValue(teamRes);
      const servicesValue = getValue(servicesRes);
      
      const normalizeProject = (project) => {
        const image = project.image_cover || project.image || '';
        const images = Array.isArray(project.images) ? project.images : (image ? [image] : []);
        return {
          ...project,
          category: project.category || project.service_name || '',
          description: project.description || project.short_desc || project.desc || '',
          full_description: project.full_description || project.desc || project.description || '',
          short_desc: project.short_desc || project.description || project.desc || '',
          image,
          images
        };
      };

      const portfolioData = portfolioValue?.data || portfolioValue || {};
      const projects = Array.isArray(portfolioData.projects)
        ? portfolioData.projects
        : Array.isArray(portfolioData.portfolios)
          ? portfolioData.portfolios
          : (Array.isArray(portfolioData) ? portfolioData : []);
      
      const normalizedPortfolio = {
        ...portfolioData,
        projects: projects.map(normalizeProject)
      };
      setPortfolio(normalizedPortfolio);

      const normalizeList = (res, keys = []) => {
        if (!res) return [];
        if (Array.isArray(res)) return res;
        if (Array.isArray(res?.data)) return res.data;
        if (Array.isArray(res?.data?.data)) return res.data.data;
        if (Array.isArray(res?.data?.items)) return res.data.items;
        for (const key of keys) {
          if (Array.isArray(res?.data?.[key])) return res.data[key];
        }
        return [];
      };

      const teamData = normalizeList(teamValue, ['teams', 'team']);
      setTeam(teamData);

      const normalizedServices = normalizeList(servicesRes?.status === 'fulfilled' ? servicesRes.value : null, ['services', 'service']);
      setServices(normalizedServices);
      
      if (!isEditMode && normalizedServices.length > 0) {
        setFormData(prev => ({
          ...prev,
          service_id: normalizedServices[0]?.id || ''
        }));
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error loading data',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length > 0) processImages(imageFiles);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    processImages(files);
  };

  const processImages = (files) => {
    const MAX_IMAGES = 10;
    const MAX_SIZE_MB = 2;
    const currentImagesCount = formData.images.length;
    
    if (currentImagesCount + files.length > MAX_IMAGES) {
      Swal.fire({
        icon: 'warning',
        title: 'Limit Exceeded',
        text: `You can only upload up to ${MAX_IMAGES} images.`,
      });
      return;
    }

    const validFiles = [];
    for (const file of files) {
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        Swal.fire({
          icon: 'error',
          title: 'File Too Large',
          text: `Image "${file.name}" exceeds the ${MAX_SIZE_MB}MB limit.`,
        });
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // Add new files to our tracking state
    setImageFiles(prev => [...prev, ...validFiles]);

    // Create previews
    const readers = validFiles.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then(dataUrls => {
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...dataUrls]
      }));
    });
  };

  const removeImage = (index) => {
    const imageToRemove = formData.images[index];
    
    // If it's a new image (data:), we need to remove it from imageFiles too
    if (typeof imageToRemove === 'string' && imageToRemove.startsWith('data:')) {
      // Find the index of this specific dataUrl among all dataUrls in the current images array
      let dataUrlCounter = 0;
      let targetFileIndex = -1;
      
      for (let i = 0; i < formData.images.length; i++) {
        if (typeof formData.images[i] === 'string' && formData.images[i].startsWith('data:')) {
          if (i === index) {
            targetFileIndex = dataUrlCounter;
            break;
          }
          dataUrlCounter++;
        }
      }

      if (targetFileIndex !== -1) {
        setImageFiles(prev => prev.filter((_, i) => i !== targetFileIndex));
      }
    }

    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const addTechnology = () => {
    const trimmedTech = techInput.trim();
    if (!trimmedTech) return;

    if (!formData.technologies.includes(trimmedTech)) {
      setFormData(prev => ({
        ...prev,
        technologies: [...prev.technologies, trimmedTech]
      }));
      setTechInput('');
    }
  };

  const removeTechnology = (index) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter((_, i) => i !== index)
    }));
  };

  const addTeamMember = (memberId) => {
    if (!formData.team_members.includes(memberId)) {
      setFormData(prev => ({
        ...prev,
        team_members: [...prev.team_members, memberId]
      }));
    }
  };

  const removeTeamMember = (memberId) => {
    setFormData(prev => ({
      ...prev,
      team_members: prev.team_members.filter(id => id !== memberId)
    }));
  };

  const getTeamMemberName = (memberId) => {
    const member = Array.isArray(team) ? team.find(m => m.id === memberId) : null;
    return member?.name || 'Unknown';
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (!formData.title.trim()) {
      Swal.fire({ icon: 'warning', title: 'Required Field', text: 'Project title is required' });
      return;
    }
    
    if (formData.images.length === 0) {
      Swal.fire({ icon: 'warning', title: 'Required Field', text: 'At least one project image is required' });
      return;
    }

    try {
      setSaving(true);
      setFieldErrors({});
      
      const projectData = new FormData();
      projectData.append('title', formData.title);
      projectData.append('short_desc', formData.short_desc || '');
      projectData.append('desc', formData.description || '');
      projectData.append('link', formData.link || '');
      projectData.append('github', formData.github || '');
      projectData.append('status', formData.status ? '1' : '0');
      projectData.append('service_id', String(formData.service_id));
      
      formData.technologies.forEach(tech => projectData.append('technologies[]', tech));
      formData.team_members.forEach(id => projectData.append('teams[]', String(id)));

      // Separate existing URLs and new DataURLs
      const existingImageUrls = formData.images.filter(img => typeof img === 'string' && !img.startsWith('data:'));
      
      // 1. Send existing images that are still kept
      // We need to strip the BASE_URL or domain if the backend expects relative paths
      if (existingImageUrls.length > 0) {
        existingImageUrls.forEach(url => {
          // If the URL is a full URL, try to extract the relative path
          let relativePath = url;
          if (url.includes('/uploads/')) {
            relativePath = 'uploads/' + url.split('/uploads/')[1];
          }
          projectData.append('images[]', relativePath);
        });
      } else if (isEditMode) {
        // If all old images removed, send empty to let backend know
        projectData.append('images[]', '');
      }

      // 2. Send new image files
      // The imageFiles array corresponds exactly to the dataUrls in formData.images
      imageFiles.forEach(file => {
        projectData.append('images_files[]', file);
      });

      if (isEditMode) {
        projectData.append('_method', 'PUT');
        await apiPost(DASHBOARD_ENDPOINTS.portfolio.update(id), projectData);
      } else {
        // For store, we can just use images[] for everything if backend supports it, 
        // but let's stick to what works.
        imageFiles.forEach(file => projectData.append('images[]', file));
        await apiPost(DASHBOARD_ENDPOINTS.portfolio.store, projectData);
      }

      Swal.fire({ 
        icon: 'success', 
        title: 'Success!', 
        text: `Project ${isEditMode ? 'updated' : 'added'} successfully!`, 
        timer: 2000, 
        showConfirmButton: false 
      });
      setTimeout(() => navigate('/admin/portfolio'), 2000);
    } catch (error) {
      setFieldErrors(extractFieldErrors(error));
      Swal.fire({ icon: 'error', title: 'Error', text: 'Error saving project' });
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
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/portfolio')}
            className="p-2 rounded-lg bg-onyx border border-border text-primary hover:bg-primary/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="h2 text-white-2">{isEditMode ? 'Edit Project' : 'Add New Project'}</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {isEditMode ? `Updating: ${formData.title}` : 'Create a professional showcase for your work'}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/portfolio')}
            className="px-6 py-2 rounded-xl bg-onyx border border-border text-light-gray hover:bg-onyx/80 transition-colors font-medium hidden md:block"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="form-btn !w-auto !px-8"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? 'Saving...' : 'Save Project'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Status + Images + Links */}
        <div className="lg:col-span-4 space-y-6">
          {/* Project Status */}
          <div className="bg-card border border-border rounded-[20px] p-6" style={{ background: 'var(--bg-gradient-jet)' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-primary" />
                <h3 className="h3 text-white-2">Project Status</h3>
              </div>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, status: !prev.status }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  formData.status ? 'bg-primary' : 'bg-onyx border border-border'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.status ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${formData.status ? 'text-primary' : 'text-vegas-gold'}`}>
                {formData.status ? 'Completed' : 'In Progress'}
              </span>
            </div>
          </div>

          {/* Images Section */}
          <div className="bg-card border border-border rounded-[20px] p-6" style={{ background: 'var(--bg-gradient-jet)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Image className="w-5 h-5 text-primary" />
              <h3 className="h3 text-white-2">Project Images</h3>
            </div>
            
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-all mb-4 ${
                dragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
              }`}
            >
              <label className="cursor-pointer block">
                <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                <p className="text-light-gray text-xs mb-1">Drag & Drop or Click</p>
                <p className="text-muted-foreground text-[10px]">Max 10 images, 2MB each</p>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
              </label>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 has-scrollbar">
              {formData.images.map((img, index) => (
                <div key={index} className="flex items-center gap-3 p-2 bg-onyx/50 border border-border rounded-xl group">
                  <div className="relative w-12 h-12 flex-shrink-0">
                    <img src={img} alt="" className="w-full h-full object-cover rounded-lg" />
                    {index === 0 && (
                      <div className="absolute -top-1 -left-1 bg-primary text-[8px] px-1 rounded text-black font-bold">
                        COVER
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-light-gray truncate">
                      {index === 0 ? 'Main Cover Image' : `Gallery Image ${index}`}
                    </p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      type="button" 
                      onClick={() => removeImage(index)} 
                      className="p-1 hover:text-destructive text-muted-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Links Section */}
          <div className="bg-card border border-border rounded-[20px] p-6 space-y-4" style={{ background: 'var(--bg-gradient-jet)' }}>
            <div className="flex items-center gap-2 mb-2">
              <LinkIcon className="w-5 h-5 text-primary" />
              <h3 className="h3 text-white-2">Project Links</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-light-gray/70 text-[10px] uppercase mb-1 block">Live Project URL</label>
                <input
                  type="url"
                  name="link"
                  value={formData.link}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                  className="form-input"
                />
              </div>
              <div>
                <label className="text-light-gray/70 text-[10px] uppercase mb-1 block">GitHub Repository</label>
                <input
                  type="url"
                  name="github"
                  value={formData.github}
                  onChange={handleInputChange}
                  placeholder="https://github.com/username/repo"
                  className="form-input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Details + Tech + Team */}
        <div className="lg:col-span-8 space-y-6">
          {/* Basic Info */}
          <div className="bg-card border border-border rounded-[20px] p-8" style={{ background: 'var(--bg-gradient-jet)' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <label className="text-light-gray/70 text-[10px] uppercase font-bold tracking-wider">Project Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter project title"
                  className={`form-input ${fieldErrors.title ? 'border-destructive' : ''}`}
                />
                {fieldErrors.title && <p className="text-xs text-destructive">{fieldErrors.title}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-light-gray/70 text-[10px] uppercase font-bold tracking-wider">Service Category</label>
                <select
                  name="service_id"
                  value={formData.service_id}
                  onChange={handleInputChange}
                  className="form-input appearance-none"
                >
                  {services.map(service => (
                    <option key={service.id} value={service.id}>{service.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-light-gray/70 text-[10px] uppercase font-bold tracking-wider">Short Description</label>
              <textarea
                name="short_desc"
                value={formData.short_desc}
                onChange={handleInputChange}
                placeholder="Short summary for cards/listing..."
                rows={3}
                className="form-input resize-none"
              />
            </div>

            <div className="space-y-2 mt-6">
              <label className="text-light-gray/70 text-[10px] uppercase font-bold tracking-wider">Project Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your project..."
                rows={6}
                className="form-input resize-none"
              />
            </div>
          </div>

          {/* Technologies */}
          <div className="bg-card border border-border rounded-[20px] p-8" style={{ background: 'var(--bg-gradient-jet)' }}>
            <div className="flex items-center gap-2 mb-6">
              <Code className="w-5 h-5 text-primary" />
              <h3 className="h3 text-white-2">Technologies Used</h3>
            </div>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
                placeholder="Add technology (e.g. React, Node.js)"
                className="form-input"
              />
              <button
                type="button"
                onClick={addTechnology}
                className="p-3 rounded-xl bg-primary text-black hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.technologies.map((tech, index) => (
                <span key={index} className="flex items-center gap-2 px-3 py-1.5 bg-onyx border border-border rounded-lg text-sm text-light-gray">
                  {tech}
                  <button type="button" onClick={() => removeTechnology(index)} className="hover:text-destructive">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Team Members */}
          <div className="bg-card border border-border rounded-[20px] p-8" style={{ background: 'var(--bg-gradient-jet)' }}>
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="h3 text-white-2">Team Members</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <label className="text-light-gray/70 text-[10px] uppercase">Select Member</label>
                <Select
                  classNamePrefix="react-select"
                  isSearchable
                  value={null}
                  onChange={(option) => option?.value && addTeamMember(option.value)}
                  options={(Array.isArray(team) ? team : [])
                    .filter(m => !formData.team_members.includes(m.id))
                    .map(member => ({ value: member.id, label: member.name }))}
                  placeholder="Choose a member..."
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      backgroundColor: 'var(--bg-jet)',
                      borderColor: state.isFocused ? 'var(--primary)' : 'var(--border)',
                      boxShadow: state.isFocused
                        ? '0 0 0 1px var(--primary), 0 8px 20px rgba(0, 0, 0, 0.35)'
                        : '0 6px 16px rgba(0, 0, 0, 0.25)',
                      borderRadius: '14px',
                      minHeight: '44px',
                      color: 'var(--text-white-2)',
                      paddingLeft: '6px',
                      transition: 'all 150ms ease'
                    }),
                    valueContainer: (base) => ({
                      ...base,
                      padding: '6px 8px'
                    }),
                    menu: (base) => ({
                      ...base,
                      backgroundColor: 'var(--bg-onyx)',
                      border: '1px solid var(--border)',
                      borderRadius: '14px',
                      boxShadow: '0 18px 40px rgba(0, 0, 0, 0.45)',
                      zIndex: 20
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isSelected
                        ? 'rgba(255, 214, 102, 0.2)'
                        : state.isFocused
                        ? 'rgba(255, 214, 102, 0.12)'
                        : 'transparent',
                      color: 'var(--text-white-2)',
                      cursor: 'pointer',
                      padding: '10px 12px'
                    }),
                    menuList: (base) => ({
                      ...base,
                      padding: '6px'
                    }),
                    singleValue: (base) => ({
                      ...base,
                      color: 'var(--text-white-2)'
                    }),
                    placeholder: (base) => ({
                      ...base,
                      color: 'var(--text-muted-foreground)'
                    }),
                    input: (base) => ({
                      ...base,
                      color: 'var(--text-white-2)'
                    }),
                    indicatorSeparator: () => ({ display: 'none' }),
                    dropdownIndicator: (base) => ({
                      ...base,
                      color: 'var(--text-muted-foreground)',
                      transition: 'transform 150ms ease'
                    }),
                    indicatorsContainer: (base, state) => ({
                      ...base,
                      transform: state.isFocused ? 'rotate(180deg)' : 'rotate(0deg)'
                    })
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {formData.team_members.map(memberId => (
                <div key={memberId} className="flex items-center justify-between p-3 bg-onyx border border-border rounded-xl">
                  <span className="text-sm text-light-gray">{getTeamMemberName(memberId)}</span>
                  <button type="button" onClick={() => removeTeamMember(memberId)} className="text-muted-foreground hover:text-destructive">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectEditor;
