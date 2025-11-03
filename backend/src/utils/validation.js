const { validationResult } = require('express-validator');

/**
 * Middleware para manejar errores de validación
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.error('❌ Validation errors:', errors.array());
    console.error('❌ Request query:', req.query);
    console.error('❌ Request params:', req.params);
    
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: errors.array().map((error) => ({
        field: error.path || error.param,
        message: error.msg,
        value: error.value,
      })),
    });
  }
  console.log('✅ Validation passed for:', req.path);
  next();
};

module.exports = {
  validate,
};
