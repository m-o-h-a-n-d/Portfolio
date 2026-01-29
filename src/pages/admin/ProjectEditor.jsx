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
    description: '',
    link: '',
    github: '',
    technologies: [],
    team_members: [],
    images: [],
    status: true
  });

  const [imageFiles, setImageFiles] = useState([]);
  const initialCoverRef = useRef('');

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
        const coverValue = project.image_cover || project.image || project.images?.[0] || '';
        const imagesValue = Array.isArray(project.images) ? project.images : (project.image ? [project.image] : []);
        const mergedImages = coverValue
          ? [coverValue, ...imagesValue.filter((img) => img && img !== coverValue)]
          : imagesValue;
        setFormData({
          title: project.title,
          service_id: serviceId,
          description: project.description || project.short_desc || project.desc || project.full_description || '',
          link: project.link || '',
          github: project.github || '',
          technologies: project.technologies || [],
          team_members: project.team_members || [],
          images: mergedImages,
          status: project.status === true || project.status === 1 || project.status === '1'
        });
        initialCoverRef.current = coverValue;
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
        const image = project.image || project.image_cover || '';
        const images = Array.isArray(project.images) && project.images.length > 0
          ? project.images
          : (image ? [image] : []);
        return {
          ...project,
          category: project.category || project.service_name || '',
          description: project.description || project.short_desc || project.desc || '',
          full_description: project.full_description || project.desc || project.description || '',
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

      // Ensure team data is always an array
      const teamData = normalizeList(teamValue, ['teams', 'team']);
      setTeam(teamData);

      // Ensure services data is always an array
      const normalizedServices = normalizeList(servicesValue, ['services', 'service']);
      setServices(normalizedServices);
      setFormData(prev => ({
        ...prev,
        service_id: prev.service_id || normalizedServices[0]?.id || ''
      }));
    } catch (error) {
      console.error('Error fetching data:', error);
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
    const MAX_IMAGES = 6;
    const MAX_SIZE_MB = 2; // 2MB per image
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

    const newFiles = [...imageFiles, ...validFiles];
    setImageFiles(newFiles);
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
    setFormData(prev => {
      const removedImage = prev.images[index];
      if (typeof removedImage === 'string' && removedImage.startsWith('data:')) {
        const dataUrlIndex = prev.images
          .filter(img => typeof img === 'string' && img.startsWith('data:'))
          .indexOf(removedImage);
        if (dataUrlIndex >= 0) {
          setImageFiles(prevFiles => prevFiles.filter((_, i) => i !== dataUrlIndex));
        }
      }
      return {
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      };
    });
  };

  const addTechnology = () => {
    const trimmedTech = techInput.trim().toLowerCase();
    
    if (!trimmedTech) return;

    // Check if it's English only (letters, numbers, and common symbols like . # - +)
    const isEnglish = /^[a-zA-Z0-9.#\-+ ]+$/.test(trimmedTech);
    if (!isEnglish) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Input',
        text: 'Please use English characters only for technologies',
        timer: 2000,
        showConfirmButton: false
      });
      return;
    }

    if (!formData.technologies.map(t => t.toLowerCase()).includes(trimmedTech)) {
      setFormData(prev => ({
        ...prev,
        technologies: [...prev.technologies, trimmedTech]
      }));
      setTechInput('');
    } else {
      Swal.fire({
        icon: 'info',
        title: 'Already Exists',
        text: 'This technology is already added',
        timer: 1500,
        showConfirmButton: false
      });
    }
  };

  const removeTechnology = (index) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter((_, i) => i !== index)
    }));
  };

  const addTeamMember = (e, memberId) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
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
  
  const getTeamMemberTrack = (memberId) => {
    const member = Array.isArray(team) ? team.find(m => m.id === memberId) : null;
    return member?.track || '';
  };



  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.title.trim()) {
      Swal.fire({ icon: 'warning', title: 'Required Field', text: 'Project title is required' });
      return;
    }
    if (!isEditMode && imageFiles.length === 0) {
      Swal.fire({ icon: 'warning', title: 'Required Field', text: 'At least one project image is required' });
      return;
    }
    if (isEditMode && formData.images.length === 0 && imageFiles.length === 0) {
      Swal.fire({ icon: 'warning', title: 'Required Field', text: 'At least one project image is required' });
      return;
    }

    try {
      setSaving(true);
      setFieldErrors({});
      const statusValue = formData.status === true || formData.status === 1;
      const basePayload = {
        title: formData.title,
        short_desc: formData.description || '',
        desc: formData.description || '',
        link: statusValue ? (formData.link || '') : '',
        github: statusValue ? (formData.github || '') : '',
        status: statusValue,
        service_id: formData.service_id ? Number(formData.service_id) : undefined,
        slug: formData.title.toLowerCase().replace(/\s+/g, '-'),
        technologies: formData.technologies,
        teams: formData.team_members
      };

      const orderedImages = Array.isArray(formData.images) ? formData.images : [];
      const dataUrls = orderedImages.filter(img => typeof img === 'string' && img.startsWith('data:'));
      const orderedImageUrls = orderedImages.filter(
        (img) => typeof img === 'string' && !img.startsWith('data:')
      );
      const getFileFromDataUrl = (dataUrl) => {
        const dataUrlIndex = dataUrls.indexOf(dataUrl);
        return dataUrlIndex >= 0 ? imageFiles[dataUrlIndex] : null;
      };

      const projectData = new FormData();
      projectData.append('title', basePayload.title);
      projectData.append('short_desc', basePayload.short_desc);
      projectData.append('desc', basePayload.desc);
      projectData.append('link', basePayload.link);
      projectData.append('github', basePayload.github);
      projectData.append('status', basePayload.status ? '1' : '0');
      // Backend expects service_id
      if (formData.service_id) {
        projectData.append('service_id', String(formData.service_id));
      }
      projectData.append('slug', basePayload.slug);
      basePayload.technologies.forEach((tech) => projectData.append('technologies[]', tech));
      projectData.append('teams_present', '1');
      basePayload.teams.forEach((memberId) => {
        projectData.append('teams[]', String(memberId));
        projectData.append('team_members[]', String(memberId));
      });
      if (isEditMode) {
      // old images urls (strings) -> images[]
      if (orderedImageUrls.length > 0) {
        orderedImageUrls.forEach((url) => projectData.append('images[]', url));
      } else {
        // Keep key present so backend detects removals.
        projectData.append('images[]', ' ');
      }

      // new images files -> images_files[]
      for (const img of orderedImages) {
        if (typeof img === 'string' && img.startsWith('data:')) {
          const file = getFileFromDataUrl(img);
          if (file) projectData.append('images_files[]', file);
        }
      }

        projectData.append('_method', 'PUT');
        await apiPost(DASHBOARD_ENDPOINTS.portfolio.update(id), projectData);
      } else {
        for (const img of orderedImages) {
          if (typeof img === 'string' && img.startsWith('data:')) {
            const file = getFileFromDataUrl(img);
            if (file) projectData.append('images[]', file);
          }
        }
        await apiPost(DASHBOARD_ENDPOINTS.portfolio.store, projectData);
      }
      Swal.fire({ icon: 'success', title: 'Success!', text: `Project ${isEditMode ? 'updated' : 'added'} successfully!`, timer: 2000, showConfirmButton: false });
      setTimeout(() => navigate('/admin/portfolio'), 2000);
    } catch (error) {
      console.error('Error saving project:', error);
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
      {/* Header - Fixed Style like Profile Manager */}
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
        {/* Left Column: Status + Images + Links (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Project Status Toggle */}
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
                {formData.status ? 'Completed' : 'Uncomplete'}
              </span>
              <p className="text-xs text-muted-foreground">
                (This will be shown in project details)
              </p>
            </div>
          </div>

          {/* Images Section - Drag & Drop */}
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
                <p className="text-muted-foreground text-[10px]">Max 6 images, 2MB each</p>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
            {fieldErrors.images && (
              <p className="mt-1 text-xs text-destructive">{fieldErrors.images}</p>
            )}

            {/* Images List with Reorder */}
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 has-scrollbar">
              {formData.images.map((img, index) => (
                <div key={index} className="flex items-center gap-3 p-2 bg-onyx/50 border border-border rounded-xl group">
                  <div className="relative w-12 h-12 flex-shrink-0">
                    <img src={img} alt="" className="w-full h-full object-cover rounded-lg" />
                    {index === 0 && <div className="absolute -top-1 -left-1 bg-primary text-[8px] px-1 rounded text-black font-bold">MAIN</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-light-gray truncate">Image {index + 1}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button type="button" onClick={() => removeImage(index)} className="p-1 hover:text-destructive text-muted-foreground"><X className="w-3 h-3" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Links Section - Conditional Rendering based on Status */}
          {formData.status && (
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
                    className="form-input text-sm py-2"
                    placeholder="https://..."
                  />
                  {fieldErrors.link && (
                    <p className="mt-1 text-xs text-destructive">{fieldErrors.link}</p>
                  )}
                </div>
                <div>
                  <label className="text-light-gray/70 text-[10px] uppercase mb-1 block">GitHub Repository</label>
                  <input
                    type="url"
                    name="github"
                    value={formData.github}
                    onChange={handleInputChange}
                    className="form-input text-sm py-2"
                    placeholder="https://github.com/..."
                  />
                  {fieldErrors.github && (
                    <p className="mt-1 text-xs text-destructive">{fieldErrors.github}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Info + Tech + Team (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Basic Info Card */}
          <div className="bg-card border border-border rounded-[20px] p-6" style={{ background: 'var(--bg-gradient-jet)' }}>
            <div className="flex items-center gap-2 mb-6">
              <Tag className="w-5 h-5 text-primary" />
              <h3 className="h3 text-white-2">Basic Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="text-light-gray/70 text-xs uppercase mb-2 block">Project Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter project name"
                  required
                />
                {fieldErrors.title && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrors.title}</p>
                )}
              </div>
              <div>
                <label className="text-light-gray/70 text-xs uppercase mb-2 block">Category (from Services)</label>
                <select
                  name="service_id"
                  value={formData.service_id}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  {services.length > 0 ? (
                    services.map(service => (
                      <option key={service.id} value={service.id}>{service.title}</option>
                    ))
                  ) : (
                    portfolio?.categories?.filter(c => c !== 'all').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))
                  )}
                </select>
                {(fieldErrors.service_id || fieldErrors.category) && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrors.service_id || fieldErrors.category}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="text-light-gray/70 text-xs uppercase mb-2 block">Project Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="form-input min-h-[200px] resize-y"
                  placeholder="Describe your project, challenges, and solutions..."
                />
                {fieldErrors.description && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrors.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Technologies & Team Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Technologies */}
            <div className="bg-card border border-border rounded-[20px] p-6" style={{ background: 'var(--bg-gradient-jet)' }}>
              <div className="flex items-center gap-2 mb-4">
                <Code className="w-5 h-5 text-primary" />
                <h3 className="h3 text-white-2">Technologies</h3>
              </div>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
                  className="form-input text-sm py-2"
                  placeholder="Add tech..."
                />
                <button type="button" onClick={addTechnology} className="p-2 bg-primary/20 text-primary rounded-xl hover:bg-primary/30 transition-colors">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.technologies.map((tech, index) => (
                  <span key={index} className="px-3 py-1 bg-onyx border border-border rounded-full text-[10px] text-light-gray flex items-center gap-2">
                    {tech}
                    <button type="button" onClick={() => removeTechnology(index)} className="hover:text-destructive"><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
              {fieldErrors.technologies && (
                <p className="mt-2 text-xs text-destructive">{fieldErrors.technologies}</p>
              )}
            </div>

            {/* Team Members */}
            <div className="bg-card border border-border rounded-[20px] p-6" style={{ background: 'var(--bg-gradient-jet)' }}>
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-primary" />
                <h3 className="h3 text-white-2">Team Members</h3>
              </div>
              
              <div className="relative mb-4">
                <Select
                  options={(Array.isArray(team) ? team : [])
                    .filter(member => !formData.team_members.includes(member.id))
                    .map(member => ({
                      value: member.id,
                      label: member.name,
                      track: member.track
                    }))
                  }
                  onChange={(option) => {
                    if (option) {
                      addTeamMember(null, option.value);
                    }
                  }
                  }
                  placeholder="Search and add members..."
                  className="react-select-container"
                  classNamePrefix="react-select"
                  isSearchable
                  formatOptionLabel={(member) => (
                    <div>
                      <div className="text-xs font-medium">{member.label}</div>
                      <div className="text-[10px] opacity-60">{member.track}</div>
                    </div>
                  )}
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      background: 'transparent',
                      borderColor: state.isFocused ? 'hsl(var(--primary))' : 'hsl(var(--jet))',
                      borderRadius: '14px',
                      padding: '5px 10px',
                      boxShadow: 'none',
                      '&:hover': {
                        borderColor: 'hsl(var(--primary))'
                      }
                    }),
                    menu: (base) => ({
                      ...base,
                      background: 'hsl(var(--eerie-black-2))',
                      border: '1px solid hsl(var(--jet))',
                      borderRadius: '14px',
                      zIndex: 50,
                      overflow: 'hidden'
                    }),
                    option: (base, state) => ({
                      ...base,
                      background: state.isFocused ? 'rgba(255, 219, 112, 0.1)' : 'transparent',
                      color: 'var(--white-2)',
                      cursor: 'pointer',
                      '&:active': {
                        background: 'rgba(255, 219, 112, 0.2)'
                      }
                    }),
                    input: (base) => ({
                      ...base,
                      color: 'var(--white-2)'
                    }),
                    singleValue: (base) => ({
                      ...base,
                      color: 'var(--white-2)'
                    }),
                    placeholder: (base) => ({
                      ...base,
                      color: 'hsl(var(--muted-foreground))',
                      fontSize: '14px'
                    })
                  }}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.team_members.map(memberId => (
                  <span key={memberId} className="px-3 py-1 bg-primary/10 border border-primary/30 rounded-full text-[10px] text-primary flex items-center gap-2">
                    {getTeamMemberName(memberId)}
                    <button type="button" onClick={() => removeTeamMember(memberId)} className="hover:text-destructive"><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
              {fieldErrors.team_members && (
                <p className="mt-2 text-xs text-destructive">{fieldErrors.team_members}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectEditor;
