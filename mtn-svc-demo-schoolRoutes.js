const express = require('express');
const router = express.Router();
const schoolController = require('../controllers/schoolController');

/**
 * @swagger
 * /api/schools:
 *   get:
 *     summary: Obține toate școlile pentru tenant-ul curent
 *     tags: [Schools]
 *     responses:
 *       200:
 *         description: Listă de școli
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/School'
 */
router.get('/', schoolController.getAllSchools);

/**
 * @swagger
 * /api/schools/{id}:
 *   get:
 *     summary: Obține o școală după ID
 *     tags: [Schools]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID-ul școlii
 *     responses:
 *       200:
 *         description: Școala a fost găsită
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/School'
 *       404:
 *         description: Școala nu a fost găsită
 */
router.get('/:id', schoolController.getSchoolById);

/**
 * @swagger
 * /api/schools:
 *   post:
 *     summary: Creează o școală nouă
 *     tags: [Schools]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SchoolInput'
 *     responses:
 *       201:
 *         description: Școala a fost creată cu succes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/School'
 */
router.post('/', schoolController.createSchool);

/**
 * @swagger
 * /api/schools/{id}:
 *   put:
 *     summary: Actualizează o școală
 *     tags: [Schools]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID-ul școlii
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SchoolInput'
 *     responses:
 *       200:
 *         description: Școala a fost actualizată cu succes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/School'
 *       404:
 *         description: Școala nu a fost găsită
 */
router.put('/:id', schoolController.updateSchool);

/**
 * @swagger
 * /api/schools/{id}:
 *   delete:
 *     summary: Șterge o școală
 *     tags: [Schools]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID-ul școlii
 *     responses:
 *       200:
 *         description: Școala a fost ștearsă cu succes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       404:
 *         description: Școala nu a fost găsită
 */
router.delete('/:id', schoolController.deleteSchool);

module.exports = router; 