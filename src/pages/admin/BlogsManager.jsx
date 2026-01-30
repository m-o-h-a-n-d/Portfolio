import { useState, useEffect } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '../../api/request';
import { DASHBOARD_ENDPOINTS } from '../../api/endpoints';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  Image as ImageIcon,
  Search,
  Calendar,
  Tag,
  FileText
} from 'lucide-react';
import Swal from '../../lib/swal';
import Pagination from '../../components/admin/Pagination';
import { extractFieldErrors } from '../../lib/validationErrors';

const BlogsManager = () => {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [editingItem, setEditingItem] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    excerpt: '',
    content: '',
    imagePreview: '',
    imageFile: null,
    link: '',
    date: new Date().toISOString().split('T')[0]
  });

  const itemsPerPage = 7;

  /* ================= Fetch ================= */
  useEffect(() => {
    fetchBlogs();
  }, []);

  useEffect(() => {
    const filtered = blogs.filter(blog =>
      [blog.title, blog.category, blog.excerpt, blog.content]
        .join(' ')
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
    setFilteredBlogs(filtered);
    setCurrentPage(1);
  }, [searchQuery, blogs]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await apiGet(DASHBOARD_ENDPOINTS.blog.list);
      const data = res.data.blogs || res.data || [];
      setBlogs(data);
      setFilteredBlogs(data);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  /* ================= Actions ================= */
  const openAddModal = () => {
    setModalMode('add');
    setEditingItem(null);
    setFieldErrors({});
    setFormData({
      title: '',
      category: '',
      excerpt: '',
      content: '',
      imagePreview: '',
      imageFile: null,
      link: '',
      date: new Date().toISOString().split('T')[0]
    });
    setModalOpen(true);
  };

  const openEditModal = (blog) => {
    setModalMode('edit');
    setEditingItem(blog);
    setFieldErrors({});
    setFormData({
      title: blog.title || '',
      category: blog.category || '',
      excerpt: blog.excerpt || '',
      content: blog.content || '',
      imagePreview: blog.image || '',
      imageFile: null,
      link: blog.link || '',
      date: blog.date || new Date().toISOString().split('T')[0]
    });
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setFormData(p => ({ ...p, imagePreview: previewUrl, imageFile: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setFieldErrors({});
      const formPayload = new FormData();
      formPayload.append('title', formData.title);
      formPayload.append('category', formData.category);
      formPayload.append('excerpt', formData.excerpt || '');
      formPayload.append('content', formData.content);
      formPayload.append('link', formData.link || '');
      formPayload.append('date', formData.date || '');
      if (formData.imageFile) {
        formPayload.append('image', formData.imageFile);
      }

      const response = modalMode === 'add'
        ? await apiPost(DASHBOARD_ENDPOINTS.blog.store, formPayload)
        : await apiPut(DASHBOARD_ENDPOINTS.blog.update(editingItem.id), formPayload);
      
      const responseList = response?.data?.blogs;
      if (Array.isArray(responseList)) {
        setBlogs(responseList);
        setFilteredBlogs(responseList);
      } else {
        await fetchBlogs();
      }

      closeModal();
      Swal.fire({
        icon: 'success',
        title: 'Done!',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      setFieldErrors(extractFieldErrors(error));
      Swal.fire('Error', 'Something went wrong', 'error');
    }
  };

  const handleDelete = async (id) => {
    const res = await Swal.fire({
      title: 'Delete blog?',
      icon: 'warning',
      showCancelButton: true
    });
    if (!res.isConfirmed) return;
    await apiDelete(DASHBOARD_ENDPOINTS.blog.delete(id));
    fetchBlogs();
  };

  /* ================= Pagination ================= */
  const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredBlogs.slice(start, start + itemsPerPage);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-white-2 flex items-center gap-2">
            <FileText className="w-8 h-8 text-primary" />
            Blogs Manager
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage and organize all your blog posts in one place
          </p>
        </div>

        <div className="flex gap-3 flex-col sm:flex-row">
          <div className="relative w-full sm:w-80 lg:w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search blogs..."
              className="form-input !pl-10 w-full"
            />
          </div>
          <button onClick={openAddModal} className="form-btn whitespace-nowrap lg:w-[200px]">
            <Plus className="w-4 h-4" /> Add Blog
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-lg">
        {/* Table Wrapper */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border">
                <th className="px-6 py-4 text-left text-sm font-semibold text-white-2">
                  Thumbnail
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white-2">
                  Title
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white-2">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white-2">
                  Date
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-white-2">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border/50">
              {currentItems.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-16 px-6 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="w-12 h-12 text-muted-foreground/30" />
                      <p className="text-muted-foreground">No blogs found ðŸš«</p>
                    </div>
                  </td>
                </tr>
              )}

              {currentItems.map((blog, index) => (
                <tr
                  key={blog.id}
                  className="hover:bg-white/5 transition-colors duration-200 group"
                >
                  {/* Thumbnail */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center">
                      <img
                        src={blog.image}
                        alt={blog.title}
                        className="w-14 h-14 rounded-lg object-cover shadow-md group-hover:shadow-lg transition-shadow"
                      />
                    </div>
                  </td>

                  {/* Title */}
                  <td className="px-6 py-4">
                    <p className="font-semibold text-white-2 truncate max-w-xs hover:text-primary transition-colors">
                      {blog.title}
                    </p>
                  </td>

                  {/* Category */}
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25 transition-colors">
                      <Tag className="w-3 h-3" />
                      {blog.category}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {new Date(blog.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEditModal(blog)}
                        className="icon-btn p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 transition-all duration-200 group/btn"
                        title="Edit blog"
                      >
                        <Edit2 size={16} className="group-hover/btn:scale-110 transition-transform" />
                      </button>
                      <button
                        onClick={() => handleDelete(blog.id)}
                        className="icon-btn p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive hover:text-red-400 transition-all duration-200 group/btn"
                        title="Delete blog"
                      >
                        <Trash2 size={16} className="group-hover/btn:scale-110 transition-transform" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="border-t border-border bg-white/2">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="admin-modal-overlay active" onClick={closeModal}>
          <div className="admin-modal max-w-2xl" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Modal Header */}
              <div className="flex justify-between items-center pb-4 border-b border-border">
                <h3 className="text-2xl font-bold text-white-2">
                  {modalMode === 'add' ? 'âœ¨ Add New Blog' : 'âœï¸ Edit Blog'}
                </h3>
                <button
                  type="button"
                  onClick={closeModal}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={24} className="text-muted-foreground hover:text-white-2" />
                </button>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white-2 mb-2">
                    Blog Title
                  </label>
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="form-input w-full"
                    placeholder="Enter blog title"
                    required
                  />
                  {fieldErrors.title && (
                    <p className="mt-1 text-xs text-destructive">{fieldErrors.title}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white-2 mb-2">
                      Category
                    </label>
                    <input
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="form-input w-full"
                      placeholder="e.g., Technology"
                      required
                    />
                    {fieldErrors.category && (
                      <p className="mt-1 text-xs text-destructive">{fieldErrors.category}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white-2 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="form-input w-full"
                      required
                    />
                    {fieldErrors.date && (
                      <p className="mt-1 text-xs text-destructive">{fieldErrors.date}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white-2 mb-2">
                    Excerpt
                  </label>
                  <textarea
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleInputChange}
                    className="form-input w-full min-h-[90px] resize-none"
                    placeholder="Short summary for the blog..."
                  />
                  {fieldErrors.excerpt && (
                    <p className="mt-1 text-xs text-destructive">{fieldErrors.excerpt}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white-2 mb-2">
                    Content
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    className="form-input w-full min-h-[140px] resize-none"
                    placeholder="Write your blog content here..."
                    required
                  />
                  {fieldErrors.content && (
                    <p className="mt-1 text-xs text-destructive">{fieldErrors.content}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white-2 mb-2">
                    Link
                  </label>
                  <input
                    type="url"
                    name="link"
                    value={formData.link}
                    onChange={handleInputChange}
                    className="form-input w-full"
                    placeholder="https://..."
                  />
                  {fieldErrors.link && (
                    <p className="mt-1 text-xs text-destructive">{fieldErrors.link}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white-2 mb-2">
                    Thumbnail Image
                  </label>
                  <label className="block border-2 border-dashed border-primary/30 hover:border-primary/60 rounded-xl p-8 text-center cursor-pointer transition-colors bg-primary/5 hover:bg-primary/10">
                    {formData.imagePreview ? (
                      <div className="space-y-2">
                        <img src={formData.imagePreview} className="max-h-48 mx-auto rounded-lg shadow-md" alt="Preview" />
                        <p className="text-xs text-muted-foreground">Click to change image</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <ImageIcon className="mx-auto w-8 h-8 text-primary/50" />
                        <p className="font-medium text-white-2">Upload Thumbnail</p>
                        <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                      </div>
                    )}
                    <input type="file" hidden onChange={handleImageUpload} accept="image/*" />
                  </label>
                  {fieldErrors.image && (
                    <p className="mt-1 text-xs text-destructive">{fieldErrors.image}</p>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 rounded-lg border border-border text-muted-foreground hover:bg-white/5 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 form-btn gap-2 justify-center"
                >
                  <Save size={16} />
                  {modalMode === 'add' ? 'Create Blog' : 'Update Blog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogsManager;
