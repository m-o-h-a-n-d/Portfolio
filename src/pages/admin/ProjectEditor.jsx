import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiGet, apiPost } from '../../api/request';
import { 
  ArrowLeft, Plus, X, Save, Upload, Image, Search, ChevronDown, 
  Trash2, Eye, EyeOff, Code, Link as LinkIcon, Users, Tag
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
  const [previewMode, setPreviewMode] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Backend Development',
    description: '',
    full_description: '',
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
          description: project.description,
          full_description: project.full_description || project.description,
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

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
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
    <div className="min-h-screen bg-gradient-to-br from-onyx via-black to-onyx">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-onyx/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/portfolio')}
              className="p-2 rounded-lg hover:bg-primary/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-primary" />
            </button>
            <div>
              <h1 className="h2 text-white-2 !mb-0">
                {isEditMode ? 'Edit Project' : 'Create New Project'}
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                {isEditMode ? 'Update your project details' : 'Add a new project to your portfolio'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
          >
            {previewMode ? (
              <>
                <EyeOff className="w-4 h-4" />
                Edit
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Preview
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {previewMode ? (
          // Preview Mode
          <div className="space-y-8">
            {/* Images Preview */}
            {formData.images.length > 0 && (
              <div className="rounded-2xl overflow-hidden border border-border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-onyx">
                  {formData.images.map((img, index) => (
                    <div key={index} className="relative rounded-lg overflow-hidden h-48">
                      <img src={img} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                      {index === 0 && (
                        <div className="absolute top-2 left-2 bg-primary text-black text-xs px-2 py-1 rounded">
                          Main Image
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Preview Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h2 className="h2 text-white-2 mb-2">{formData.title}</h2>
                  <p className="text-vegas-gold text-sm capitalize">{formData.category}</p>
                </div>

                <div>
                  <h3 className="h3 mb-3">Description</h3>
                  <p className="text-light-gray leading-relaxed">{formData.description}</p>
                </div>

                <div>
                  <h3 className="h3 mb-3">Full Description</h3>
                  <p className="text-light-gray leading-relaxed">{formData.full_description}</p>
                </div>

                {formData.technologies.length > 0 && (
                  <div>
                    <h3 className="h3 mb-3 flex items-center gap-2">
                      <Code className="w-5 h-5 text-primary" />
                      Technologies
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {formData.technologies.map((tech, index) => (
                        <span key={index} className="px-3 py-1 bg-onyx border border-border rounded-full text-xs text-light-gray">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {formData.team_members.length > 0 && (
                  <div>
                    <h3 className="h3 mb-3 flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      Team Members
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {formData.team_members.map((memberId) => (
                        <div key={memberId} className="p-4 bg-onyx border border-border rounded-lg">
                          <p className="text-white-2 font-medium">{getTeamMemberName(memberId)}</p>
                          <p className="text-orange-yellow text-sm">{getTeamMemberTrack(memberId)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {formData.link && (
                  <a
                    href={formData.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="form-btn flex items-center justify-center gap-2 w-full"
                  >
                    <LinkIcon className="w-5 h-5" />
                    Live Project
                  </a>
                )}
                {formData.github && (
                  <a
                    href={formData.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="form-btn !bg-transparent border border-border hover:!bg-onyx flex items-center justify-center gap-2 w-full"
                  >
                    <Code className="w-5 h-5" />
                    View Code
                  </a>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Edit Mode
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Images Section */}
            <div className="bg-card border border-border rounded-2xl p-8">
              <h3 className="h3 mb-6 flex items-center gap-2">
                <Image className="w-5 h-5 text-primary" />
                Project Images
              </h3>

              {formData.images.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {formData.images.map((img, index) => (
                      <div key={index} className="relative group">
                        <img src={img} alt={`Preview ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="p-2 bg-destructive rounded-lg text-white-1 hover:bg-destructive/80"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        {index === 0 && (
                          <div className="absolute bottom-1 left-1 bg-primary text-black text-xs px-2 py-0.5 rounded font-medium">
                            Main
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors cursor-pointer">
                    <Plus className="w-4 h-4" />
                    <span>Add More Images</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>
              ) : (
                <label className="border-2 border-dashed border-border rounded-xl p-12 text-center cursor-pointer hover:border-primary/50 transition-colors">
                  <Image className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-light-gray mb-2">Click to upload project images</p>
                  <p className="text-muted-foreground text-sm">or drag and drop</p>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                </label>
              )}
            </div>

            {/* Basic Info Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-card border border-border rounded-2xl p-8">
                <h3 className="h3 mb-6 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-primary" />
                  Basic Information
                </h3>

                <div className="space-y-4">
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

              <div className="bg-card border border-border rounded-2xl p-8">
                <h3 className="h3 mb-6 flex items-center gap-2">
                  <LinkIcon className="w-5 h-5 text-primary" />
                  Project Links
                </h3>

                <div className="space-y-4">
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
                    <label className="text-light-gray/70 text-xs uppercase mb-2 block font-medium">GitHub Repository</label>
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
            </div>

            {/* Descriptions Section */}
            <div className="bg-card border border-border rounded-2xl p-8">
              <h3 className="h3 mb-6">Descriptions</h3>

              <div className="space-y-4">
                <div>
                  <label className="text-light-gray/70 text-xs uppercase mb-2 block font-medium">Short Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="form-input min-h-[100px] resize-y"
                    placeholder="Brief description of the project"
                  />
                </div>

                <div>
                  <label className="text-light-gray/70 text-xs uppercase mb-2 block font-medium">Full Description</label>
                  <textarea
                    name="full_description"
                    value={formData.full_description}
                    onChange={handleInputChange}
                    className="form-input min-h-[150px] resize-y"
                    placeholder="Detailed description of the project"
                  />
                </div>
              </div>
            </div>

            {/* Technologies Section */}
            <div className="bg-card border border-border rounded-2xl p-8">
              <h3 className="h3 mb-6 flex items-center gap-2">
                <Code className="w-5 h-5 text-primary" />
                Technologies Used
              </h3>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
                    className="form-input flex-1"
                    placeholder="Enter technology name"
                  />
                  <button
                    type="button"
                    onClick={addTechnology}
                    className="form-btn !w-auto !px-6"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {formData.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.technologies.map((tech, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-onyx border border-border rounded-full text-sm text-light-gray flex items-center gap-2 hover:border-primary transition-colors"
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
            </div>

            {/* Team Members Section */}
            <div className="bg-card border border-border rounded-2xl p-8">
              <h3 className="h3 mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Team Members
              </h3>

              {formData.team_members.length > 0 && (
                <div className="mb-6 flex flex-wrap gap-2">
                  {formData.team_members.map((memberId) => (
                    <span
                      key={memberId}
                      className="px-3 py-1.5 bg-primary/20 border border-primary rounded-full text-sm text-primary flex items-center gap-2"
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
                  <span className="text-muted-foreground">
                    {filteredTeamMembers.length > 0 ? 'Search and add team members...' : 'No more members available'}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${teamSearchOpen ? 'rotate-180' : ''}`} />
                </button>

                {teamSearchOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-onyx border border-border rounded-lg z-20 shadow-xl">
                    <input
                      type="text"
                      placeholder="Search team member..."
                      value={teamSearchQuery}
                      onChange={(e) => setTeamSearchQuery(e.target.value)}
                      className="form-input !border-0 !rounded-t-lg !rounded-b-none !mb-0"
                      autoFocus
                    />
                    <div className="max-h-64 overflow-y-auto">
                      {filteredTeamMembers.length > 0 ? (
                        filteredTeamMembers.map((member) => (
                          <button
                            key={member.id}
                            type="button"
                            onClick={() => addTeamMember(member.id)}
                            className="w-full text-left px-4 py-3 hover:bg-primary/20 transition-colors border-b border-border last:border-b-0 group"
                          >
                            <div className="font-medium text-white-2 group-hover:text-primary">{member.name}</div>
                            <div className="text-xs text-light-gray/60">{member.track}</div>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                          No team members found
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 sticky bottom-0 bg-gradient-to-t from-onyx via-onyx to-transparent pt-8 pb-4">
              <button
                type="button"
                onClick={() => navigate('/admin/portfolio')}
                className="flex-1 px-6 py-3 rounded-xl bg-onyx border border-border text-light-gray hover:bg-onyx/80 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 form-btn !w-auto flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {isEditMode ? 'Update Project' : 'Create Project'}
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProjectEditor;
