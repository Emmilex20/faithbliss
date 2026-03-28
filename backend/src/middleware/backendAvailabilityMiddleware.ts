import { NextFunction, Request, Response } from 'express';
import { getPassportFeatureSettings } from '../utils/passportMode';

const DEVELOPER_BACKEND_BYPASS_ROUTES = new Set([
  'GET:/api/health',
  'GET:/api/users/public-feature-settings',
  'GET:/api/users/feature-settings',
  'GET:/api/users/developer/overview',
  'PATCH:/api/users/developer/feature-settings',
]);

const isDeveloperBackendBypassRequest = (req: Request) => {
  const resolvedPath = `${req.baseUrl || ''}${req.path}`;
  const routeKey = `${req.method.toUpperCase()}:${resolvedPath}`;
  return DEVELOPER_BACKEND_BYPASS_ROUTES.has(routeKey);
};

export const backendAvailabilityGate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await getPassportFeatureSettings();
    if (!settings.backendOnlyShutdownEnabled || isDeveloperBackendBypassRequest(req)) {
      return next();
    }

    return res.status(503).json({
      message: 'Backend services are crashed. We are working to restore service as soon as possible. Thank you for your patience.',
      code: 'BACKEND_ONLY_SHUTDOWN_ENABLED',
    });
  } catch (error) {
    return next(error);
  }
};
