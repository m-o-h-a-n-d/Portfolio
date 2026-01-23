import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiGet, apiPost, apiPut } from '../../api/request';
import { API_PORTFOLIO_CREATE, API_PORTFOLIO_UPDATE } from '../../api/endpoints';
import { 
  ArrowLeft, Plus, X, Save, Upload, Image, ChevronDown, 
  Trash2, Code, Link as LinkIcon, Users, Tag, GripVertical
} from 'lucide-react';
import Select from 'react-select';
import Swal from '../../lib/swal';

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

  const [formData, setFormData] = useState({
    title: '',
    category: 'Backend Development',
    description: '',
    link: '',
    github: '',
    technologies: [],
    team_members: [],
    images: [],
    status: 1
  });

  const [imageFiles, setImageFiles] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (isEditMode && portfolio) {
      const project = portfolio.projects.find(p => p.id === parseInt(id));
      if (project) {
        setFormData({
          title: project.title,
          category: project.category,
          description: project.description || project.full_description,
          link: project.link || '',
          github: project.github || '',
          technologies: project.technologies || [],
          team_members: project.team_members || [],
          images: project.images || [project.image],
          status: project.status !== undefined ? project.status : 1
        });
      }
    }
  }, [portfolio, id, isEditMode]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [portfolioRes, teamRes, servicesRes] = await Promise.all([
        apiGet('/portfolio'),
        apiGet('/team'),
        apiGet('/services')
      ]);
      setPortfolio(portfolioRes.data);
      
      // Ensure team data is always an array
      const teamData = teamRes.data.team || teamRes.data;
      setTeam(Array.isArray(teamData) ? teamData : []);

      // Ensure services data is always an array
      const servicesData = servicesRes.data.services || servicesRes.data;
      setServices(Array.isArray(servicesData) ? servicesData : []);
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
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const moveImage = (index, direction) => {
    const newImages = [...formData.images];
    if (direction === 'up' && index > 0) {
      [newImages[index], newImages[index - 1]] = [newImages[index - 1], newImages[index]];
    } else if (direction === 'down' && index < newImages.length - 1) {
      [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
    }
    setFormData(prev => ({ ...prev, images: newImages }));
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
    if (formData.images.length === 0) {
      Swal.fire({ icon: 'warning', title: 'Required Field', text: 'At least one project image is required' });
      return;
    }

    try {
      setSaving(true);
      const projectData = {
        ...formData,
        // If status is 0 (Uncomplete), clear the links before sending to backend
        link: formData.status === 1 ? formData.link : '',
        github: formData.status === 1 ? formData.github : '',
        full_description: formData.description,
        slug: formData.title.toLowerCase().replace(/\s+/g, '-'),
        image: formData.images[0]
      };
      
      if (isEditMode) {
        await apiPut(API_PORTFOLIO_UPDATE(id), projectData);
      } else {
        await apiPost(API_PORTFOLIO_CREATE, projectData);
      }
      Swal.fire({ icon: 'success', title: 'Success!', text: `Project ${isEditMode ? 'updated' : 'added'} successfully!`, timer: 2000, showConfirmButton: false });
      setTimeout(() => navigate('/admin/portfolio'), 2000);
    } catch (error) {
      console.error('Error saving project:', error);
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
                onClick={() => setFormData(prev => ({ ...prev, status: prev.status === 1 ? 0 : 1 }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  formData.status === 1 ? 'bg-primary' : 'bg-onyx border border-border'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.status === 1 ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${formData.status === 1 ? 'text-primary' : 'text-vegas-gold'}`}>
                {formData.status === 1 ? 'Completed' : 'Uncomplete'}
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
                    <button type="button" onClick={() => moveImage(index, 'up')} className="p-1 hover:text-primary text-muted-foreground">↑</button>
                    <button type="button" onClick={() => moveImage(index, 'down')} className="p-1 hover:text-primary text-muted-foreground">↓</button>
                    <button type="button" onClick={() => removeImage(index)} className="p-1 hover:text-destructive text-muted-foreground"><X className="w-3 h-3" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Links Section - Conditional Rendering based on Status */}
          {formData.status === 1 && (
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
              </div>
              <div>
                <label className="text-light-gray/70 text-xs uppercase mb-2 block">Category (from Services)</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  {services.length > 0 ? (
                    services.map(service => (
                      <option key={service.id} value={service.title}>{service.title}</option>
                    ))
                  ) : (
                    portfolio?.categories?.filter(c => c !== 'all').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))
                  )}
                </select>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectEditor;
