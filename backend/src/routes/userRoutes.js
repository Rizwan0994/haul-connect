const express = require('express');
const router = express.Router();
const { user: User  } = require('../models');
const bcrypt = require('bcrypt');
const { requireRole } = require('../middleware/auth');

// Get all users (HR/Admin only)
router.get('/', requireRole(['hr_manager', 'hr_user', 'admin_manager', 'admin_user', 'super_admin']), async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']]
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID (HR/Admin only)
router.get('/:id', requireRole(['hr_manager', 'hr_user', 'admin_manager', 'admin_user', 'super_admin']), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create new user (HR/Admin only)
router.post('/', requireRole(['hr_manager', 'admin_manager', 'admin_user', 'super_admin']), async (req, res) => {
  try {
    const { email, password, role, category, basic_salary, first_name, last_name, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      role: role || 'user',
      category,
      basic_salary: basic_salary || 500.0,
      first_name,
      last_name,
      phone
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user.toJSON();
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user (HR/Admin only)
router.put('/:id', requireRole(['hr_manager', 'admin_manager', 'admin_user', 'super_admin']), async (req, res) => {
  try {
    const { email, password, role, category, basic_salary, first_name, last_name, phone } = req.body;
    
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update fields
    const updateData = {
      email,
      role,
      category,
      basic_salary,
      first_name,
      last_name,
      phone
    };

    // Hash new password if provided
    if (password) {
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(password, saltRounds);
    }

    await user.update(updateData);

    // Return updated user without password
    const { password: _, ...userWithoutPassword } = user.toJSON();
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user (HR Manager/Admin only)
router.delete('/:id', requireRole(['hr_manager', 'admin_manager', 'super_admin']), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deletion of super admin by non-super admin
    if (user.category === 'super_admin' && req.user.category !== 'super_admin') {
      return res.status(403).json({ error: 'Only super admin can delete super admin users' });
    }

    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Update user status (activate/deactivate)
router.patch('/:id/status', requireRole(['hr_manager', 'admin_manager', 'super_admin']), async (req, res) => {
  try {
    const { is_active } = req.body;
    
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.update({ is_active });

    const { password: _, ...userWithoutPassword } = user.toJSON();
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

module.exports = router;
