import ActivityLog from '../models/activityLog.js';

export function logActivity({ action, performedBy, targetType, targetId, details, metadata, req }) {
  const ipAddress = req?.ip || req?.connection?.remoteAddress || req?.headers?.['x-forwarded-for'] || 'Unknown IP';
  const userAgent = req?.headers?.['user-agent'] || '';

  // Parse device info inline
  let deviceInfo = 'Unknown Device';
  const browsers = { Chrome: 'Chrome', Firefox: 'Firefox', Safari: 'Safari', Edge: 'Edge', Opera: 'Opera', Postman: 'Postman' };
  const osList = { iPhone: 'iPhone', iPad: 'iPad', Android: 'Android', Windows: 'Windows', Macintosh: 'macOS', Linux: 'Linux' };

  for (const [key, val] of Object.entries(browsers)) {
    if (userAgent.includes(key)) { deviceInfo = val; break; }
  }
  for (const [key, val] of Object.entries(osList)) {
    if (userAgent.includes(key)) { deviceInfo += ` on ${val}`; break; }
  }

  // Fire and forget — don't await, don't block the response
  ActivityLog.create({
    action,
    performedBy,
    targetType,
    targetId,
    details,
    metadata,
    ipAddress,
    deviceInfo,
  }).catch(err => console.error('Activity log failed:', err.message));
}
