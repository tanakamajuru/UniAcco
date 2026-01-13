const pool = require('../config/database');
const upload = require('../middleware/upload');

const normalizeAmenityFlag = (value) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const trimmed = value.trim().toLowerCase();
    if (trimmed === 'true') return true;
    if (trimmed === 'false') return false;
    if (trimmed === '1') return true;
    if (trimmed === '0') return false;
  }
  return Boolean(value);
};

const parseAmenitiesInput = (amenities) => {
  if (amenities === undefined || amenities === null) return null;
  if (typeof amenities === 'string') {
    try {
      return JSON.parse(amenities);
    } catch {
      return null;
    }
  }
  if (typeof amenities === 'object') return amenities;
  return null;
};

const pickAmenity = (obj, snakeKey, camelKey) => {
  if (!obj || typeof obj !== 'object') return { exists: false, value: undefined };
  if (Object.prototype.hasOwnProperty.call(obj, snakeKey)) {
    return { exists: true, value: normalizeAmenityFlag(obj[snakeKey]) };
  }
  if (camelKey && Object.prototype.hasOwnProperty.call(obj, camelKey)) {
    return { exists: true, value: normalizeAmenityFlag(obj[camelKey]) };
  }
  return { exists: false, value: undefined };
};

// @desc    Get all accommodations
// @route   GET /api/accommodations
// @access  Public
const getAccommodations = async (req, res) => {
  try {
    const { city, minPrice, maxPrice, people } = req.query;
    let query = `
      SELECT 
        a.*, 
        u.first_name as landlord_first_name, 
        u.last_name as landlord_last_name,
        u.email as landlord_email,
        u.phone as landlord_phone,
        COALESCE(
          json_build_object(
            'wifi', COALESCE(aa.wifi, false),
            'furnished', COALESCE(aa.furnished, false),
            'parking', COALESCE(aa.parking, false),
            'laundry', COALESCE(aa.laundry, false),
            'kitchen', COALESCE(aa.kitchen, false),
            'heating', COALESCE(aa.heating, false),
            'tv', COALESCE(aa.tv, false),
            'pets_allowed', COALESCE(aa.pets_allowed, false),
            'smoking_allowed', COALESCE(aa.smoking_allowed, false)
          )::jsonb,
          '{"wifi":false,"furnished":false,"parking":false,"laundry":false,"kitchen":false,"heating":false,"tv":false,"pets_allowed":false,"smoking_allowed":false}'::jsonb
        ) as amenities,
        COALESCE(
          (SELECT json_agg(ai.image_url) 
           FROM accommodation_images ai 
           WHERE ai.accommodation_id = a.id 
           GROUP BY ai.accommodation_id),
          '[]'::json
        ) as images
      FROM accommodations a
      JOIN users u ON a.landlord_id = u.id
      LEFT JOIN accommodation_amenities aa ON a.id = aa.accommodation_id
      WHERE a.is_available = true
    `;
    
    const queryParams = [];
    let paramCount = 1;

    if (city) {
      query += ` AND LOWER(a.city) LIKE $${paramCount}`;
      queryParams.push(`%${city.toLowerCase()}%`);
      paramCount++;
    }

    if (minPrice) {
      query += ` AND a.price_per_month >= $${paramCount}`;
      queryParams.push(Number(minPrice));
      paramCount++;
    }

    if (maxPrice) {
      query += ` AND a.price_per_month <= $${paramCount}`;
      queryParams.push(Number(maxPrice));
      paramCount++;
    }

    if (people) {
      query += ` AND a.people_per_room >= $${paramCount}`;
      queryParams.push(Number(people));
      paramCount++;
    }

    // Add ORDER BY
    query += `
      GROUP BY a.id, u.id, aa.id
      ORDER BY a.created_at DESC
    `;

    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching accommodations:', error);
    res.status(500).json({ error: 'Server error while fetching accommodations' });
  }
};

// @desc    Get single accommodation
// @route   GET /api/accommodations/:id
// @access  Public
const getAccommodationById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT 
        a.*, 
        u.first_name as landlord_first_name, 
        u.last_name as landlord_last_name,
        u.email as landlord_email,
        u.phone as landlord_phone,
        COALESCE(
          json_build_object(
            'wifi', COALESCE(aa.wifi, false),
            'furnished', COALESCE(aa.furnished, false),
            'parking', COALESCE(aa.parking, false),
            'laundry', COALESCE(aa.laundry, false),
            'kitchen', COALESCE(aa.kitchen, false),
            'heating', COALESCE(aa.heating, false),
            'tv', COALESCE(aa.tv, false),
            'pets_allowed', COALESCE(aa.pets_allowed, false),
            'smoking_allowed', COALESCE(aa.smoking_allowed, false)
          )::jsonb,
          '{"wifi":false,"furnished":false,"parking":false,"laundry":false,"kitchen":false,"heating":false,"tv":false,"pets_allowed":false,"smoking_allowed":false}'::jsonb
        ) as amenities,
        COALESCE(
          (SELECT json_agg(ai.image_url) 
           FROM accommodation_images ai 
           WHERE ai.accommodation_id = a.id),
          '[]'::json
        ) as images
      FROM accommodations a
      JOIN users u ON a.landlord_id = u.id
      LEFT JOIN accommodation_amenities aa ON a.id = aa.accommodation_id
      WHERE a.id = $1
      GROUP BY a.id, u.id, aa.id
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Accommodation not found' });
    }
  } catch (error) {
    console.error('Error fetching accommodation:', error);
    res.status(500).json({ error: 'Server error while fetching accommodation' });
  }
};

// @desc    Create accommodation
// @route   POST /api/accommodations
// @access  Private/Landlord
const createAccommodation = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Handle file uploads
    const uploadedFiles = req.files || [];
    const imageUrls = [];
    
    console.log('Uploaded files:', uploadedFiles); // Debug log
    console.log('Request body:', req.body); // Debug log
    
    // Process uploaded files
    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i];
      const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
      imageUrls.push(imageUrl);
    }

    // Also handle any existing URLs from form data
    const { 
      title, 
      description, 
      address, 
      city, 
      postal_code, 
      latitude, 
      longitude, 
      price_per_month, 
      deposit_amount, 
      available_from, 
      available_to, 
      people_per_room,
      amenities,
      images: existingImages
    } = req.body;

    // Combine uploaded files and existing URLs
    const allImages = [...imageUrls, ...(existingImages ? JSON.parse(existingImages) : [])];

    const effectivePricePerMonth = price_per_month ?? req.body.pricePerMonth;
    const effectiveDepositAmount = deposit_amount ?? req.body.depositAmount;

    if (effectivePricePerMonth === undefined || effectivePricePerMonth === null || effectivePricePerMonth === '') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'price_per_month is required' });
    }

    const normalizedPricePerMonth = Number(effectivePricePerMonth);
    if (Number.isNaN(normalizedPricePerMonth)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'price_per_month must be a number' });
    }

    const normalizedDepositAmount = effectiveDepositAmount === undefined || effectiveDepositAmount === null || effectiveDepositAmount === ''
      ? null
      : Number(effectiveDepositAmount);

    if (normalizedDepositAmount !== null && Number.isNaN(normalizedDepositAmount)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'deposit_amount must be a number' });
    }

    // Insert accommodation
    const accommodationQuery = `
      INSERT INTO accommodations (
        landlord_id, title, description, address, city, postal_code, 
        latitude, longitude, price_per_month, deposit_amount, 
        available_from, available_to, people_per_room
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;
    
    const accommodationValues = [
      req.user.id, // landlord_id from auth middleware
      title,
      description,
      address,
      city,
      postal_code,
      latitude,
      longitude,
      normalizedPricePerMonth,
      normalizedDepositAmount,
      available_from,
      available_to,
      people_per_room || 1
    ];

    const accommodationResult = await client.query(accommodationQuery, accommodationValues);
    const accommodationId = accommodationResult.rows[0].id;

    // Insert amenities
    if (amenities) {
      const amenitiesObj = parseAmenitiesInput(amenities);
      if (!amenitiesObj) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Invalid amenities format' });
      }

      const wifi = pickAmenity(amenitiesObj, 'wifi', 'wifi').value ?? false;
      const furnished = pickAmenity(amenitiesObj, 'furnished', 'furnished').value ?? false;
      const parking = pickAmenity(amenitiesObj, 'parking', 'parking').value ?? false;
      const laundry = pickAmenity(amenitiesObj, 'laundry', 'laundry').value ?? false;
      const kitchen = pickAmenity(amenitiesObj, 'kitchen', 'kitchen').value ?? false;
      const heating = pickAmenity(amenitiesObj, 'heating', 'heating').value ?? false;
      const tv = pickAmenity(amenitiesObj, 'tv', 'tv').value ?? false;
      const petsAllowed = pickAmenity(amenitiesObj, 'pets_allowed', 'petsAllowed').value ?? false;
      const smokingAllowed = pickAmenity(amenitiesObj, 'smoking_allowed', 'smokingAllowed').value ?? false;

      const amenitiesQuery = `
        INSERT INTO accommodation_amenities (
          accommodation_id, wifi, furnished, parking, laundry, 
          kitchen, heating, tv, pets_allowed, smoking_allowed
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `;
      
      await client.query(amenitiesQuery, [
        accommodationId,
        wifi,
        furnished,
        parking,
        laundry,
        kitchen,
        heating,
        tv,
        petsAllowed,
        smokingAllowed
      ]);
    }

    // Insert images
    if (allImages && allImages.length > 0) {
      for (let i = 0; i < allImages.length; i++) {
        await client.query(
          'INSERT INTO accommodation_images (accommodation_id, image_url, is_primary) VALUES ($1, $2, $3)',
          [accommodationId, allImages[i], i === 0] // First image is primary
        );
      }
    }

    // Fetch the created accommodation with all its details including amenities
    const result = await client.query(`
      SELECT 
        a.*, 
        json_build_object(
          'wifi', COALESCE(aa.wifi, false),
          'furnished', COALESCE(aa.furnished, false),
          'parking', COALESCE(aa.parking, false),
          'laundry', COALESCE(aa.laundry, false),
          'kitchen', COALESCE(aa.kitchen, false),
          'heating', COALESCE(aa.heating, false),
          'tv', COALESCE(aa.tv, false),
          'pets_allowed', COALESCE(aa.pets_allowed, false),
          'smoking_allowed', COALESCE(aa.smoking_allowed, false)
        ) as amenities,
        (SELECT json_agg(ai.image_url) 
         FROM accommodation_images ai 
         WHERE ai.accommodation_id = $1
         GROUP BY ai.accommodation_id) as images
      FROM accommodations a
      LEFT JOIN accommodation_amenities aa ON a.id = aa.accommodation_id
      WHERE a.id = $1
    `, [accommodationId]);

    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating accommodation:', error);
    res.status(500).json({ error: 'Server error while creating accommodation' });
  } finally {
    client.release();
  }
};

// @desc    Update accommodation
// @route   PUT /api/accommodations/:id
// @access  Private/Landlord
const updateAccommodation = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;

    // Check if accommodation exists and belongs to the landlord
    const checkQuery = 'SELECT id FROM accommodations WHERE id = $1 AND landlord_id = $2';
    const checkResult = await client.query(checkQuery, [id, req.user.id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Accommodation not found or access denied' });
    }

    const { 
      title, description, address, city, postal_code, 
      latitude, longitude, price_per_month, deposit_amount, 
      available_from, available_to, is_available, people_per_room,
      amenities, images
    } = req.body;

    const effectivePricePerMonth = price_per_month ?? req.body.pricePerMonth;
    const effectiveDepositAmount = deposit_amount ?? req.body.depositAmount;

    const normalizedPricePerMonth = effectivePricePerMonth === undefined || effectivePricePerMonth === null || effectivePricePerMonth === ''
      ? null
      : Number(effectivePricePerMonth);

    if (normalizedPricePerMonth !== null && Number.isNaN(normalizedPricePerMonth)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'price_per_month must be a number' });
    }

    const normalizedDepositAmount = effectiveDepositAmount === undefined || effectiveDepositAmount === null || effectiveDepositAmount === ''
      ? null
      : Number(effectiveDepositAmount);

    if (normalizedDepositAmount !== null && Number.isNaN(normalizedDepositAmount)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'deposit_amount must be a number' });
    }

    // Update accommodation
    const updateQuery = `
      UPDATE accommodations 
      SET 
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        address = COALESCE($3, address),
        city = COALESCE($4, city),
        postal_code = COALESCE($5, postal_code),
        latitude = COALESCE($6, latitude),
        longitude = COALESCE($7, longitude),
        price_per_month = COALESCE($8, price_per_month),
        deposit_amount = COALESCE($9, deposit_amount),
        available_from = COALESCE($10, available_from),
        available_to = COALESCE($11, available_to),
        is_available = COALESCE($12, is_available),
        people_per_room = COALESCE($13, people_per_room),
        updated_at = NOW()
      WHERE id = $14
      RETURNING *
    `;

    const updateValues = [
      title, description, address, city, postal_code, 
      latitude, longitude, normalizedPricePerMonth, normalizedDepositAmount, 
      available_from, available_to, is_available, people_per_room,
      id
    ];

    const result = await client.query(updateQuery, updateValues);

    // Update amenities if provided
    if (amenities) {
      const amenitiesObj = parseAmenitiesInput(amenities);
      if (!amenitiesObj) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Invalid amenities format' });
      }

      const wifiPick = pickAmenity(amenitiesObj, 'wifi', 'wifi');
      const furnishedPick = pickAmenity(amenitiesObj, 'furnished', 'furnished');
      const parkingPick = pickAmenity(amenitiesObj, 'parking', 'parking');
      const laundryPick = pickAmenity(amenitiesObj, 'laundry', 'laundry');
      const kitchenPick = pickAmenity(amenitiesObj, 'kitchen', 'kitchen');
      const heatingPick = pickAmenity(amenitiesObj, 'heating', 'heating');
      const tvPick = pickAmenity(amenitiesObj, 'tv', 'tv');
      const petsAllowedPick = pickAmenity(amenitiesObj, 'pets_allowed', 'petsAllowed');
      const smokingAllowedPick = pickAmenity(amenitiesObj, 'smoking_allowed', 'smokingAllowed');

      const updateAmenitiesQuery = `
        UPDATE accommodation_amenities
        SET
          wifi = COALESCE($1, wifi),
          furnished = COALESCE($2, furnished),
          parking = COALESCE($3, parking),
          laundry = COALESCE($4, laundry),
          kitchen = COALESCE($5, kitchen),
          heating = COALESCE($6, heating),
          tv = COALESCE($7, tv),
          pets_allowed = COALESCE($8, pets_allowed),
          smoking_allowed = COALESCE($9, smoking_allowed)
        WHERE accommodation_id = $10
      `;
      
      await client.query(updateAmenitiesQuery, [
        wifiPick.exists ? wifiPick.value : null,
        furnishedPick.exists ? furnishedPick.value : null,
        parkingPick.exists ? parkingPick.value : null,
        laundryPick.exists ? laundryPick.value : null,
        kitchenPick.exists ? kitchenPick.value : null,
        heatingPick.exists ? heatingPick.value : null,
        tvPick.exists ? tvPick.value : null,
        petsAllowedPick.exists ? petsAllowedPick.value : null,
        smokingAllowedPick.exists ? smokingAllowedPick.value : null,
        id
      ]);
    }

    // Handle images if provided
    if (images && images.length > 0) {
      // Delete existing images
      await client.query('DELETE FROM accommodation_images WHERE accommodation_id = $1', [id]);
      
      // Insert new images
      for (let i = 0; i < images.length; i++) {
        await client.query(
          'INSERT INTO accommodation_images (accommodation_id, image_url, is_primary) VALUES ($1, $2, $3)',
          [id, images[i], i === 0] // First image is primary
        );
      }
    }

    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating accommodation:', error);
    res.status(500).json({ error: 'Server error while updating accommodation' });
  } finally {
    client.release();
  }
};

// @desc    Delete accommodation
// @route   DELETE /api/accommodations/:id
// @access  Private/Landlord
const deleteAccommodation = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;

    // Verify ownership
    const checkQuery = 'SELECT id FROM accommodations WHERE id = $1 AND landlord_id = $2';
    const checkResult = await client.query(checkQuery, [id, req.user.id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Accommodation not found or access denied' });
    }

    // Delete related records first (due to foreign key constraints)
    await client.query('DELETE FROM accommodation_amenities WHERE accommodation_id = $1', [id]);
    await client.query('DELETE FROM accommodation_images WHERE accommodation_id = $1', [id]);
    await client.query('DELETE FROM bookings WHERE accommodation_id = $1', [id]);
    await client.query('DELETE FROM favorites WHERE accommodation_id = $1', [id]);
    await client.query('DELETE FROM reviews WHERE accommodation_id = $1', [id]);

    // Finally delete the accommodation
    const result = await client.query('DELETE FROM accommodations WHERE id = $1 RETURNING *', [id]);
    
    await client.query('COMMIT');
    res.json({ message: 'Accommodation deleted successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting accommodation:', error);
    res.status(500).json({ error: 'Server error while deleting accommodation' });
  } finally {
    client.release();
  }
};

module.exports = {
  getAccommodations,
  getAccommodationById,
  createAccommodation,
  updateAccommodation,
  deleteAccommodation
};