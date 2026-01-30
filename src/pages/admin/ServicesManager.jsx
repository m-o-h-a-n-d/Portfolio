import { useState, useEffect } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '../../api/request';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Save, 
  Monitor, 
  Server, 
  Wifi, 
  Layout, 
  Code,
  Smartphone,
  Database,
  Globe,
  Cpu,
  Search
} from 'lucide-react';
import Swal from '../../lib/swal';
import { DASHBOARD_ENDPOINTS } from '../../api/endpoints';
import { extractFieldErrors } from '../../lib/validationErrors';

function limiter(name, limit = 10) {
  if (!name) return "";
  return name.length > limit ? name.slice(0, limit) + "..." : name;
}




const iconList = [
  { name: 'Monitor', icon: Monitor, class: 'frontend' },
  { name: 'Server', icon: Server, class: 'backend' },
  { name: 'Wifi', icon: Wifi, class: 'iot' },
  { name: 'Layout', icon: Layout, class: 'uiux' },
  { name: 'Code', icon: Code, class: 'code' },
  { name: 'Smartphone', icon: Smartphone, class: 'mobile' },
  { name: 'Database', icon: Database, class: 'database' },
  { name: 'Globe', icon: Globe, class: 'web' },
  { name: 'Cpu', icon: Cpu, class: 'hardware' }
];

const ServicesManager = () => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [editingItem, setEditingItem] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: 'code'
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await apiGet(DASHBOARD_ENDPOINTS.services.list);
      const data = response.data.services || response.data;
      const servicesList = Array.isArray(data) ? data : [];
      setServices(servicesList);
      setFilteredServices(servicesList);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setModalMode('add');
    setEditingItem(null);
    setFieldErrors({});
    setFormData({ 
      title: '', 
      description: '', 
      icon: 'code'
    });
    setModalOpen(true);
  };

  const openEditModal = (service) => {
    setModalMode('edit');
    setEditingItem(service);
    setFieldErrors({});
    setFormData({
      title: service.title,
      description: service.description,
      icon: service.icon || 'code'
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
    const filtered = services.filter(s => 
      s.title.toLowerCase().includes(query) || 
      s.description.toLowerCase().includes(query)
    );
    setFilteredServices(filtered);
  };

  const selectIcon = (iconClass) => {
    setFormData(prev => ({ ...prev, icon: iconClass }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setFieldErrors({});
      const submissionData = {
        ...formData,
        id: editingItem?.id || Date.now()
      };
      
      // Use the appropriate endpoint based on mode
      const response = modalMode === 'add'
        ? await apiPost(DASHBOARD_ENDPOINTS.services.store, submissionData)
        : await apiPut(DASHBOARD_ENDPOINTS.services.update(editingItem.id), submissionData);
      
      // Use the data returned from the backend for real-time update
      const savedService = response.service || response.data || submissionData;

      if (modalMode === 'add') {
        setServices(prev => {
          const updated = [...prev, savedService];
          setFilteredServices(updated); // Force immediate render of the list
          return updated;
        });
      } else {
        setServices(prev => {
          const updated = prev.map(s => s.id === (editingItem?.id || savedService.id) ? savedService : s);
          setFilteredServices(updated); // Force immediate render of the list
          return updated;
        });
      }

      closeModal();
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: `Service ${modalMode === 'add' ? 'added' : 'updated'} successfully!`,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      setFieldErrors(extractFieldErrors(error));
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error saving service',
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
      await apiDelete(DASHBOARD_ENDPOINTS.services.delete(id));
      setServices(prev => {
        const updated = prev.filter(s => s.id !== id);
        setFilteredServices(updated);
        return updated;
      });
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Service deleted successfully!',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
    }
  };

  const getIconComponent = (iconClass) => {
    const iconObj = iconList.find(i => i.class === iconClass);
    return iconObj ? iconObj.icon : Code;
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
          <h1 className="h2 text-white-2">Services Manager</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage "What I'm Doing" section</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={handleSearch}
              className="form-input !pl-10 !py-2 !w-64"
            />
          </div>
          <button onClick={openAddModal} className="form-btn !w-auto !px-6">
            <Plus className="w-5 h-5" />
            <span>Add Service</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredServices.map((service) => {
          const Icon = getIconComponent(service.icon);
          return (
            <div 
              key={service.id}
              className="bg-card border border-border rounded-[20px] p-6 flex gap-5 relative group"
              style={{ background: 'var(--bg-gradient-jet)' }}
            >
              <div className="text-primary w-12 h-12 flex-shrink-0">
                <Icon className="w-12 h-12" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <h3 className="text-white-2 font-bold text-lg mb-2">{service.title}</h3>
                <p className="text-light-gray text-sm leading-relaxed">{limiter(service.description , 100 )}</p>
              </div>
              
              <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEditModal(service)} className="p-2 rounded-lg bg-onyx text-primary hover:bg-primary/20">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(service.id)} className="p-2 rounded-lg bg-onyx text-destructive hover:bg-destructive/20">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {modalOpen && (
        <div className="admin-modal-overlay active" onClick={closeModal}>
          <div className="admin-modal max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="h3 text-white-2">{modalMode === 'add' ? 'Add Service' : 'Edit Service'}</h3>
              <button onClick={closeModal} className="p-2 rounded-lg bg-onyx text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-light-gray/70 text-xs uppercase mb-2 block">Service Title</label>
                    <input 
                      type="text" 
                      name="title" 
                      value={formData.title} 
                      onChange={handleInputChange} 
                      className="form-input" 
                      placeholder="e.g. Web Development"
                      required 
                    />
                    {fieldErrors.title && (
                      <p className="mt-1 text-xs text-destructive">{fieldErrors.title}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-light-gray/70 text-xs uppercase mb-2 block">Description</label>
                    <textarea 
                      name="description" 
                      value={formData.description} 
                      onChange={handleInputChange} 
                      className="form-input min-h-[120px] resize-y" 
                      placeholder="Describe what you do..."
                      required 
                    />
                    {fieldErrors.description && (
                      <p className="mt-1 text-xs text-destructive">{fieldErrors.description}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-light-gray/70 text-xs uppercase mb-2 block">Icon Class (Tailwind/Custom)</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        name="icon" 
                        value={formData.icon} 
                        onChange={handleInputChange} 
                        className="form-input" 
                        placeholder="e.g. frontend, backend, wifi"
                      />
                      <div className="w-12 h-12 bg-onyx rounded-xl flex items-center justify-center text-primary border border-border">
                        {(() => {
                          const Icon = getIconComponent(formData.icon);
                          return <Icon className="w-6 h-6" />;
                        })()}
                      </div>
                    </div>
                    {fieldErrors.icon && (
                      <p className="mt-1 text-xs text-destructive">{fieldErrors.icon}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-1">Type a class name or select from the list</p>
                  </div>
                </div>

                <div>
                  <label className="text-light-gray/70 text-xs uppercase mb-2 block">Quick Select Icon</label>
                  <div className="grid grid-cols-3 gap-3 bg-onyx/50 p-4 rounded-2xl border border-border">
                    {iconList.map((item) => (
                      <button
                        key={item.class}
                        type="button"
                        onClick={() => selectIcon(item.class)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                          formData.icon === item.class 
                            ? 'bg-primary/20 border-primary text-primary' 
                            : 'bg-onyx border-border text-muted-foreground hover:border-primary/50 hover:text-primary'
                        }`}
                      >
                        <item.icon className="w-6 h-6 mb-1" />
                        <span className="text-[10px] truncate w-full text-center">{item.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-3 rounded-xl bg-onyx text-muted-foreground">Cancel</button>
                <button type="submit" className="form-btn !w-auto flex-1">
                  <Save className="w-5 h-5" />
                  <span>{modalMode === 'add' ? 'Add Service' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesManager;
