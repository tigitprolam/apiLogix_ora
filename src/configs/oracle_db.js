module.exports = {
    logixPool: {
        ora_bd_version: 11,
        user: process.env.ORA_USER,
        password: process.env.ORA_PASSWORD,
        connectString: process.env.ORA_CONNECTIONSTRING,
        poolMin: 10,
        poolMax: 10,
        poolIncrement: 0
    }
}
