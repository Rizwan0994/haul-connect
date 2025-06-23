const { User, Role } = require('./src/models');

async function testRolesAndUsers() {
  try {
    console.log('🔍 Testing roles and users...');
    
    // Check all roles
    const roles = await Role.findAll();
    console.log('📋 Available roles:');
    roles.forEach(role => {
      console.log(`  - ID: ${role.id}, Name: ${role.name}`);
    });
    
    // Check users with roles
    const users = await User.findAll({
      include: [{
        model: Role,
        as: 'userRole'
      }],
      attributes: ['id', 'first_name', 'last_name', 'email', 'role_id']
    });
    
    console.log('\n👥 Users with roles:');
    users.forEach(user => {
      console.log(`  - ID: ${user.id}, Name: ${user.first_name} ${user.last_name}, Email: ${user.email}, Role: ${user.userRole?.name || 'NO ROLE'} (ID: ${user.role_id})`);
    });
    
    // Specifically check for admin users
    console.log('\n👑 Admin users:');
    const adminUsers = await User.findAll({
      include: [{
        model: Role,
        as: 'userRole',
        where: { name: 'admin' }
      }],
      attributes: ['id', 'first_name', 'last_name', 'email']
    });
    
    if (adminUsers.length === 0) {
      console.log('  ⚠️ No admin users found!');
    } else {
      adminUsers.forEach(user => {
        console.log(`  - ID: ${user.id}, Name: ${user.first_name} ${user.last_name}, Email: ${user.email}`);
      });
    }
    
    // Specifically check for manager users
    console.log('\n📋 Manager users:');
    const managerUsers = await User.findAll({
      include: [{
        model: Role,
        as: 'userRole',
        where: { name: 'manager' }
      }],
      attributes: ['id', 'first_name', 'last_name', 'email']
    });
    
    if (managerUsers.length === 0) {
      console.log('  ⚠️ No manager users found!');
    } else {
      managerUsers.forEach(user => {
        console.log(`  - ID: ${user.id}, Name: ${user.first_name} ${user.last_name}, Email: ${user.email}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testRolesAndUsers();
