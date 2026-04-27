import helmet from "helmet";
import cors from "cors";
import { doubleCsrf } from "csrf-csrf";
import rateLimit from "express-rate-limit";

export const securityMiddleware = (app) => {
  // Helmet sets various HTTP headers to protect against common web vulnerabilities
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          scriptSrcAttr: ["'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https://ik.imagekit.io"],
          connectSrc: ["'self'", "https://ik.imagekit.io", "https://upload.imagekit.io"],
          frameSrc: ["'none'"],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: [],
        },
      },
      crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
      crossOriginEmbedderPolicy: false,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      noSniff: true,
      frameguard: { action: "deny" },
      xssFilter: true,
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
      dnsPrefetchControl: { allow: false },
      permittedCrossDomainPolicies: { permittedPolicies: "none" },
      hidePoweredBy: true,
    })
  );
};

export const corsMiddleware = cors({
  origin: process.env.NODE_ENV === 'production' 
  ? [process.env.WEBSITE_URL]
  : true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"]
});

// CSRF Protection Configuration
const doubleCsrfOptions = {
  getSecret: () => process.env.CSRF_SECRET,
  cookieName: "x-csrf-token",
  cookieOptions: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  },
  size: 64,
  ignoredMethods: ["GET", "HEAD", "OPTIONS"],
  getTokenFromRequest: (req) => req.headers["x-csrf-token"],
  getSessionIdentifier: (req) => {
    // Ties the CSRF token to the specific authenticated session
    return req.cookies.authToken || req.cookies.sessionId || "anonymous";
  },
};

export const {
  invalidCsrfTokenError,
  generateToken,
  doubleCsrfProtection,
} = doubleCsrf(doubleCsrfOptions);

export const csrfErrorHandler = (error, req, res, next) => {
  if (error === invalidCsrfTokenError) {
    res.status(403).json({
      success: false,
      message: "CSRF token mismatch or missing. Request blocked."
    });
  } else {
    next(error);
  }
};

// Force HTTPS middleware for production
export const httpsRedirect = (req, res, next) => {
  // Most hosting providers (Render, Heroku, etc.) use the x-forwarded-proto header
  if (process.env.NODE_ENV === "production" && req.headers["x-forwarded-proto"] !== "https") {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
};

// Rate Limiting
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again in 15 minutes.",
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again in 15 minutes.",
  },
});

export const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many orders placed. Please try again later.",
  },
});
