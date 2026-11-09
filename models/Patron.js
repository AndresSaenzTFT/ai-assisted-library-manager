'use strict';

module.exports = (sequelize, DataTypes) => {
  const Patron = sequelize.define('Patron', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Please provide a first name.'
        },
        notEmpty: {
          msg: 'Please provide a first name.'
        }
      }
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Please provide a last name.'
        },
        notEmpty: {
          msg: 'Please provide a last name.'
        }
      }
    },
    address: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Please provide an email address.'
        },
        notEmpty: {
          msg: 'Please provide an email address.'
        }
      }
    },
    library_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: {
        name: 'patrons_library_id_unique',
        msg: 'Library ID must be unique.'
      },
      validate: {
        notNull: {
          msg: 'Please provide a library ID.'
        },
        isInt: {
          msg: 'Library ID must be an integer.'
        }
      }
    },
    zip_code: DataTypes.INTEGER
  });

  return Patron;
};
