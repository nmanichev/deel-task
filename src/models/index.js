const Sequelize = require("sequelize");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./database.sqlite3"
});

const Profile = require("./profile")(sequelize, Sequelize),
    Job = require("./job")(sequelize, Sequelize),
    Contract = require("./contract")(sequelize, Sequelize);

Profile.hasMany(Contract, { as : "Contractor", foreignKey: "ContractorId" });
Contract.belongsTo(Profile, { as: "Contractor" })
Profile.hasMany(Contract, { as : "Client", foreignKey: "ClientId" });
Contract.belongsTo(Profile, { as: "Client" })
Contract.hasMany(Job);
Job.belongsTo(Contract);

module.exports = {
    sequelize,
    Profile, 
    Contract, 
    Job 
}
  