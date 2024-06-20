import sequelize from "./sequelize";

after(async () => {
  await sequelize.close();
});