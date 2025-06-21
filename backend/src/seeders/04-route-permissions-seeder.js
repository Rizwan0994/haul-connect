'use strict';

/**
 * Route Permissions Seeder
 * 
 * This seeder adds route-level permissions for controlling access to different parts of the application.
 * It will create permissions that control visibility of sidebar menu items.
 */

const { sequelize } = require('../models');
const { QueryTypes } = require('sequelize');

// Define route permissions based on sidebar menu structure
const routePermissions = [
  // Dashboard route
  {
    name: 'route.dashboard',
    type: 'route',
    module: 'Navigation',
    resource: 'dashboard',
    action: 'view',
    description: 'Access to Dashboard page'
  },
  
  // Messages route
  {
    name: 'route.messages',
    type: 'route',
    module: 'Navigation',
    resource: 'messages',
    action: 'view',
    description: 'Access to Messages page'
  },
  
  // Calendar route
  {
    name: 'route.calendar',
    type: 'route',
    module: 'Navigation',
    resource: 'calendar',
    action: 'view',
    description: 'Access to Calendar page'
  },
  
  // Carrier Management routes
  {
    name: 'route.carrier-profiles',
    type: 'route',
    module: 'Navigation',
    resource: 'carrier-management',
    action: 'view',
    description: 'Access to Carrier Profiles page'
  },
  {
    name: 'route.add-carrier',
    type: 'route',
    module: 'Navigation',
    resource: 'carrier-management',
    action: 'create',
    description: 'Access to Add New Carrier page'
  },
  {
    name: 'route.followup-sheets',
    type: 'route',
    module: 'Navigation',
    resource: 'carrier-management',
    action: 'view-followup',
    description: 'Access to Carrier Followup Sheets'
  },
  
  // Dispatch Management routes
  {
    name: 'route.active-dispatches',
    type: 'route',
    module: 'Navigation',
    resource: 'dispatch-management',
    action: 'view',
    description: 'Access to Active Dispatches page'
  },
  {
    name: 'route.create-dispatch',
    type: 'route',
    module: 'Navigation',
    resource: 'dispatch-management',
    action: 'create',
    description: 'Access to Create Dispatch page'
  },
  
  // Invoices route
  {
    name: 'route.invoices',
    type: 'route',
    module: 'Navigation',
    resource: 'invoices',
    action: 'view',
    description: 'Access to Invoices page'
  },
  
  // User Management route
  {
    name: 'route.user-management',
    type: 'route',
    module: 'Navigation',
    resource: 'user-management',
    action: 'view',
    description: 'Access to User Management page'
  },
    // Settings routes
  {
    name: 'route.email-settings',
    type: 'route',
    module: 'Navigation',
    resource: 'settings',
    action: 'view-smtp',
    description: 'Access to Email Settings page'
  },
  {
    name: 'route.permissions',
    type: 'route',
    module: 'Navigation',
    resource: 'settings',
    action: 'view-permissions',
    description: 'Access to Permissions Management page'
  },
  
  // Contact Management routes - MISSING PERMISSIONS
  {
    name: 'route.brokers',
    type: 'route',
    module: 'Navigation',
    resource: 'contact-management',
    action: 'view-brokers',
    description: 'Access to Broker Management page'
  },
  {
    name: 'route.shippers',
    type: 'route',
    module: 'Navigation',
    resource: 'contact-management',
    action: 'view-shippers', 
    description: 'Access to Shipper Management page'
  },
  {
    name: 'route.consignees',
    type: 'route',
    module: 'Navigation',
    resource: 'contact-management',
    action: 'view-consignees',
    description: 'Access to Consignee Management page'
  },
  
  // Commission Management route - MISSING PERMISSION
  {
    name: 'route.commission-management',
    type: 'route',
    module: 'Navigation',
    resource: 'commission-management',
    action: 'view',
    description: 'Access to Commission Management page'
  },
  
  // Employee Attendance route - MISSING PERMISSION  
  {
    name: 'route.attendance-records',
    type: 'route',
    module: 'Navigation',
    resource: 'employee-attendance',
    action: 'view',
    description: 'Access to Employee Attendance page'
  },
  
  // Approval routes - MISSING PERMISSIONS
  {
    name: 'carrier.approval.view',
    type: 'route',
    module: 'Navigation', 
    resource: 'carrier-approvals',
    action: 'view',
    description: 'Access to Carrier Approvals page'
  },
  {
    name: 'dispatch.approval.view',
    type: 'route',
    module: 'Navigation',
    resource: 'dispatch-approvals', 
    action: 'view',
    description: 'Access to Dispatch Approvals page'
  }
];

// Check if permission exists and create if missing
async function ensurePermission(permission) {
  try {
    // Check if permission already exists
    const existingPermission = await sequelize.query(
      "SELECT * FROM permissions WHERE name = :name",
      {
        replacements: { name: permission.name },
        type: QueryTypes.SELECT
      }
    );
    
    if (existingPermission.length === 0) {
      // Create the permission
      await sequelize.query(`
        INSERT INTO permissions (name, type, module, resource, action, description, created_at, updated_at)
        VALUES (:name, :type, :module, :resource, :action, :description, NOW(), NOW())
      `, {
        replacements: {
          name: permission.name,
          type: permission.type,
          module: permission.module,
          resource: permission.resource,
          action: permission.action,
          description: permission.description
        },
        type: QueryTypes.INSERT
      });
      
      console.log(`Created route permission: ${permission.name}`);
      return true; // Permission was created
    }
    
    return false; // Permission already existed
  } catch (error) {
    console.error(`Failed to ensure route permission ${permission.name}:`, error);
    throw error;
  }
}

// Seeder name should be unique
const name = 'route-permissions-seeder';

// Main seeder function
async function up() {
  try {
    console.log('Creating route permissions...');
    
    let created = 0;
    for (const permission of routePermissions) {
      const wasCreated = await ensurePermission(permission);
      if (wasCreated) created++;
    }
    
    console.log(`Route permissions seeder completed: ${created} new permissions created, ${routePermissions.length - created} already existed`);
  } catch (error) {
    console.error('Route permissions seeder failed:', error);
    throw error;
  }
}

// Function to check if the seeder should run
async function shouldRun() {
  return true;
}

module.exports = {
  name,
  up,
  shouldRun
};
