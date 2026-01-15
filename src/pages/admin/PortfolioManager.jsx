import { useState, useEffect } from 'react';
import { apiGet, apiPost } from '../../api/request';
import { Plus, Edit2, Trash2, X, Save, Upload, Image, Search, ChevronDown } from 'lucide-react';
import Swal from '../../lib/swal';

const PortfolioManager = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [team, setTeam] = useState(null);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [editingItem, setEditingItem] = useState(null);
  const [teamSearchOpen, setTeamSearchOpen] = useState(false);
  const [teamSearchQuery, setTeamSearchQuery] = useState('');
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
  const [techInput, setTechInput] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [portfolioRes, teamRes] = await Promise.all([
        apiGet('/portfolio'),
        apiGet('/team')
      ]);
      setPortfolio(portfolioRes.data);
      setTeam(teamRes.data);
      setFilteredProjects(portfolioRes.data.projects || []);
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

  const openAddModal = () => {
    setModalMode('add');
    setEditingItem(null);
    setFormData({
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
    setImageFiles([]);
    setTechInput('');
    setModalOpen(true);
  };

  const openEditModal = (project) => {
    setModalMode('edit');
    setEditingItem(project);
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
    setImageFiles([]);
    setTechInput('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
    setFormData({
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
    setImageFiles([]);
    setTechInput('');
    setTeamSearchOpen(false);
    setTeamSearchQuery('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    if (!portfolio?.projects) return;
    const filtered = portfolio.projects.filter(p => 
      p.title.toLowerCase().includes(query) || 
      p.category.toLowerCase().includes(query) ||
      p.description?.toLowerCase().includes(query)
    );
    setFilteredProjects(filtered);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    const newFiles = [...imageFiles, ...files];
    setImageFiles(newFiles);

    // Convert files to data URLs
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
      const projectData = {
        ...formData,
        id: editingItem?.id || Date.now(),
        slug: formData.title.toLowerCase().replace(/\s+/g, '-'),
        image: formData.images[0] // First image as main image
      };

      await apiPost('/portfolio', projectData);

      if (modalMode === 'add') {
        setPortfolio(prev => ({
          ...prev,
          projects: [...(prev.projects || []), projectData]
        }));
      } else {
        setPortfolio(prev => ({
          ...prev,
          projects: prev.projects.map(p => 
            p.id === editingItem.id ? projectData : p
          )
        }));
      }

      closeModal();
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: `Project ${modalMode === 'add' ? 'added' : 'updated'} successfully!`,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Error saving project:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error saving project',
      });
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
    });

    if (!result.isConfirmed) return;

    try {
      setPortfolio(prev => ({
        ...prev,
        projects: prev.projects.filter(p => p.id !== id)
      }));
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Project deleted successfully!',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error deleting project',
      });
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="h2 text-white-2">Portfolio Manager</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your portfolio projects with team members</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={handleSearch}
              className="form-input !pl-10 !py-2 !w-64"
            />
          </div>
          <button onClick={openAddModal} className="form-btn !w-auto !px-6">
            <Plus className="w-5 h-5" />
            <span>Add Project</span>
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div 
            key={project.id}
            className="bg-card border border-border rounded-[20px] overflow-hidden group"
            style={{ background: 'var(--bg-gradient-jet)' }}
          >
            {/* Image */}
            <div className="relative h-48 overflow-hidden">
              <img 
                src={project.image} 
                alt={project.title}
                className="w-full h-full object-cover transition-transform group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => openEditModal(project)}
                  className="p-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="p-3 rounded-xl bg-destructive text-white-1 hover:bg-destructive/90 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="text-foreground font-medium mb-1">{project.title}</h3>
              <p className="text-vegas-gold text-sm capitalize mb-2">{project.category}</p>
              {project.team_members && project.team_members.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-light-gray">
                  <span>👥 {project.team_members.length} member{project.team_members.length > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="admin-modal-overlay active" onClick={closeModal}>
          <div className="admin-modal max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6 sticky top-0 bg-card z-10 pb-4">
              <h3 className="h3 text-white-2">
                {modalMode === 'add' ? 'Add Project' : 'Edit Project'}
              </h3>
              <button onClick={closeModal} className="p-2 rounded-lg bg-onyx text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Image Upload */}
                <div>
                  <label className="text-light-gray/70 text-xs uppercase mb-2 block">Project Images</label>
                  <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
                    {formData.images && formData.images.length > 0 ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {formData.images.map((img, index) => (
                            <div key={index} className="relative">
                              <img src={img} alt={`Preview ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 p-1 bg-destructive rounded-full text-white-1 hover:bg-destructive/80"
                              >
                                <X className="w-3 h-3" />
                              </button>
                              {index === 0 && (
                                <div className="absolute bottom-1 left-1 bg-primary text-black text-xs px-2 py-0.5 rounded">
                                  Main
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        <label className="cursor-pointer inline-block">
                          <span className="text-primary text-sm hover:underline">+ Add More Images</span>
                          <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                        </label>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <Image className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground text-sm">Click to upload images</p>
                        <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                      </label>
                    )}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="text-light-gray/70 text-xs uppercase mb-2 block">Title *</label>
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

                {/* Category */}
                <div>
                  <label className="text-light-gray/70 text-xs uppercase mb-2 block">Category</label>
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

                {/* Description */}
                <div>
                  <label className="text-light-gray/70 text-xs uppercase mb-2 block">Short Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="form-input min-h-[60px] resize-y"
                    placeholder="Brief description of the project"
                  />
                </div>

                {/* Full Description */}
                <div>
                  <label className="text-light-gray/70 text-xs uppercase mb-2 block">Full Description</label>
                  <textarea
                    name="full_description"
                    value={formData.full_description}
                    onChange={handleInputChange}
                    className="form-input min-h-[80px] resize-y"
                    placeholder="Detailed description of the project"
                  />
                </div>

                {/* Links */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-light-gray/70 text-xs uppercase mb-2 block">Live Project Link</label>
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
                    <label className="text-light-gray/70 text-xs uppercase mb-2 block">GitHub Link</label>
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

                {/* Technologies */}
                <div>
                  <label className="text-light-gray/70 text-xs uppercase mb-2 block">Technologies</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={techInput}
                      onChange={(e) => setTechInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
                      className="form-input flex-1"
                      placeholder="Enter technology and press Enter"
                    />
                    <button
                      type="button"
                      onClick={addTechnology}
                      className="form-btn !w-auto !px-4"
                    >
                      Add
                    </button>
                  </div>
                  {formData.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.technologies.map((tech, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-onyx border border-border rounded-full text-xs text-light-gray flex items-center gap-2"
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
                  <label className="text-light-gray/70 text-xs uppercase mb-2 block">Team Members</label>
                  
                  {/* Selected Team Members */}
                  {formData.team_members.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
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

                  {/* Team Search Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setTeamSearchOpen(!teamSearchOpen)}
                      className="form-input flex items-center justify-between"
                    >
                      <span className="text-muted-foreground">
                        {filteredTeamMembers.length > 0 ? 'Search team members...' : 'No more members available'}
                      </span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${teamSearchOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {teamSearchOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-onyx border border-border rounded-lg z-20 shadow-lg">
                        <input
                          type="text"
                          placeholder="Search team member..."
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
                                className="w-full text-left px-4 py-2 hover:bg-primary/20 transition-colors text-sm text-light-gray hover:text-primary border-b border-border last:border-b-0"
                              >
                                <div className="font-medium">{member.name}</div>
                                <div className="text-xs text-light-gray/60">{member.track}</div>
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-center text-sm text-muted-foreground">
                              No members found
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-3 rounded-xl bg-onyx text-muted-foreground hover:bg-onyx/80 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="form-btn !w-auto flex-1">
                  <Save className="w-5 h-5" />
                  <span>{modalMode === 'add' ? 'Add' : 'Save'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioManager;
