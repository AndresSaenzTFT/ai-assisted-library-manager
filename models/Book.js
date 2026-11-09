'use strict';

module.exports = (sequelize, DataTypes) => {
  const Book = sequelize.define('Book', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Please provide a title for the book.'
        },
        notEmpty: {
          msg: 'Please provide a title for the book.'
        }
      }
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Please provide an author for the book.'
        },
        notEmpty: {
          msg: 'Please provide an author for the book.'
        }
      }
    },
    genre: DataTypes.STRING,
    first_published: DataTypes.INTEGER
  });

  return Book;
};
