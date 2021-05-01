const AuthenticationError = require("../errors/authentication-error");

module.exports = async (req, res, next) => {
        let logger = req.app.get("logger");

        if (!req.headers.profile) {
            logger.warn("Can't find profile in headers.");

            return next(new AuthenticationError()
                            .addError("Can't find profile in headers."));
          }
    
          logger.info("Checking if profile exists.");

          const { Profile } = req.app.get("models");
          
          try {
            let profile = await Profile.findByPk(req.headers.profile);

            if(!profile){
              logger.warn(`Can't find profile ${req.headers.profile} in the database.`);

              return next(new AuthenticationError()
                  .addError(`Can't find profile ${req.headers.profile} in the database.`));
            }

            req.profile = profile;

            logger.info("Profile is verified.");
    
            return next();
          } 
          catch(error) {
            logger.warn("An error occured while verifying profile.");

            return next(new AuthenticationError()
                            .addError("An error occured while verifying profile.")
                            .causedBy(error));
          }
  }