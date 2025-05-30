# Role System Update

This document provides instructions on how to update the role system in the Haul Connect application to use the new role definitions.

## New Role System

The following roles will be the only roles available in the system moving forward:

1. Admin
2. Super Admin
3. Dispatch
4. Sales
5. Account
6. Manager

All other previous roles will be removed and migrated to these new roles.

## Migration Steps

### 1. Database Migration

A migration script has been prepared to update the database schema and convert existing users to the new role system. 

To run the migration:

```bash
cd backend
node src/migrations/update-roles.js
```

This script will:
- Update the database schema to use the new role enum values
- Migrate all existing users to the appropriate new roles based on a mapping
- Print progress and results to the console

### 2. Frontend Updates

The following files in the frontend have already been updated to use the new roles:

- `src/pages/user-management/index.tsx`
  - Updated `USER_CATEGORIES` and `ROLES` arrays with the new set of roles
  - Updated default form values and reset function to use 'Dispatch' as the default role

### 3. Backend Updates

The following files in the backend have been updated:

- `backend/src/models/user.model.js`
  - Updated the role and category enum definitions
  
- `backend/src/routes/userRoutes.js`
  - Updated role-based authorization middleware to use the new roles
  - Updated default role assignments

- `backend/src/controllers/authController.js`
  - Updated default role assignment for new users

## Testing Instructions

After applying all updates, please test the following functionality:

1. User registration - ensure new users get appropriate default roles
2. User login - ensure existing users can still log in
3. Role-based access control - ensure permissions work correctly with the new roles
4. User management - ensure users can be created and edited with the new roles

## Rollback Plan

If issues are encountered, a database backup should be taken before running the migration script. 

To restore from backup:

```bash
# MySQL example
mysql -u [username] -p [database_name] < backup.sql
```

Then restore the previous version of the code files.
