import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet, apiDelete } from '../../api/request';
import { DASHBOARD_ENDPOINTS } from '../../api/endpoints';
import { Plus, Edit2, Trash2, Search, Eye, CheckCircle2, Circle } from 'lucide-react';
import Swal from '../../lib/swal';

const PortfolioManager = () => {
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(null);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const response = await apiGet(DASHBOARD_ENDPOINTS.portfolio.list);
      const normalizeProject = (project) => ({
        ...project,
        category: project.category || project.service_name || '',
        description: project.description || project.short_desc || project.desc || project.full_description || '',
        image: project.image || project.image_cover || ''
      });
      const data = response?.data || {};
      const projects = Array.isArray(data.projects)
        ? data.projects
        : Array.isArray(data.portfolios)
          ? data.portfolios
          : (Array.isArray(data) ? data : []);
      const normalizedProjects = projects.map(normalizeProject);
      setPortfolio({ ...data, projects: normalizedProjects });
      setFilteredProjects(normalizedProjects);
    } catch (error) {
      const status = error?.response?.status || error?.status;
      const isNotFound = status === 404;
      if (!isNotFound) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error loading portfolio',
        });
      }
      if (isNotFound) {
        setPortfolio({ projects: [] });
        setFilteredProjects([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    if (!portfolio?.projects) return;
    const filtered = portfolio.projects.filter(p => 
      p.title?.toLowerCase().includes(query) || 
      p.category?.toLowerCase().includes(query) ||
      p.description?.toLowerCase().includes(query)
    );
    setFilteredProjects(filtered);
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
      await apiDelete(DASHBOARD_ENDPOINTS.portfolio.delete(id));
      setPortfolio(prev => {
        const updatedProjects = prev.projects.filter(p => p.id !== id);
        setFilteredProjects(updatedProjects); // Force immediate render
        return {
          ...prev,
          projects: updatedProjects
        };
      });
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Project deleted successfully!',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
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
          <button 
            onClick={() => navigate('/admin/portfolio/add')}
            className="form-btn !w-auto !px-6"
          >
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
            className="bg-card border border-border rounded-[20px] overflow-hidden group hover:border-primary/50 transition-all"
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
                  onClick={() => navigate(`/admin/portfolio/edit/${project.id}`)}
                  className="p-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  title="Edit Project"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="p-3 rounded-xl bg-destructive text-white-1 hover:bg-destructive/90 transition-colors"
                  title="Delete Project"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <a
                  href={`/project/${project.slug || project.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-onyx border border-border text-light-gray hover:bg-onyx/80 transition-colors"
                  title="View Project"
                >
                  <Eye className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="text-foreground font-medium mb-1">{project.title}</h3>
              <p className="text-vegas-gold text-sm capitalize mb-2">{project.category || 'Project'}</p>
              
            

           

             
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-onyx flex items-center justify-center">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-white-2 text-lg font-medium mb-2">No projects found</h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery ? 'Try adjusting your search terms' : 'Create your first project to get started'}
          </p>
          {!searchQuery && (
            <button 
              onClick={() => navigate('/admin/portfolio/add')}
              className="form-btn !w-auto !px-6 mx-auto"
            >
              <Plus className="w-5 h-5" />
              <span>Create Project</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PortfolioManager;
