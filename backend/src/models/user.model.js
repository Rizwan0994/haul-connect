//below sample model structure that must be followe in this project:
// 'use strict';
// const {
//     Model, DataTypes
// } = require('sequelize');

// module.exports = (sequelize) => {
//     class Announcement extends Model {
//         /**
//          * Helper method for defining associations.
//          * This method is not a part of Sequelize lifecycle.
//          * The `models/index` file will call this method automatically.
//          */
//         static associate(models) {
//             // define association here
//         }
        
//     }
//     Announcement.init({
//         title:DataTypes.STRING,
//         description: DataTypes.TEXT,
//         // image: DataTypes.STRING,
//         createdBy: {
//             type: DataTypes.INTEGER,
//             allowNull: true,
//         },
//         duration: DataTypes.DATE,
//         toEveryone:{
//             type:  DataTypes.BOOLEAN,
//             defaultValue: false
//         },
//         // designations: {
//         //     type: DataTypes.ARRAY(DataTypes.INTEGER),
//         // }
//     }, {
//         sequelize,
//         modelName: 'announcement',
//         timestamps: true,
//     });
//     return Announcement;
// };