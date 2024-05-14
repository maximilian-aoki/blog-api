const { body } = require("express-validator");

const validator = {};

// user validators
validator.validateName = body("fullName")
  .trim()
  .exists()
  .withMessage("must include name")
  .isLength({ max: 30 })
  .withMessage("name must be less than 30 chars")
  .escape();
validator.validateEmail = body("email")
  .trim()
  .exists()
  .withMessage("must include email")
  .matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g)
  .withMessage("email must be in expected format");
validator.validatePassword = body("password")
  .exists()
  .withMessage("must include password")
  .isLength({ min: 6 })
  .withMessage("password must be at least 6 chars long")
  .escape();

// post/comment validators
validator.validateTitle = body("title")
  .trim()
  .exists()
  .withMessage("must include title");
validator.validateText = body("text")
  .trim()
  .exists()
  .withMessage("must include text");
validator.validateIsPublished = body("isPublished")
  .exists()
  .withMessage("must choose publication status")
  .isBoolean()
  .withMessage("publication status must either be true or false");

// validator pipe
validator.pipe = (validators) => {
  return async (req, res, next) => {
    for (let i = 0; i < validators.length; i += 1) {
      await validators[i].run(req);
    }
    next();
  };
};

// export
module.exports = validator;
