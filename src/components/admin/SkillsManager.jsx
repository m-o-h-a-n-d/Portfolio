import { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import Swal from '../../lib/swal';
import { Button } from "../ui/button";
import { apiPost, apiPut, apiDelete } from '../../api/request';
import { DASHBOARD_ENDPOINTS } from '../../api/endpoints';
import { extractFieldErrors } from '../../lib/validationErrors';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const SkillsManager = ({ skills = [], onUpdate }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [editingSkill, setEditingSkill] = useState(null);
  const [formData, setFormData] = useState({ name: '', percentage: 80 });
  const [fieldErrors, setFieldErrors] = useState({});

  const openAddModal = () => {
    setModalMode('add');
    setEditingSkill(null);
    setFieldErrors({});
    setFormData({ name: '', percentage: 80 });
    setModalOpen(true);
  };

  const openEditModal = (skill) => {
    setModalMode('edit');
    setEditingSkill(skill);
    setFieldErrors({});
    setFormData({ name: skill.name, percentage: skill.percentage });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingSkill(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'percentage' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setFieldErrors({});
      let updatedSkills;
      if (modalMode === 'add') {
        const response = await apiPost(DASHBOARD_ENDPOINTS.skills.store, formData);
        const newSkill = response.skill || response.data || { ...formData, id: `skill_${Date.now()}` };
        updatedSkills = [...skills, newSkill];
      } else {
        const response = await apiPut(DASHBOARD_ENDPOINTS.skills.update(editingSkill.id), formData);
        const updatedSkill = response.skill || response.data || { ...editingSkill, ...formData };
        updatedSkills = skills.map(s => s.id === (editingSkill?.id || updatedSkill.id) ? updatedSkill : s);
      }
      onUpdate(updatedSkills);
      closeModal();
    } catch (error) {
      setFieldErrors(extractFieldErrors(error));
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to save skill',
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
      await apiDelete(DASHBOARD_ENDPOINTS.skills.delete(id));
      const updatedSkills = skills.filter(s => s.id !== id);
      onUpdate(updatedSkills);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete skill',
      });
    }
  };

  return (
    <div className="bg-card border border-border rounded-[20px] overflow-hidden" style={{ background: 'var(--bg-gradient-jet)' }}>
      <div className="p-6 flex items-center justify-between border-b border-border">
        <h3 className="h3 text-white-2">Skills Management</h3>
        <Button onClick={openAddModal} className="bg-primary hover:bg-primary/80 text-white-1">
          <Plus className="w-4 h-4 mr-2" /> Add Skill
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Skill Name</th>
              <th>Percentage</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {skills.map((skill) => (
              <tr key={skill.id} className="border-t border-border/50">
                <td className="font-medium text-foreground">{skill.name}</td>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-onyx rounded-full overflow-hidden max-w-[100px]">
                      <div className="h-full bg-primary" style={{ width: `${skill.percentage}%` }} />
                    </div>
                    <span className="text-sm text-vegas-gold">{skill.percentage}%</span>
                  </div>
                </td>
                <td>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEditModal(skill)} className="p-2 rounded-lg bg-onyx text-primary hover:bg-primary/20 transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(skill.id)} className="p-2 rounded-lg bg-onyx text-destructive hover:bg-destructive/20 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {skills.length === 0 && (
              <tr><td colSpan="3" className="text-center py-8 text-muted-foreground">No skills found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-onyx border-border text-white-2">
          <DialogHeader>
            <DialogTitle>{modalMode === 'add' ? 'Add New Skill' : 'Edit Skill'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Skill Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="bg-background border-border"
                placeholder="e.g. Web Design"
                required
              />
              {fieldErrors.name && (
                <p className="mt-1 text-xs text-destructive">{fieldErrors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="percentage">Proficiency (%)</Label>
                <span className="text-sm text-primary">{formData.percentage}%</span>
              </div>
              <Input
                id="percentage"
                name="percentage"
                type="range"
                min="0"
                max="100"
                value={formData.percentage}
                onChange={handleInputChange}
                className="accent-primary"
              />
              {fieldErrors.percentage && (
                <p className="mt-1 text-xs text-destructive">{fieldErrors.percentage}</p>
              )}
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={closeModal} className="bg-transparent border-border hover:bg-onyx">
                Cancel
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/80">
                {modalMode === 'add' ? 'Add Skill' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SkillsManager;
