const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { user: User, role: Role, permission: Permission } = require("../models");
const { successResponse, errorResponse } = require("../utils/responseUtils");

const register = async (req, res) => {
  try {
    const { password, email, role_id, first_name, last_name } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json(errorResponse("Email already exists"));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      password: hashedPassword,
      email,
      first_name,
      last_name,
      role_id,
    });

    // Fetch the user with role and permissions
    const userWithRole = await User.findByPk(user.id, {
      include: [
        {
          model: Role,
          as: 'userRole',
          include: [
            {
              model: Permission,
              as: 'permissions',
              through: { attributes: [] }
            }
          ]
        }
      ]
    });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.status(201).json(
      successResponse("User registered successfully", {
        user: { 
          id: user.id, 
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role_id: user.role_id,
          role_name: userWithRole.userRole?.name,
          permissions: userWithRole.userRole?.permissions || []
        },
        token,
      }),
    );
  } catch (error) {
    res.status(500).json(errorResponse("Error creating user", error.message));
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Include role and permissions in the query
    const user = await User.findOne({ 
      where: { email },
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
      return res.status(401).json(errorResponse("Invalid credentials"));
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json(errorResponse("Invalid credentials"));
    }
    
    // Check if user account is active
    if (!user.is_active) {
      return res.status(403).json(errorResponse("Account is inactive. Please contact HR."));
    }    const token = jwt.sign(
      { 
        id: user.id,
        role_id: user.role_id
      }, 
      process.env.JWT_SECRET, 
      {
        expiresIn: "24h",
      }
    );

    res.json(
      successResponse("Login successful", {
        user: { 
          id: user.id, 
          email: user.email,
          firstName: user.first_name || '',
          lastName: user.last_name || '',
          fatherName: user.fatherName || '',
          address: user.address || '',
          contact: user.contact || '',
          cnic: user.cnic || '',
          experience: user.experience || '',
          department: user.department || '',
          photoUrl: user.photoUrl || '',
          role_id: user.role_id,
          role_name: user.userRole?.name,
          permissions: user.userRole?.permissions || []
        },
        token,
      }),
    );
  } catch (error) {
    console.log("Login error:", error);
    res.status(500).json(errorResponse("Error logging in", error.message));
  }
};

const getCurrentUser = async (req, res) => {
  try {    // We need to query with the role and permissions
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'email', 'first_name', 'last_name', 'fatherName', 'address', 'contact', 'cnic', 'experience', 'department', 'photoUrl', 'is_active', 'role_id', 'createdAt', 'lastLogin', 'lastLoginIp'],
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
      return res.status(404).json(errorResponse("User not found"));
    }

    if (!user.is_active) {
      return res.status(403).json(errorResponse("Account is inactive"));
    }    // Include role name and permissions in the response
    res.json(
      successResponse("User data retrieved successfully", {
        id: user.id,
        email: user.email,
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        fatherName: user.fatherName || '',
        address: user.address || '',
        contact: user.contact || '',
        cnic: user.cnic || '',
        experience: user.experience || '',
        department: user.department || '',
        photoUrl: user.photoUrl || '',
        onboardDate: user.createdAt,
        lastLogin: user.lastLogin,
        lastLoginIp: user.lastLoginIp,
        role_id: user.role_id,
        role_name: user.userRole?.name,
        permissions: user.userRole?.permissions || []
      })
    );
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json(errorResponse("Error fetching user data", error.message));
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
};
