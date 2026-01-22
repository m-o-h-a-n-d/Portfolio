import { useState, useEffect } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '../../api/request';
import { 
  API_RESUME_GET, 
  API_RESUME_REORDER,
  API_EDUCATION_GET,
  API_EDUCATION_CREATE,
  API_EDUCATION_UPDATE,
  API_EDUCATION_DELETE,
  API_EXPERIENCE_GET,
  API_EXPERIENCE_CREATE,
  API_EXPERIENCE_UPDATE,
  API_EXPERIENCE_DELETE,
  API_SKILLS_GET
} from '../../api/endpoints';
import { Plus, Edit2, Trash2, X, BookOpen, Briefcase, Award, GripVertical } from 'lucide-react';
import Swal from '../../lib/swal';
import SkillsManager from '../../components/admin/SkillsManager';

const ResumeManager = () => {
  const [resumeOrder, setResumeOrder] = useState([]); // Holds the order of types: ["education", "experience", "skills"]
  const [sectionsData, setSectionsData] = useState({
    education: [],
    experience: [],
    skills: []
  });
  const [loading, setLoading] = useState(true);
  const [reordering, setReordering] = useState(false);
  const [activeTab, setActiveTab] = useState('education');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [editingItem, setEditingItem] = useState(null);
  const [draggedTabIndex, setDraggedTabIndex] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    startYear: new Date().getFullYear().toString(),
    endYear: new Date().getFullYear().toString(),
    isPresent: false,
    description: ''
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      // 1. Fetch the order (returns array of strings)
      const orderResponse = await apiGet(API_RESUME_GET);
      const order = orderResponse.data || ["education", "experience", "skills"];
      setResumeOrder(order);
      
      if (order.length > 0) {
        setActiveTab(order[0]);
      }

      // 2. Fetch all sections individually
      const [eduRes, expRes, skillsRes] = await Promise.all([
        apiGet(API_EDUCATION_GET),
        apiGet(API_EXPERIENCE_GET),
        apiGet(API_SKILLS_GET)
      ]);

      setSectionsData({
        education: eduRes.data || [],
        experience: expRes.data || [],
        skills: skillsRes.data || []
      });

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Drag and Drop for Tabs (Spatial Ordering)
  const onDragStart = (e, index) => {
    setDraggedTabIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e, index) => {
    e.preventDefault();
    if (draggedTabIndex === null || draggedTabIndex === index) return;

    const newOrder = [...resumeOrder];
    const draggedItem = newOrder[draggedTabIndex];
    
    newOrder.splice(draggedTabIndex, 1);
    newOrder.splice(index, 0, draggedItem);

    setDraggedTabIndex(index);
    setResumeOrder(newOrder);
  };

  const onDragEnd = async () => {
    setDraggedTabIndex(null);
    try {
      setReordering(true);
      // Send the array of strings as requested
      await apiPost(API_RESUME_REORDER, resumeOrder);
    } catch (error) {
      console.error('Error updating order:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to save new order',
      });
    } finally {
      setTimeout(() => setReordering(false), 500);
    }
  };

  const openAddModal = () => {
    setModalMode('add');
    setEditingItem(null);
    setFormData({ 
      title: '', 
      startYear: new Date().getFullYear().toString(),
      endYear: new Date().getFullYear().toString(),
      isPresent: false,
      description: '' 
    });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setModalMode('edit');
    setEditingItem(item);
    
    const parts = item.period.split(' — ');
    const startYear = parts[0] || new Date().getFullYear().toString();
    const endPart = parts[1] || '';
    const isPresent = endPart === 'Present';
    const endYear = isPresent ? new Date().getFullYear().toString() : endPart;

    setFormData({
      title: item.title,
      startYear,
      endYear,
      isPresent,
      description: item.description
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const period = `${formData.startYear} — ${formData.isPresent ? 'Present' : formData.endYear}`;
      const submissionData = {
        title: formData.title,
        period,
        description: formData.description,
        id: editingItem?.id
      };

      let response;
      let sectionKey = activeTab;

      if (activeTab === 'education') {
        if (modalMode === 'add') {
          response = await apiPost(API_EDUCATION_CREATE, submissionData);
        } else {
          response = await apiPut(`${API_EDUCATION_UPDATE}/${editingItem.id}`, submissionData);
        }
      } else if (activeTab === 'experience') {
        if (modalMode === 'add') {
          response = await apiPost(API_EXPERIENCE_CREATE, submissionData);
        } else {
          response = await apiPut(`${API_EXPERIENCE_UPDATE}/${editingItem.id}`, submissionData);
        }
      }

      const updatedItem = response.education || response.experience || response.data || { ...submissionData, id: submissionData.id || Date.now().toString() };
      
      setSectionsData(prev => ({
        ...prev,
        [sectionKey]: modalMode === 'add' 
          ? [...prev[sectionKey], updatedItem]
          : prev[sectionKey].map(item => item.id === (editingItem?.id || updatedItem.id) ? updatedItem : item)
      }));

      closeModal();
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} ${modalMode === 'add' ? 'added' : 'updated'} successfully!`,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Error saving:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error saving item',
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
      if (activeTab === 'education') {
        await apiDelete(`${API_EDUCATION_DELETE}/${id}`);
      } else if (activeTab === 'experience') {
        await apiDelete(`${API_EXPERIENCE_DELETE}/${id}`);
      }

      setSectionsData(prev => ({
        ...prev,
        [activeTab]: prev[activeTab].filter(item => item.id !== id)
      }));
      
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Item deleted successfully!',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'education': return BookOpen;
      case 'experience': return Briefcase;
      case 'skills': return Award;
      default: return BookOpen;
    }
  };

  const currentData = sectionsData[activeTab] || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {reordering && (
        <div className="absolute inset-0 bg-background/20 backdrop-blur-[1px] z-50 flex items-center justify-center rounded-2xl">
          <div className="bg-onyx border border-border px-4 py-2 rounded-full shadow-xl flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-medium text-white-2">Updating order...</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="h2 text-white-2">Resume Manager</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your education, experience and skills in the order they appear</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-[20px] p-2" style={{ background: 'var(--bg-gradient-jet)' }}>
        <div className="flex gap-2">
          {resumeOrder.map((type, index) => {
            const Icon = getIcon(type);
            const isActive = activeTab === type;
            const isDragged = draggedTabIndex === index;

            return (
              <div
                key={type}
                draggable
                onDragStart={(e) => onDragStart(e, index)}
                onDragOver={(e) => onDragOver(e, index)}
                onDragEnd={onDragEnd}
                onClick={() => setActiveTab(type)}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl transition-all cursor-pointer group relative ${
                  isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-onyx/50'
                } ${isDragged ? 'opacity-40 scale-95' : ''}`}
              >
                <GripVertical className="w-4 h-4 opacity-0 group-hover:opacity-40 absolute left-2 cursor-grab active:cursor-grabbing" />
                <Icon className="w-5 h-5" />
                <span className="font-medium capitalize">{type}</span>
              </div>
            );
          })}
        </div>
      </div>

      {activeTab === 'skills' ? (
        <SkillsManager 
          skills={currentData} 
          onUpdate={(newSkills) => {
            setSectionsData(prev => ({ ...prev, skills: newSkills }));
          }} 
        />
      ) : (
        <div className="bg-card border border-border rounded-[20px] overflow-hidden" style={{ background: 'var(--bg-gradient-jet)' }}>
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Period</th>
                  <th>Description</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((item) => (
                  <tr key={item.id}>
                    <td className="font-medium text-foreground">{item.title}</td>
                    <td><span className="text-vegas-gold">{item.period}</span></td>
                    <td className="max-w-xs truncate">{item.description}</td>
                    <td>
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEditModal(item)} className="p-2 rounded-lg bg-onyx text-primary hover:bg-primary/20 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg bg-onyx text-destructive hover:bg-destructive/20 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {currentData.length === 0 && (
                  <tr><td colSpan="4" className="text-center py-8 text-muted-foreground">No {activeTab} entries found.</td></tr>
                )}
                <tr className="bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer" onClick={openAddModal}>
                  <td colSpan="4" className="py-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-primary font-medium">
                      <Plus className="w-5 h-5" />
                      <span>Add New {activeTab === 'education' ? 'Education' : 'Experience'}</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="admin-modal-overlay active" onClick={closeModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="h3 text-white-2">{modalMode === 'add' ? 'Add' : 'Edit'} {activeTab}</h3>
              <button onClick={closeModal} className="p-2 rounded-lg bg-onyx text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div>
                <label className="form-label">Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} className="form-input" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Start Year</label>
                  <input type="text" name="startYear" value={formData.startYear} onChange={handleInputChange} className="form-input" required />
                </div>
                <div>
                  <label className="form-label">End Year</label>
                  <input type="text" name="endYear" value={formData.endYear} onChange={handleInputChange} className="form-input" disabled={formData.isPresent} required={!formData.isPresent} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" name="isPresent" checked={formData.isPresent} onChange={handleInputChange} className="w-4 h-4 rounded border-jet bg-onyx text-primary" />
                <label className="text-sm text-light-gray">I am currently working/studying here</label>
              </div>
              <div>
                <label className="form-label">Description</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} className="form-input min-h-[100px]" required />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={closeModal} className="form-btn !bg-onyx !w-auto !px-6">Cancel</button>
                <button type="submit" className="form-btn !w-auto !px-6">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeManager;
