import crypto from 'crypto';

/**
 * Middleware to track anonymous identity using a cryptographically secure HttpOnly cookie.
 * Also extracts the FingerprintJS visitorId from headers.
 */
export const anonIdentity = (req, res, next) => {
  let cookieId = req.cookies.experio_anon_id;
  const visitorId = req.headers['x-visitor-id'] || null;

  if (!cookieId) {
    // Generate a secure random hex string (32 bytes = 64 chars)
    cookieId = crypto.randomBytes(32).toString('hex');
    
    // Set cookie: HttpOnly, Secure (in production), SameSite Lax
    res.cookie('experio_anon_id', cookieId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
    });
  }

  // Attach to request for the rate limiters
  req.anonContext = {
    cookieId,
    visitorId,
    // Provide a unified identifier: prefer visitorId if present, fallback to cookie
    primaryId: visitorId || cookieId
  };

  next();
};
