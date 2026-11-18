import { settingsRepo, categoryRepo, auditLogRepo } from '../repositories/index.js';

export const settingsService = {
  async getSettings() {
    const [settings, categories] = await Promise.all([
      settingsRepo.getSettings(),
      categoryRepo.findAll()
    ]);

    return {
      settings,
      categories
    };
  },

  async updateSettings(updates, actor) {
    const updated = await settingsRepo.updateSettings(updates);

    await auditLogRepo.create({
      action: 'SETTINGS_UPDATED',
      entityType: 'Settings',
      entityId: updated.id,
      actor: { id: actor.id, name: actor.name, role: actor.role },
      details: `Admin ${actor.name} modified campus settings (SLA thresholds / auto-assignment)`
    });

    return updated;
  },

  async createCategory(data, actor) {
    const existing = await categoryRepo.findByName(data.name);
    if (existing) {
      const err = new Error(`Category "${data.name}" already exists`);
      err.statusCode = 409;
      throw err;
    }

    const newCat = await categoryRepo.create({
      name: data.name,
      code: data.code || data.name.slice(0, 3).toUpperCase(),
      description: data.description || '',
      icon: data.icon || 'Wrench',
      color: data.color || '#3b82f6',
      subCategories: data.subCategories || [],
      slaHours: data.slaHours || { Urgent: 4, High: 12, Medium: 24, Low: 48 },
      isActive: true
    });

    await auditLogRepo.create({
      action: 'CATEGORY_CREATED',
      entityType: 'Category',
      entityId: newCat.id,
      actor: { id: actor.id, name: actor.name, role: actor.role },
      details: `Created new category: ${newCat.name}`
    });

    return newCat;
  },

  async updateCategory(id, updates, actor) {
    const cat = await categoryRepo.findById(id);
    if (!cat) {
      const err = new Error('Category not found');
      err.statusCode = 404;
      throw err;
    }

    const updated = await categoryRepo.update(id, updates);

    await auditLogRepo.create({
      action: 'CATEGORY_UPDATED',
      entityType: 'Category',
      entityId: id,
      actor: { id: actor.id, name: actor.name, role: actor.role },
      details: `Updated category details for ${cat.name}`
    });

    return updated;
  },

  async deleteCategory(id, actor) {
    const cat = await categoryRepo.findById(id);
    if (!cat) {
      const err = new Error('Category not found');
      err.statusCode = 404;
      throw err;
    }

    await categoryRepo.delete(id);

    await auditLogRepo.create({
      action: 'CATEGORY_DELETED',
      entityType: 'Category',
      entityId: id,
      actor: { id: actor.id, name: actor.name, role: actor.role },
      details: `Deleted category: ${cat.name}`
    });

    return { message: `Category ${cat.name} deleted successfully` };
  }
};

export default settingsService;
