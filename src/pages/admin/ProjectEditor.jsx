import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiGet, apiPost } from '../../api/request';
import { 
  ArrowLeft, Plus, X, Save, Upload, Image, Search, ChevronDown, 
  Trash2, Code, Link as LinkIcon, Users, Tag, GripVertical
} from 'lucide-react';
import Swal from '../../lib/swal';

const ProjectEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [portfolio, setPortfolio] = useState(null);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [teamSearchOpen, setTeamSearchOpen] = useState(false);
  const [teamSearchQuery, setTeamSearchQuery] = useState('');
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
    images: []
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
          images: project.images || [project.image]
        });
      }
    }
  }, [portfolio, id, isEditMode]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [portfolioRes, teamRes] = await Promise.all([
        apiGet('/portfolio'),
        apiGet('/team')
      ]);
      setPortfolio(portfolioRes.data);
      setTeam(teamRes.data);
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

  // Drag and Drop Handlers
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
    
    if (imageFiles.length > 0) {
      processImages(imageFiles);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    processImages(files);
  };

  const processImages = (files) => {
    const newFiles = [...imageFiles, ...files];
    setImageFiles(newFiles);

    const readers = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result);
        };
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
    if (techInput.trim() && !formData.technologies.includes(techInput.trim())) {
      setFormData(prev => ({
        ...prev,
        technologies: [...prev.technologies, techInput.trim()]
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
    setTeamSearchOpen(false);
    setTeamSearchQuery('');
  };

  const removeTeamMember = (memberId) => {
    setFormData(prev => ({
      ...prev,
      team_members: prev.team_members.filter(id => id !== memberId)
    }));
  };

  const getTeamMemberName = (memberId) => {
    return team?.team?.find(m => m.id === memberId)?.name || 'Unknown';
  };

  const getTeamMemberTrack = (memberId) => {
    return team?.team?.find(m => m.id === memberId)?.track || '';
  };

  const filteredTeamMembers = team?.team?.filter(member =>
    member.name.toLowerCase().includes(teamSearchQuery.toLowerCase()) &&
    !formData.team_members.includes(member.id)
  ) || [];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Required Field',
        text: 'Project title is required',
      });
      return;
    }

    if (formData.images.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Required Field',
        text: 'At least one project image is required',
      });
      return;
    }

    try {
      setSaving(true);
      const projectData = {
        ...formData,
        full_description: formData.description,
        id: isEditMode ? parseInt(id) : Date.now(),
        slug: formData.title.toLowerCase().replace(/\s+/g, '-'),
        image: formData.images[0]
      };

      await apiPost('/portfolio', projectData);

      if (isEditMode) {
        setPortfolio(prev => ({
          ...prev,
          projects: prev.projects.map(p => 
            p.id === parseInt(id) ? projectData : p
          )
        }));
      } else {
        setPortfolio(prev => ({
          ...prev,
          projects: [...(prev.projects || []), projectData]
        }));
      }

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: `Project ${isEditMode ? 'updated' : 'added'} successfully!`,
        timer: 2000,
        showConfirmButton: false,
      });

      setTimeout(() => {
        navigate('/admin/portfolio');
      }, 2000);
    } catch (error) {
      console.error('Error saving project:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error saving project',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-onyx via-black to-onyx flex flex-col">
      {/* Fixed Header with Actions */}
      <div className="sticky top-0 z-50 bg-onyx/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/portfolio')}
              className="p-2 rounded-lg hover:bg-primary/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-primary" />
            </button>
            <div>
              <h1 className="h3 text-white-2 !mb-0">
                {isEditMode ? 'Edit Project' : 'Create New Project'}
              </h1>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/admin/portfolio')}
              className="px-6 py-2 rounded-lg bg-onyx border border-border text-light-gray hover:bg-onyx/80 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-6 py-2 form-btn !w-auto flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {isEditMode ? 'Update' : 'Create'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Split Layout */}
      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 h-full max-w-7xl mx-auto w-full">
          {/* Left Side - Images */}
          <div className="border-r border-border overflow-y-auto p-6 space-y-6">
            <div>
              <h2 className="h3 mb-4 flex items-center gap-2">
                <Image className="w-5 h-5 text-primary" />
                Project Images
              </h2>

              {/* Drag and Drop Area */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  dragActive
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {formData.images.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-light-gray text-sm">Drag to reorder or drop new images</p>
                    <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors cursor-pointer">
                      <Plus className="w-4 h-4" />
                      <span>Add More</span>
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                    </label>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-light-gray mb-2">Drop images here or click to upload</p>
                    <p className="text-muted-foreground text-sm">PNG, JPG, WebP up to 10MB</p>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                  </label>
                )}
              </div>

              {/* Images List */}
              {formData.images.length > 0 && (
                <div className="space-y-3 mt-6">
                  {formData.images.map((img, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-onyx border border-border rounded-lg hover:border-primary/50 transition-colors group"
                    >
                      <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      <img src={img} alt={`Preview ${index + 1}`} className="w-12 h-12 object-cover rounded" />
                      <div className="flex-1">
                        <p className="text-sm text-light-gray">Image {index + 1}</p>
                        {index === 0 && <p className="text-xs text-primary">Main Image</p>}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => moveImage(index, 'up')}
                            className="p-1 hover:bg-primary/20 rounded text-muted-foreground hover:text-primary transition-colors"
                            title="Move up"
                          >
                            ↑
                          </button>
                        )}
                        {index < formData.images.length - 1 && (
                          <button
                            type="button"
                            onClick={() => moveImage(index, 'down')}
                            className="p-1 hover:bg-primary/20 rounded text-muted-foreground hover:text-primary transition-colors"
                            title="Move down"
                          >
                            ↓
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="p-1 hover:bg-destructive/20 rounded text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="overflow-y-auto p-6 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="h4 mb-4 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-primary" />
                  Basic Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-light-gray/70 text-xs uppercase mb-2 block font-medium">Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Project title"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-light-gray/70 text-xs uppercase mb-2 block font-medium">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="form-input"
                    >
                      {portfolio?.categories?.filter(c => c !== 'all').map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="h4 mb-4">Description</h3>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="form-input min-h-[120px] resize-y"
                  placeholder="Describe your project in detail..."
                />
              </div>

              {/* Links */}
              <div>
                <h3 className="h4 mb-4 flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-primary" />
                  Links
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-light-gray/70 text-xs uppercase mb-2 block font-medium">Live Project</label>
                    <input
                      type="url"
                      name="link"
                      value={formData.link}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="text-light-gray/70 text-xs uppercase mb-2 block font-medium">GitHub</label>
                    <input
                      type="url"
                      name="github"
                      value={formData.github}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="https://github.com/..."
                    />
                  </div>
                </div>
              </div>

              {/* Technologies */}
              <div>
                <h3 className="h4 mb-4 flex items-center gap-2">
                  <Code className="w-4 h-4 text-primary" />
                  Technologies
                </h3>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
                    className="form-input flex-1"
                    placeholder="Add technology..."
                  />
                  <button
                    type="button"
                    onClick={addTechnology}
                    className="form-btn !w-auto !px-4"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {formData.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.technologies.map((tech, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-onyx border border-border rounded-full text-xs text-light-gray flex items-center gap-2 hover:border-primary transition-colors"
                      >
                        {tech}
                        <button
                          type="button"
                          onClick={() => removeTechnology(index)}
                          className="hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Team Members */}
              <div>
                <h3 className="h4 mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Team Members
                </h3>

                {formData.team_members.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {formData.team_members.map((memberId) => (
                      <span
                        key={memberId}
                        className="px-3 py-1 bg-primary/20 border border-primary rounded-full text-xs text-primary flex items-center gap-2"
                      >
                        {getTeamMemberName(memberId)}
                        <button
                          type="button"
                          onClick={() => removeTeamMember(memberId)}
                          className="hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setTeamSearchOpen(!teamSearchOpen)}
                    className="form-input flex items-center justify-between w-full"
                  >
                    <span className="text-muted-foreground text-sm">
                      {filteredTeamMembers.length > 0 ? 'Add team members...' : 'No more members'}
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${teamSearchOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {teamSearchOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-onyx border border-border rounded-lg z-20 shadow-xl">
                      <input
                        type="text"
                        placeholder="Search..."
                        value={teamSearchQuery}
                        onChange={(e) => setTeamSearchQuery(e.target.value)}
                        className="form-input !border-0 !rounded-t-lg !rounded-b-none !mb-0"
                        autoFocus
                      />
                      <div className="max-h-48 overflow-y-auto">
                        {filteredTeamMembers.length > 0 ? (
                          filteredTeamMembers.map((member) => (
                            <button
                              key={member.id}
                              type="button"
                              onClick={() => addTeamMember(member.id)}
                              className="w-full text-left px-4 py-2 hover:bg-primary/20 transition-colors border-b border-border last:border-b-0"
                            >
                              <div className="text-sm font-medium text-white-2">{member.name}</div>
                              <div className="text-xs text-light-gray/60">{member.track}</div>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-center text-xs text-muted-foreground">
                            No members found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectEditor;
