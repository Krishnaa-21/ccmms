import bcrypt from 'bcryptjs';
import { userRepo, complaintRepo, auditLogRepo } from '../repositories/index.js';

export const userService = {
  async getUsers({ search, role, status, page = 1, limit = 20 }) {
    let users = await userRepo.findAll();

    if (search) {
      const q = search.toLowerCase();
      users = users.filter((u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.department && u.department.toLowerCase().includes(q))
      );
    }

    if (role) {
      users = users.filter((u) => u.role === role);
    }

    if (status !== undefined) {
      const isActive = status === 'active' || status === 'true';
      users = users.filter((u) => u.isActive === isActive);
    }

    // Sort newest first
    users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = users.length;
    const startIndex = (page - 1) * limit;
    const paginated = users.slice(startIndex, startIndex + limit);

    // Strip passwords
    const safeUsers = paginated.map(({ password, ...u }) => u);

    return {
      users: safeUsers,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  async getUserById(id) {
    const user = await userRepo.findById(id);
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }
    const { password, ...safeUser } = user;
    return safeUser;
  },

  async createUser(data, actor) {
    const existing = await userRepo.findByEmail(data.email);
    if (existing) {
      const err = new Error('A user with this email address already exists');
      err.statusCode = 409;
      throw err;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const newUser = await userRepo.create({
      name: data.name,
      email: data.email.toLowerCase(),
      password: passwordHash,
      phone: data.phone || '',
      role: data.role,
      department: data.department,
      specialty: data.specialty || (data.role === 'staff' ? 'General' : undefined),
      isAvailable: data.isAvailable !== undefined ? data.isAvailable : true,
      avatarColor: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
      isActive: true,
      tokenVersion: 1
    });

    await auditLogRepo.create({
      action: 'USER_CREATED',
      entityType: 'User',
      entityId: newUser.id,
      actor: { id: actor.id, name: actor.name, role: actor.role },
      details: `Created new user ${newUser.name} with role ${newUser.role}`
    });

    const { password, ...safeUser } = newUser;
    return safeUser;
  },

  async updateUser(id, updates, actor) {
    const user = await userRepo.findById(id);
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }

    // If changing role away from admin, check if last admin
    if (updates.role && updates.role !== 'admin' && user.role === 'admin') {
      const allAdmins = (await userRepo.findAll()).filter((u) => u.role === 'admin' && u.isActive);
      if (allAdmins.length <= 1) {
        const err = new Error('Cannot change role: System requires at least one active administrator.');
        err.statusCode = 400;
        throw err;
      }
    }

    const updated = await userRepo.update(id, updates);

    await auditLogRepo.create({
      action: 'USER_UPDATED',
      entityType: 'User',
      entityId: id,
      actor: { id: actor.id, name: actor.name, role: actor.role },
      details: `Updated profile details for user ${user.name}`
    });

    const { password, ...safeUser } = updated;
    return safeUser;
  },

  async updateUserStatus(id, isActive, actor) {
    const user = await userRepo.findById(id);
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }

    // Invariant: Prevent deactivating the last active admin
    if (!isActive && user.role === 'admin') {
      const allAdmins = (await userRepo.findAll()).filter((u) => u.role === 'admin' && u.isActive);
      if (allAdmins.length <= 1) {
        const err = new Error('Cannot deactivate the last active administrator.');
        err.statusCode = 400;
        throw err;
      }
    }

    const updated = await userRepo.update(id, { isActive });

    await auditLogRepo.create({
      action: isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
      entityType: 'User',
      entityId: id,
      actor: { id: actor.id, name: actor.name, role: actor.role },
      details: `${isActive ? 'Activated' : 'Deactivated'} account for ${user.name}`
    });

    const { password, ...safeUser } = updated;
    return safeUser;
  },

  async deleteUser(id, actor) {
    const user = await userRepo.findById(id);
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }

    // Invariant: Prevent deleting the last active admin
    if (user.role === 'admin') {
      const allAdmins = (await userRepo.findAll()).filter((u) => u.role === 'admin');
      if (allAdmins.length <= 1) {
        const err = new Error('Cannot delete the last administrator.');
        err.statusCode = 400;
        throw err;
      }
    }

    // Invariant: Prevent deleting staff with active tasks without reassignment
    if (user.role === 'staff') {
      const activeTasks = await complaintRepo.findWhere((c) => {
        return c.assignedTo?.id === id && ['Assigned', 'In Progress', 'Awaiting Parts'].includes(c.status);
      });

      if (activeTasks.length > 0) {
        const err = new Error(
          `Cannot delete maintenance staff with ${activeTasks.length} active work order(s). Please reassign tasks first.`
        );
        err.statusCode = 400;
        throw err;
      }
    }

    await userRepo.delete(id);

    await auditLogRepo.create({
      action: 'USER_DELETED',
      entityType: 'User',
      entityId: id,
      actor: { id: actor.id, name: actor.name, role: actor.role },
      details: `Permanently deleted user account ${user.name} (${user.email})`
    });

    return { message: `User ${user.name} deleted successfully` };
  }
};

export default userService;
