const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

// POST /api/accommodations/:accommodationId/images - Upload single image
router.post('/:accommodationId/images', 
    upload.single('image'), 
    async (req, res, next) => {
        const client = await pool.connect();
        
        try {
            const { accommodationId } = req.params;
            const { is_primary } = req.body;
            
            if (!req.file) {
                return res.status(400).json({ 
                    success: false,
                    error: 'No image file uploaded' 
                });
            }
            
            // Check if accommodation exists
            const accommodationCheck = await client.query(
                'SELECT id FROM accommodations WHERE id = $1',
                [accommodationId]
            );
            
            if (accommodationCheck.rows.length === 0) {
                // Delete uploaded file if accommodation doesn't exist
                fs.unlinkSync(req.file.path);
                return res.status(404).json({ 
                    success: false,
                    error: 'Accommodation not found' 
                });
            }
            
            // Generate image URL
            const imageUrl = `/uploads/accommodations/${req.file.filename}`;
            
            await client.query('BEGIN');
            
            // If this is set as primary, unset other primary images
            if (is_primary === 'true' || is_primary === true) {
                await client.query(
                    'UPDATE accommodation_images SET is_primary = false WHERE accommodation_id = $1',
                    [accommodationId]
                );
            }
            
            // Insert image record
            const result = await client.query(
                `INSERT INTO accommodation_images 
                (accommodation_id, image_url, is_primary) 
                VALUES ($1, $2, $3) 
                RETURNING *`,
                [accommodationId, imageUrl, is_primary === 'true' || is_primary === true]
            );
            
            await client.query('COMMIT');
            
            res.json({
                success: true,
                message: 'Image uploaded successfully',
                image: result.rows[0],
                fullUrl: `${req.protocol}://${req.get('host')}${imageUrl}` 
            });
            
        } catch (error) {
            await client.query('ROLLBACK');
            
            // Clean up uploaded file on error
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            
            next(error);
        } finally {
            client.release();
        }
    }
);

// POST /api/accommodations/:accommodationId/images/bulk - Upload multiple images
router.post('/:accommodationId/images/bulk',
    upload.array('images', 10), // Max 10 images
    async (req, res, next) => {
        const client = await pool.connect();
        
        try {
            const { accommodationId } = req.params;
            
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ 
                    success: false,
                    error: 'No image files uploaded' 
                });
            }
            
            // Check if accommodation exists
            const accommodationCheck = await client.query(
                'SELECT id FROM accommodations WHERE id = $1',
                [accommodationId]
            );
            
            if (accommodationCheck.rows.length === 0) {
                // Delete all uploaded files
                req.files.forEach(file => {
                    if (fs.existsSync(file.path)) {
                        fs.unlinkSync(file.path);
                    }
                });
                return res.status(404).json({ 
                    success: false,
                    error: 'Accommodation not found' 
                });
            }
            
            await client.query('BEGIN');
            
            const uploadedImages = [];
            
            for (let i = 0; i < req.files.length; i++) {
                const file = req.files[i];
                const imageUrl = `/uploads/accommodations/${file.filename}`;
                const isPrimary = i === 0; // First image is primary by default
                
                // If first image, unset other primary images
                if (isPrimary) {
                    await client.query(
                        'UPDATE accommodation_images SET is_primary = false WHERE accommodation_id = $1',
                        [accommodationId]
                    );
                }
                
                const result = await client.query(
                    `INSERT INTO accommodation_images 
                    (accommodation_id, image_url, is_primary) 
                    VALUES ($1, $2, $3) 
                    RETURNING *`,
                    [accommodationId, imageUrl, isPrimary]
                );
                
                uploadedImages.push({
                    ...result.rows[0],
                    fullUrl: `${req.protocol}://${req.get('host')}${imageUrl}` 
                });
            }
            
            await client.query('COMMIT');
            
            res.json({
                success: true,
                message: `${uploadedImages.length} images uploaded successfully`,
                images: uploadedImages,
                count: uploadedImages.length
            });
            
        } catch (error) {
            await client.query('ROLLBACK');
            
            // Clean up uploaded files on error
            if (req.files) {
                req.files.forEach(file => {
                    if (fs.existsSync(file.path)) {
                        fs.unlinkSync(file.path);
                    }
                });
            }
            
            next(error);
        } finally {
            client.release();
        }
    }
);

// GET /api/accommodations/:accommodationId/images - Get all images for an accommodation
router.get('/:accommodationId/images', async (req, res, next) => {
    try {
        const { accommodationId } = req.params;
        
        const result = await pool.query(
            `SELECT * FROM accommodation_images 
            WHERE accommodation_id = $1 
            ORDER BY is_primary DESC, created_at ASC`,
            [accommodationId]
        );
        
        const images = result.rows.map(img => ({
            ...img,
            fullUrl: `${req.protocol}://${req.get('host')}${img.image_url}` 
        }));
        
        res.json({
            success: true,
            images: images,
            count: images.length
        });
        
    } catch (error) {
        next(error);
    }
});

// PUT /api/images/:imageId/set-primary - Set an image as primary
router.put('/:imageId/set-primary', async (req, res, next) => {
    const client = await pool.connect();
    
    try {
        const { imageId } = req.params;
        
        // Get the accommodation_id for this image
        const imageResult = await client.query(
            'SELECT accommodation_id FROM accommodation_images WHERE id = $1',
            [imageId]
        );
        
        if (imageResult.rows.length === 0) {
            return res.status(404).json({ 
                success: false,
                error: 'Image not found' 
            });
        }
        
        const accommodationId = imageResult.rows[0].accommodation_id;
        
        await client.query('BEGIN');
        
        // Unset all primary images for this accommodation
        await client.query(
            'UPDATE accommodation_images SET is_primary = false WHERE accommodation_id = $1',
            [accommodationId]
        );
        
        // Set this image as primary
        await client.query(
            'UPDATE accommodation_images SET is_primary = true WHERE id = $1',
            [imageId]
        );
        
        await client.query('COMMIT');
        
        res.json({
            success: true,
            message: 'Primary image updated successfully'
        });
        
    } catch (error) {
        await client.query('ROLLBACK');
        next(error);
    } finally {
        client.release();
    }
});

// DELETE /api/images/:imageId - Delete an image
router.delete('/:imageId', async (req, res, next) => {
    try {
        const { imageId } = req.params;
        
        // Get image details first
        const result = await pool.query(
            'SELECT image_url FROM accommodation_images WHERE id = $1',
            [imageId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false,
                error: 'Image not found' 
            });
        }
        
        const imageUrl = result.rows[0].image_url;
        
        // Delete from database
        await pool.query('DELETE FROM accommodation_images WHERE id = $1', [imageId]);
        
        // Delete physical file
        const filePath = path.join(__dirname, '..', imageUrl);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        
        res.json({
            success: true,
            message: 'Image deleted successfully'
        });
        
    } catch (error) {
        next(error);
    }
});

module.exports = router;