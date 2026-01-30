import { useState, useEffect } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '../../api/request';
import { Plus, Edit2, Trash2, X, Save, Image as ImageIcon, Link as LinkIcon, Search, Briefcase } from 'lucide-react';
import Swal from '../../lib/swal';
import { DASHBOARD_ENDPOINTS } from '../../api/endpoints';
import { extractFieldErrors } from '../../lib/validationErrors';

const TeamManager = () => {
  const [team, setTeam] = useState([]);
  const [filteredTeam, setFilteredTeam] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [editingItem, setEditingItem] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    track: '',
    logoPreview: '',
    logoFile: null,
    url: '#'
  });

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const response = await apiGet(DASHBOARD_ENDPOINTS.team.list);
      const data = response.data?.teams || response.data?.team || response.data;
      const teamList = Array.isArray(data) ? data : [];
      setTeam(teamList);
      setFilteredTeam(teamList);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setModalMode('add');
    setEditingItem(null);
    setFieldErrors({});
    setFormData({ name: '', track: '', logoPreview: '', logoFile: null, url: '#' });
    setModalOpen(true);
  };

  const openEditModal = (member) => {
    setModalMode('edit');
    setEditingItem(member);
    setFieldErrors({});
    setFormData({
      name: member.name,
      track: member.track || '',
      logoPreview: member.logo,
      logoFile: null,
      url: member.url || '#'
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = team.filter(member => 
      member.name.toLowerCase().includes(query) || 
      (member.track && member.track.toLowerCase().includes(query))
    );
    setFilteredTeam(filtered);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, logoPreview: previewUrl, logoFile: file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setFieldErrors({});
      if (modalMode === 'add' && !formData.logoFile) {
        setFieldErrors({ logo: 'Member photo is required.' });
        return;
      }

      const formPayload = new FormData();
      formPayload.append('name', formData.name);
      formPayload.append('track', formData.track);
      formPayload.append('url', formData.url || '#');
      if (formData.logoFile) {
        formPayload.append('logo', formData.logoFile);
      }

      const response = modalMode === 'add'
        ? await apiPost(DASHBOARD_ENDPOINTS.team.store, formPayload)
        : await apiPut(DASHBOARD_ENDPOINTS.team.update(editingItem.id), formPayload);
      
      // Use returned data for real-time update
      const savedMember = response.member || response.data || {
        id: editingItem?.id || Date.now(),
        name: formData.name,
        track: formData.track,
        url: formData.url || '#',
        logo: formData.logoPreview
      };

      if (modalMode === 'add') {
        setTeam(prev => {
          const updated = [...prev, savedMember];
          setFilteredTeam(updated); // Force immediate render
          return updated;
        });
      } else {
        setTeam(prev => {
          const updated = prev.map(c => c.id === (editingItem?.id || savedMember.id) ? savedMember : c);
          setFilteredTeam(updated); // Force immediate render
          return updated;
        });
      }

      closeModal();
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: `Team member ${modalMode === 'add' ? 'added' : 'updated'} successfully!`,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      setFieldErrors(extractFieldErrors(error));
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error saving team member',
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
      await apiDelete(DASHBOARD_ENDPOINTS.team.delete(id));
      const updated = team.filter(c => c.id !== id);
      setTeam(updated);
      setFilteredTeam(updated);
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Team member deleted successfully!',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="h2 text-white-2">team Manager</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your team members, their tracks and portfolios</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search developers..."
              value={searchQuery}
              onChange={handleSearch}
              className="form-input !pl-10 !py-2 !w-64"
            />
          </div>
          <button onClick={openAddModal} className="form-btn !w-auto !px-6">
            <Plus className="w-5 h-5" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredTeam.map((member) => (
          <div 
            key={member.id}
            className="bg-card border border-border rounded-[20px] p-6 flex flex-col items-center gap-4 group relative"
            style={{ background: 'var(--bg-gradient-jet)' }}
          >
            <div className="w-24 h-24 rounded-xl bg-onyx border border-border flex items-center justify-center overflow-hidden">
              <img src={member.logo} alt={member.name} className="w-full h-full object-cover transition-all" />
            </div>
            <div className="text-center">
              <h3 className="text-foreground font-medium">{member.name}</h3>
              <p className="text-orange-yellow text-xs mb-2">{member.track || 'No Track'}</p>
              <a href={member.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center justify-center gap-1 mt-1">
                <LinkIcon className="w-3 h-3" />
                Portfolio / LinkedIn
              </a>
            </div>
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => openEditModal(member)} className="p-2 rounded-lg bg-onyx text-primary hover:bg-primary/20">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(member.id)} className="p-2 rounded-lg bg-onyx text-destructive hover:bg-destructive/20">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="admin-modal-overlay active" onClick={closeModal}>
          <div className="admin-modal max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="h3 text-white-2">{modalMode === 'add' ? 'Add Member' : 'Edit Member'}</h3>
              <button onClick={closeModal} className="p-2 rounded-lg bg-onyx text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-light-gray/70 text-xs uppercase mb-2 block">Member Photo</label>
                <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
                {formData.logoPreview ? (
                    <div className="relative">
                      <img src={formData.logoPreview} alt="Preview" className="max-h-24 mx-auto rounded-lg" />
                      <button type="button" onClick={() => setFormData(prev => ({ ...prev, logoPreview: '', logoFile: null }))} className="absolute -top-2 -right-2 p-1 bg-destructive rounded-full text-white-1">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <ImageIcon className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground text-sm">Click to upload photo</p>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  )}
                </div>
                {(fieldErrors.logo || fieldErrors.logoFile) && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrors.logo || fieldErrors.logoFile}</p>
                )}
              </div>
              <div>
                <label className="text-light-gray/70 text-xs uppercase mb-2 block">Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="form-input" required />
                {fieldErrors.name && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrors.name}</p>
                )}
              </div>
              <div>
                <label className="text-light-gray/70 text-xs uppercase mb-2 block">Track (e.g. Full Stack Developer)</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="text" name="track" value={formData.track} onChange={handleInputChange} className="form-input !pl-10" placeholder="Developer Track" required />
                </div>
                {fieldErrors.track && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrors.track}</p>
                )}
              </div>
              <div>
                <label className="text-light-gray/70 text-xs uppercase mb-2 block">Portfolio / LinkedIn URL</label>
                <input type="url" name="url" value={formData.url} onChange={handleInputChange} className="form-input" placeholder="https://..." />
                {fieldErrors.url && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrors.url}</p>
                )}
              </div>

              <div className="flex gap-4 mt-6">
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-3 rounded-xl bg-onyx text-muted-foreground">Cancel</button>
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

export default TeamManager;
