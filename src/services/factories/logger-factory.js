const winston = require("winston");

class LoggerFactory {
    static create(){
        let level = "info";

        let transports = [
            new winston.transports.Console()
        ];

        return winston.createLogger({
            level: level,
            transports: transports
        });
    }
}

module.exports = LoggerFactory;