const { logger } = require('../utils/logger');
const SchoolModel = require('../models/schoolModel');
const { getCurrentTenant } = require('../middleware/tenant');

/**
 * Obține toate școlile pentru tenant-ul curent
 */
const getAllSchools = async (req, res, next) => {
  try {
    const tenantId = getCurrentTenant();
    logger.info(`Obținere școli pentru tenant: ${tenantId}`);
    
    const School = await SchoolModel();
    const schools = await School.find({});
    
    res.status(200).json({
      success: true,
      count: schools.length,
      data: schools
    });
  } catch (error) {
    logger.error(`Eroare la obținerea școlilor: ${error.message}`);
    next(error);
  }
};

/**
 * Obține o școală după ID
 */
const getSchoolById = async (req, res, next) => {
  try {
    const tenantId = getCurrentTenant();
    const { id } = req.params;
    
    logger.info(`Obținere școală cu ID ${id} pentru tenant: ${tenantId}`);
    
    const School = await SchoolModel();
    const school = await School.findById(id);
    
    if (!school) {
      return res.status(404).json({
        success: false,
        message: `Școala cu ID ${id} nu a fost găsită`
      });
    }
    
    res.status(200).json({
      success: true,
      data: school
    });
  } catch (error) {
    logger.error(`Eroare la obținerea școlii: ${error.message}`);
    next(error);
  }
};

/**
 * Creează o școală nouă
 */
const createSchool = async (req, res, next) => {
  try {
    const tenantId = getCurrentTenant();
    logger.info(`Creare școală pentru tenant: ${tenantId}`);
    
    const School = await SchoolModel();
    const school = new School(req.body);
    
    // TenantId va fi setat automat de middleware-ul pre-save
    const savedSchool = await school.save();
    
    res.status(201).json({
      success: true,
      data: savedSchool
    });
  } catch (error) {
    logger.error(`Eroare la crearea școlii: ${error.message}`);
    next(error);
  }
};

/**
 * Actualizează o școală
 */
const updateSchool = async (req, res, next) => {
  try {
    const tenantId = getCurrentTenant();
    const { id } = req.params;
    
    logger.info(`Actualizare școală cu ID ${id} pentru tenant: ${tenantId}`);
    
    const School = await SchoolModel();
    const school = await School.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });
    
    if (!school) {
      return res.status(404).json({
        success: false,
        message: `Școala cu ID ${id} nu a fost găsită`
      });
    }
    
    res.status(200).json({
      success: true,
      data: school
    });
  } catch (error) {
    logger.error(`Eroare la actualizarea școlii: ${error.message}`);
    next(error);
  }
};

/**
 * Șterge o școală
 */
const deleteSchool = async (req, res, next) => {
  try {
    const tenantId = getCurrentTenant();
    const { id } = req.params;
    
    logger.info(`Ștergere școală cu ID ${id} pentru tenant: ${tenantId}`);
    
    const School = await SchoolModel();
    const school = await School.findByIdAndDelete(id);
    
    if (!school) {
      return res.status(404).json({
        success: false,
        message: `Școala cu ID ${id} nu a fost găsită`
      });
    }
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    logger.error(`Eroare la ștergerea școlii: ${error.message}`);
    next(error);
  }
};

module.exports = {
  getAllSchools,
  getSchoolById,
  createSchool,
  updateSchool,
  deleteSchool
}; 