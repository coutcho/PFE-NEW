import express from 'express';
import pkg from 'pg';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';

const router = express.Router();
const { Pool } = pkg;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'DB_PFE',
  password: 'Rayan123',
  port: 5432,
});

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage }).array('images', 10);

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Authentication required' });

  jwt.verify(token, 'your-secret-key', (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

router.get('/', async (req, res) => {
  const { type, status, include_sold } = req.query; // Add include_sold
  try {
    let query = `
      SELECT id, title, price, location, type, bedrooms, bathrooms, etage, 
             square_footage, description, features, status, lat, long, 
             images_path, equipe AS equipped, user_id AS agent_id, created_at 
      FROM properties
    `;
    const values = [];
    let conditions = [];

    if (type) {
      conditions.push('type = $' + (values.length + 1));
      values.push(type);
    }

    // Only apply status filter if include_sold is not 'true'
    if (include_sold !== 'true') {
      if (status) {
        conditions.push('TRIM(LOWER(status)) = $' + (values.length + 1));
        values.push(status.toLowerCase().trim());
      } else {
        conditions.push('TRIM(LOWER(status)) != $' + (values.length + 1));
        values.push('sold');
      }
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    
    const result = await pool.query(query, values);
    
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching properties:', err);
    res.status(500).json({ error: err.message });
  }
});
// **GET /api/properties/favorites** - Get the authenticated user's favorite properties
router.get('/favorites', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const query = `
      SELECT p.id, p.title, p.price, p.location, p.type, p.bedrooms, p.bathrooms, p.etage, 
             p.square_footage, p.description, p.features, p.status, p.lat, p.long, 
             p.images_path, p.equipe AS equipped, p.user_id AS agent_id, p.created_at 
      FROM properties p
      JOIN favorites f ON p.id = f.property_id
      WHERE f.user_id = $1 AND LOWER(p.status) != $2
    `;
    const result = await pool.query(query, [userId, 'sold']);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching favorites:', err);
    res.status(500).json({ error: err.message });
  }
});

// **GET /api/properties/:id** - Fetch a single property (numeric IDs only)
router.get('/:id(\\d+)', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT id, title, price, location, type, bedrooms, bathrooms, etage, square_footage, description, features, status, lat, long, images_path, equipe AS equipped, user_id AS agent_id, created_at FROM properties WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Property not found' });
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching property:', err);
    res.status(500).json({ error: err.message });
  }
});

// **POST /api/properties** - Add a new property
router.post('/', authenticateToken, upload, async (req, res) => {
  const { title, price, location, type, bedrooms, bathrooms, etage, square_footage, description, features, status, lat, long, equipped, agent_id } = req.body;
  const images_path = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

  try {
    const parsedFeatures = typeof features === 'string' ? JSON.parse(features) : features;
    const parsedEquipped = equipped === 'true' ? true : equipped === 'false' ? false : false;
    const parsedAgentId = agent_id ? parseInt(agent_id) : null;

    const result = await pool.query(
      'INSERT INTO properties (title, price, location, type, bedrooms, bathrooms, etage, square_footage, description, features, status, lat, long, images_path, equipe, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING id, title, price, location, type, bedrooms, bathrooms, etage, square_footage, description, features, status, lat, long, images_path, equipe AS equipped, user_id AS agent_id, created_at',
      [
        title,
        parseInt(price),
        location,
        type,
        parseInt(bedrooms),
        type === 'villa' && bathrooms ? parseInt(bathrooms) : null,
        type !== 'villa' && etage ? parseInt(etage) : null,
        parseInt(square_footage),
        description,
        parsedFeatures,
        status,
        lat ? parseFloat(lat) : null,
        long ? parseFloat(long) : null,
        JSON.stringify(images_path),
        parsedEquipped,
        parsedAgentId,
      ]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding property:', err);
    if (err.code === '23503') {
      return res.status(400).json({ error: 'Invalid agent ID: agent does not exist' });
    }
    res.status(500).json({ error: err.message });
  }
});

// **PUT /api/properties/:id** - Update a property (numeric IDs only)
router.put('/:id(\\d+)', authenticateToken, upload, async (req, res) => {
  const { id } = req.params;
  const { 
    title, price, location, type, bedrooms, bathrooms, etage, 
    square_footage, description, features, status, lat, long, 
    images_path, equipped, agent_id 
  } = req.body;

  try {
    // Check if only status is being updated
    if (status && Object.keys(req.body).length === 1) {
      // Validate status
      if (!['Active', 'Pending', 'Sold', 'For Rent'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      // Update only the status
      const statusUpdateResult = await pool.query(
        'UPDATE properties SET status = $1 WHERE id = $2 RETURNING *',
        [status, id]
      );

      if (statusUpdateResult.rowCount === 0) {
        return res.status(404).json({ error: 'Property not found' });
      }

      
      return res.status(200).json({ 
        message: 'Status updated successfully', 
        property: statusUpdateResult.rows[0] 
      });
    }

    // Handle full property update
    let existingImages = [];
    try {
      existingImages = images_path ? JSON.parse(images_path) : [];
    } catch (err) {
      console.error('Error parsing images_path:', err);
      existingImages = [];
    }

    const newImages = req.files && req.files.length > 0 ? req.files.map(file => `/uploads/${file.filename}`) : [];
    const updatedImagesPath = [...existingImages, ...newImages];
    const parsedEquipped = equipped === 'true' ? true : equipped === 'false' ? false : false;
    const parsedAgentId = agent_id ? parseInt(agent_id) : null;

    const parsedFeatures = typeof features === 'string' ? JSON.parse(features) : features;

    const updateResult = await pool.query(
      'UPDATE properties SET title = $1, price = $2, location = $3, type = $4, bedrooms = $5, bathrooms = $6, etage = $7, square_footage = $8, description = $9, features = $10, status = $11, lat = $12, long = $13, images_path = $14, equipe = $15, user_id = $16 WHERE id = $17 RETURNING *',
      [
        title,
        parseInt(price),
        location,
        type,
        parseInt(bedrooms),
        type === 'villa' && bathrooms ? parseInt(bathrooms) : null,
        type !== 'villa' && etage ? parseInt(etage) : null,
        parseInt(square_footage),
        description,
        parsedFeatures,
        status,
        lat ? parseFloat(lat) : null,
        long ? parseFloat(long) : null,
        JSON.stringify(updatedImagesPath),
        parsedEquipped,
        parsedAgentId,
        id,
      ]
    );

    if (updateResult.rowCount === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    
    res.status(200).json(updateResult.rows[0]);
  } catch (err) {
    console.error('Error updating property:', err);
    if (err.code === '23503') {
      return res.status(400).json({ error: 'Invalid agent ID: agent does not exist' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// **DELETE /api/properties/:id** - Delete a property (numeric IDs only)
router.delete('/:id(\\d+)', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM properties WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting property:', err);
    res.status(500).json({ error: err.message });
  }
});

// **POST /api/properties/favorites** - Add a property to the authenticated user's favorites
router.post('/favorites', authenticateToken, async (req, res) => {
  const propertyId = parseInt(req.body.propertyId);
  if (isNaN(propertyId)) {
    return res.status(400).json({ error: 'Invalid property ID' });
  }
  const userId = req.user.id;
  try {
    const checkQuery = 'SELECT COUNT(*) FROM favorites WHERE user_id = $1 AND property_id = $2';
    const checkResult = await pool.query(checkQuery, [userId, propertyId]);
    if (parseInt(checkResult.rows[0].count) > 0) {
      return res.status(400).json({ error: 'Favorite already exists' });
    }
    const insertQuery = 'INSERT INTO favorites (user_id, property_id) VALUES ($1, $2)';
    await pool.query(insertQuery, [userId, propertyId]);
    res.status(201).json({ message: 'Favorite added' });
  } catch (err) {
    console.error('Error adding favorite:', err);
    if (err.code === '23503') {
      return res.status(400).json({ error: 'Property not found' });
    }
    res.status(500).json({ error: err.message });
  }
});

// **DELETE /api/properties/favorites/:propertyId** - Remove a property from the authenticated user's favorites
router.delete('/favorites/:propertyId', authenticateToken, async (req, res) => {
  const propertyId = parseInt(req.params.propertyId);
  if (isNaN(propertyId)) {
    return res.status(400).json({ error: 'Invalid property ID' });
  }
  const userId = req.user.id;
  try {
    const deleteQuery = 'DELETE FROM favorites WHERE user_id = $1 AND property_id = $2';
    const result = await pool.query(deleteQuery, [userId, propertyId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Favorite not found' });
    }
    res.status(200).json({ message: 'Favorite removed' });
  } catch (err) {
    console.error('Error removing favorite:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;