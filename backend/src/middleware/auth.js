const jwt = require("jsonwebtoken");
const { user: User, role: Role, permission: Permission, role_permission: RolePermission } = require("../models");

const authenticateToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        status: "error",
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id, {
      include: [
        {
          model: Role,
          as: 'userRole',
          include: [
            {
              model: Permission,
              as: 'permissions',
              through: { attributes: [] } // Don't include the join table
            }
          ]
        }
      ]
    });

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "User not found",
      });
    }
    
    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({
        status: "error",
        message: "User account is inactive",
      });
    }

    // Attach user and permissions to request
    req.user = user;
    req.userPermissions = user.userRole?.permissions?.map(p => p.name) || [];
    next();
  } catch (error) {
    res.status(401).json({
      status: "error",
      message: "Invalid token",
    });
  }
};

/**
 * Middleware to check if user has required role
 * @param {Array} allowedRoles - Array of allowed roles/categories
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required",
      });
    }

    // For backward compatibility - check both role_id (via userRole) and category
    const userRoleName = req.user.userRole?.name;
    const legacyRole = req.user.category || req.user.role;
    
    if (
      (userRoleName && allowedRoles.includes(userRoleName)) || 
      (legacyRole && allowedRoles.includes(legacyRole))
    ) {
      return next();
    }

    return res.status(403).json({
      status: "error",
      message: "Access denied: Insufficient permissions",
    });
  };
};

/**
 * Middleware to check if user has required permission
 * @param {String|Array} requiredPermissions - Permission name or array of permission names
 */
const requirePermission = (requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required",
      });
    }

    const permissionsArray = Array.isArray(requiredPermissions) 
      ? requiredPermissions 
      : [requiredPermissions];
    
    // Super Admin role bypasses permission checks (check both new role system and legacy category)
    if (req.user.userRole?.name === 'Super Admin' || req.user.category === 'Super Admin' || req.user.role === 'Super Admin') {
      return next();
    }
    
    // Check if user has any of the required permissions
    const hasPermission = permissionsArray.some(permission => 
      req.userPermissions.includes(permission)
    );

    if (!hasPermission) {
      return res.status(403).json({
        status: "error",
        message: "Access denied: Insufficient permissions",
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  requireRole,
  requirePermission
};
