/**
 * Main server file for the application
 * Sets up Express server with authentication routes for user registration and login
 */

// Import required dependencies
const express = require('express');       // Web server framework
const cors = require('cors');             // Cross-Origin Resource Sharing middleware
const mongoose = require("mongoose");     // MongoDB object modeling tool
const bcrypt = require('bcryptjs');       // Password hashing library
const jwt = require('jsonwebtoken');      // JSON Web Token implementation
const User = require('./models/User.js'); // User model schema
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const bookingRoutes = require('./routes/bookings');
const maintenanceRoutes = require('./routes/maintenance');
const announcementRoutes = require('./routes/announcements');
require('dotenv').config();               // Load environment variables from .env file
const app = express();                    // Create Express application

// Constants for security configurations
const bcryptSalt = bcrypt.genSaltSync(10); // Generate salt for password hashing (10 rounds)
const jwtSecret = 'jnvkldfkmnbiopvjbkmn';  // Secret key for JWT signing

// Middleware configuration
app.use(express.json());                  // Parse JSON request bodies
app.use(cookieParser());

// Configure CORS to allow requests from the frontend
app.use(cors({
    credentials: true,                   // Allow credentials (cookies) to be sent cross-origin
    origin: 'https://smart-campus-portal-frontend.vercel.app/login',      // Only allow requests from the frontend origin
    methods: ["POST", "GET"]
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/announcements', announcementRoutes);

// Connect to MongoDB database using connection string from environment variables
console.log(process.env.MONGO_URL)       // Log the MongoDB connection string 
if (!MONGODB_URI) {
  console.error('MONGODB_URI environment variable is not set!');
  process.exit(1); // Exit the application if the URI is missing
}
mongoose.connect(process.env.MONGO_URL);
//AnsovHSTtu42dPLS

/**
 * Test endpoint to verify API is working
 * @route GET /test
 * @returns {Object} Simple JSON response indicating server is running
 */
app.get('/test',(req,res) => {
    res.json('test ok');
});

/**
 * User registration endpoint
 * @route POST /register
 * @param {Object} req.body - Contains user registration data
 * @param {string} req.body.name - User's name
 * @param {string} req.body.email - User's email
 * @param {string} req.body.password - User's password (will be hashed)
 * @returns {Object} Created user document or error
 */

app.post('/register', async (req,res) => {
    const {name,email,password} = req.body;

    try {
      // Create new user document with hashed password  
      const userDoc = await User.create({
            name,
            email,
            password:bcrypt.hashSync(password, bcryptSalt), // Hash password before storing
        });
        res.json(userDoc);  // Return the created user document
    } catch (e) {
        res.status(422).json(e); // Return error with 422 status
    }   
});

/**
 * User login endpoint
 * @route POST /login
 * @param {Object} req.body - Contains login credentials
 * @param {string} req.body.email - User's email
 * @param {string} req.body.password - User's password
 * @returns {Object} Success message with token cookie or error message
 */

app.post('/login', async(req,res) => {
    const {email,password} = req.body;             // Extract login credentials from request
    const userDoc = await User.findOne({email});   // Find user by email
    if (userDoc) {
        // Compare provided password with stored hash
        const passOk = bcrypt.compareSync(password, userDoc.password)
        if (passOk) {
        // Generate JWT token with user information
            jwt.sign({email:userDoc.email, 
                      id:userDoc._id, 
                      
                      },jwtSecret, {}, (err,token) => {
              if (err) throw err;
            // Set token as HTTP-only cookie and return success response
              res.cookie('token', token).json(userDoc);  
            });
        } else {
            res.status(422).json('pass not ok');
        }
       
    } else {
        res.json('Not found');
    }
});

app.get('/profile', (req,res) => {
    const {token} = req.cookies;
    if (token) {
        jwt.verify(token, jwtSecret, {}, async (err, userData) => {
            if (err) throw err;

            const {name,email,_id} = await User.findById(userData.id);
            res.json({name,email,_id});
        });
    } else {
        res.status(401).json({message: 'No token found'});
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server on port 4000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
