# Route Permissions System 

This document describes the route permission system implementation in HaulConnect.

## Overview

The permission system now includes three types of permissions:
1. **Feature permissions** - Control access to specific features/actions
2. **Route permissions** - Control visibility of menu items and access to pages
3. **Column permissions** - (Reserved for future use) Will control visibility of table columns

## Permission Types Explained

### Feature Permissions
Feature permissions control what actions a user can perform, such as viewing, creating, editing, or deleting resources. For example:
- `users.view` - Allows viewing user information
- `dispatch.create` - Allows creating dispatches

### Route Permissions
Route permissions control which pages a user can access in the application. These permissions directly affect sidebar menu visibility. For example:
- `route.dashboard` - Allows access to the dashboard
- `route.carrier-profiles` - Allows access to carrier profiles page

### Column Permissions (Future Use)
Column permissions will control which specific data fields/columns a user can view in tables and forms.

## Implementation Details

### Backend
- Permissions are stored in the `permissions` table with a `type` field that can be 'feature', 'route', or 'column'
- The permission seeder (`01-permission-seeder.js`) creates default feature permissions
- Route permissions are created by the `04-route-permissions-seeder.js` seeder
- Roles are granted permissions through the `02-role-seeder.js` role seeder

### Frontend
- The sidebar (`app-sidebar.tsx`) checks route permissions to determine menu visibility
- The permissions page (`src/pages/settings/permissions.tsx`) allows filtering permissions by type
- The route permissions use the naming convention `route.{page-name}` for consistency

## How to Use

### Managing Permissions
1. Go to Settings > Permissions
2. Select a role to modify
3. Use the "Permission Type" filter to view permissions by type:
   - Choose "feature" to manage feature permissions
   - Choose "route" to manage route permissions
4. Toggle permissions on/off for the selected role

### Adding New Route Permissions
When adding new routes to the application:

1. Add a new route permission in `04-route-permissions-seeder.js`
2. Update the sidebar item to include the `requiresPermission` property with the route permission name
3. Assign the permission to appropriate roles in `02-role-seeder.js`
4. Run the seeders to create the new permission: `node run-seeders.js`

## Troubleshooting

If a user can't access a page or see a menu item:
1. Verify they have the correct role
2. Check if the role has the necessary route permission
3. Ensure the sidebar item is configured with the correct `requiresPermission` property
