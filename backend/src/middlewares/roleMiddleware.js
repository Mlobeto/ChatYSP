const moderatorMiddleware = (req, res, next) => {
  if (!['moderator', 'admin'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requieren permisos de moderador o administrador.',
    });
  }
  next();
};

const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requieren permisos de administrador.',
    });
  }
  next();
};

const countryMiddleware = (req, res, next) => {
  // Allow admin to access all countries
  if (req.user.role === 'admin') {
    return next();
  }

  // For moderators, check if they have access to the requested country
  const requestedCountry = req.query.country || req.body.country || req.params.country;

  if (req.user.role === 'moderator' && requestedCountry && requestedCountry !== req.user.country) {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Solo puedes moderar contenido de tu país.',
    });
  }

  next();
};

module.exports = {
  moderatorMiddleware,
  adminMiddleware,
  countryMiddleware,
};
