'use strict';

/**
 * Migration to add additional permission types
 */
const { permission: Permission } = require('../models');

module.exports = {
  /**
   * Update existing permissions to have more diverse types
   */
  up: async () => {
    try {
      // Get all permissions
      const permissions = await Permission.findAll();
      
      // Set new type categories based on patterns in the permission names
      for (const permission of permissions) {
        let newType = 'feature'; // Default type
        
        // Assign types based on patterns in permission names
        if (permission.name.includes('view') || permission.name.includes('list')) {
          newType = 'route';
        } else if (permission.name.includes('edit') || permission.name.includes('update')) {
          newType = 'column';
        }
        
        // Update the permission type
        await permission.update({ type: newType });
      }
      
      console.log('✅ Successfully updated permission types');
    } catch (error) {
      console.error('❌ Error updating permission types:', error);
      throw error;
    }
  },

  /**
   * Revert all permissions to the 'feature' type
   */
  down: async () => {
    try {
      // Reset all permissions to the 'feature' type
      await Permission.update({ type: 'feature' }, { where: {} });
      console.log('✅ Successfully reverted permission types');
    } catch (error) {
      console.error('❌ Error reverting permission types:', error);
      throw error;
    }
  }
};
