const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xssClean = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');
const path = require('path');

const Router = require('./routes/Router');

const AppError = require('./utils/AppError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();
app.enable('trust proxy');

/* -------------------------------------------------------------------------- */
/*                                 MIDDLEWARE                                 */
/* -------------------------------------------------------------------------- */
// Implement CORS - allow frontend to make requests to our API
app.use(cors());

// For non-simple requests like OPTIONS
app.options('*', cors());

// Set secure HTTP headers
app.use(helmet());

// Body parser and limit the body to 100kb only
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true }));

// Parse the cookie coming in req
app.use(cookieParser());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Data sanitization against XSS
app.use(xssClean());

// Prevent parameter pollution (?sort=name&sort=email)
app.use(hpp());

// Compress the text sent to client using Gzip
app.use(compression());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit the req rate per hour
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many requests, please try again in an hour',
});
app.use('/api', limiter);

/* -------------------------------------------------------------------------- */
/*                                   ROUTES                                   */
/* -------------------------------------------------------------------------- */
app.use('/api/v1', Router);

// Global middleware to handle unhandled routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Middleware error handling
app.use(globalErrorHandler);

/* -------------------------------------------------------------------------- */
/*                                   SERVER                                   */
/* -------------------------------------------------------------------------- */
module.exports = app;
