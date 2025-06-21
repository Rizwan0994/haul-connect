const express = require('express');
const router = express.Router();
const { user: User, role: Role } = require('../models');
const bcrypt = require('bcrypt');
const { requireRole } = require('../middleware/auth');
const NotificationService = require('../services/notificationService');

// Get all users (HR/Admin only)
router.get('/',  async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Role,
          as: 'userRole',
          attributes: ['id', 'name']
        }
      ],
      order: [['created_at', 'DESC']]
    });
    
    // Format the response to include role_name for frontend compatibility
    const formattedUsers = users.map(user => {
      const userData = user.toJSON();
      return {
        ...userData,
        role_name: userData.userRole?.name || null
      };
    });
    
    res.json(formattedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID (HR/Admin only)
router.get('/:id',  async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Role,
          as: 'userRole',
          attributes: ['id', 'name']
        }
      ]
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Format the response to include role_name for frontend compatibility
    const userData = user.toJSON();
    const formattedUser = {
      ...userData,
      role_name: userData.userRole?.name || null
    };
    
    res.json(formattedUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create new user (HR/Admin only)
router.post('/',    async (req, res) => {
  try {
    const { email, password, basic_salary, first_name, last_name, phone, role_id } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      basic_salary: basic_salary || 500.0,
      first_name,
      last_name,
      role_id,
      phone
    });
    
    // Create comprehensive notifications for user creation
    try {
      // Notify the creator
      if (req.user && req.user.id) {
        await NotificationService.createForUser(
          req.user.id,
          `You created a new user: ${first_name} ${last_name} (${email})`,
          'info',
          `/user-management/${user.id}`
        );
      }
      
      // Notify all admin users about new user creation
      await NotificationService.createForAdmins(
        `New user created: ${first_name} ${last_name} (${email}) by ${req.user?.first_name || 'Admin'}`,
        'info',
        `/user-management/${user.id}`
      );
      
      // Create welcome notification for the new user
      await NotificationService.createForUser(
        user.id,
        `Welcome to Haul Connect! Your account has been created successfully.`,
        'success',
        `/dashboard`
      );
    } catch (notifError) {
      console.error("Failed to create user notification:", notifError);
      // Don't fail the request if notification creation fails
    }    // Return user without password but with role information
    const userWithRole = await User.findByPk(user.id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Role,
          as: 'userRole',
          attributes: ['id', 'name']
        }
      ]
    });
    
    const userData = userWithRole.toJSON();
    const responseData = {
      ...userData,
      role_name: userData.userRole?.name || null
    };
    
    res.status(201).json(responseData);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user (HR/Admin only)
router.put('/:id',    async (req, res) => {
  try {
    const { email, password, role_id, basic_salary, first_name, last_name, phone } = req.body;
    
    const user = await User.findByPk(req.params.id, {
      include: [
        {
          model: Role,
          as: 'userRole',
          attributes: ['id', 'name']
        }
      ]
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Store original values for comparison
    const originalEmail = user.email;
    const originalRoleId = user.role_id;
    const originalRoleName = user.userRole?.name;
    const originalName = `${user.first_name || ''} ${user.last_name || ''}`.trim();

    // Update fields
    const updateData = {
      email,
      basic_salary,
      first_name,
      last_name,
      phone,
      role_id
    };

    // Hash new password if provided
    if (password) {
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(password, saltRounds);
    }

    await user.update(updateData);

    // Get the updated user with role information
    const updatedUser = await User.findByPk(user.id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Role,
          as: 'userRole',
          attributes: ['id', 'name']
        }
      ]
    });

    // Create notifications for significant changes
    try {
      const newName = `${first_name || ''} ${last_name || ''}`.trim();
      const newRoleName = updatedUser.userRole?.name;
      const changes = [];
      
      if (originalEmail !== email) changes.push(`email changed from ${originalEmail} to ${email}`);
      if (originalRoleId !== role_id && originalRoleName !== newRoleName) {
        changes.push(`role changed from ${originalRoleName || 'No role'} to ${newRoleName || 'No role'}`);
      }
      if (originalName !== newName) changes.push(`name changed from ${originalName} to ${newName}`);
      if (password) changes.push('password updated');

      if (changes.length > 0) {
        // Notify the updater
        if (req.user && req.user.id) {
          await NotificationService.createForUser(
            req.user.id,
            `You updated user ${newName || email}: ${changes.join(', ')}`,
            'info',
            `/user-management/${user.id}`
          );
        }

        // Notify all admin users about user updates
        await NotificationService.createForAdmins(
          `User ${newName || email} updated by ${req.user?.first_name || 'Admin'}: ${changes.join(', ')}`,
          'info',
          `/user-management/${user.id}`
        );

        // Notify the user if their profile was updated by someone else
        if (req.user.id !== user.id) {
          await NotificationService.createForUser(
            user.id,
            `Your profile has been updated: ${changes.join(', ')}`,
            'info',
            `/profile`
          );
        }
      }
    } catch (notifError) {
      console.error("Failed to create user update notification:", notifError);
    }

    // Format the response to include role_name for frontend compatibility
    const userData = updatedUser.toJSON();
    const responseData = {
      ...userData,
      role_name: userData.userRole?.name || null
    };
    
    res.json(responseData);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user (HR Manager/Admin only)
router.delete('/:id',    async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [
        {
          model: Role,
          as: 'userRole',
          attributes: ['id', 'name']
        }
      ]
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deletion of super admin by non-super admin
    const currentUserRole = req.user?.role_name;
    const targetUserRole = user.userRole?.name;
    
    if (targetUserRole === 'Super Admin' && currentUserRole !== 'Super Admin') {
      return res.status(403).json({ error: 'Only Super Admin can delete Super Admin users' });
    }

    const deletedUserName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;

    await user.destroy();

    // Create notifications for user deletion
    try {
      // Notify the deleter
      if (req.user && req.user.id) {
        await NotificationService.createForUser(
          req.user.id,
          `You deleted user: ${deletedUserName}`,
          'warning',
          `/user-management`
        );
      }

      // Notify all admin users about user deletion
      await NotificationService.createForAdmins(
        `User ${deletedUserName} was deleted by ${req.user?.first_name || 'Admin'}`,
        'warning',
        `/user-management`
      );
    } catch (notifError) {
      console.error("Failed to create user deletion notification:", notifError);
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Update user status (activate/deactivate)
router.patch('/:id/status',    async (req, res) => {
  try {
    const { is_active } = req.body;
    
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if status is actually changing
    const statusChanging = user.is_active !== is_active;
    
    await user.update({ is_active });
      // Create notification if status changed
    if (statusChanging) {
      try {
        const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;
        
        // Notify the user who made the change
        if (req.user && req.user.id) {
          await NotificationService.createForUser(
            req.user.id,
            `You ${is_active ? 'activated' : 'deactivated'} user: ${userName}`,
            is_active ? 'success' : 'warning',
            `/user-management/${user.id}`
          );
        }
        
        // Notify all admin users about status change
        await NotificationService.createForAdmins(
          `User ${userName} was ${is_active ? 'activated' : 'deactivated'} by ${req.user?.first_name || 'Admin'}`,
          is_active ? 'success' : 'warning',
          `/user-management/${user.id}`
        );
        
        // Notify the user whose status changed
        if (is_active) {
          await NotificationService.createForUser(
            user.id,
            `Your account has been activated. You can now access the system.`,
            'success',
            `/dashboard`
          );
        } else {
          await NotificationService.createForUser(
            user.id,
            `Your account has been deactivated. Please contact an administrator if you believe this is an error.`,
            'warning',
            `/dashboard`
          );
        }
      } catch (notifError) {
        console.error("Failed to create user status notification:", notifError);
        // Don't fail the request if notification creation fails
      }
    }

    const { password: _, ...userWithoutPassword } = user.toJSON();
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

module.exports = router;
