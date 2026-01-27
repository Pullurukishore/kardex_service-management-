import { Response, NextFunction, Request } from 'express';

// Helper function to get user from request
function getUserFromRequest(req: Request) {
  return (req as any).user;
}

// Middleware to check if user can manage customers
export const canManageCustomers = (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'UNAUTHORIZED'
      });
    }

    const { role } = user;

    // ADMIN and EXPERT_HELPDESK can manage customers
    if (role === 'ADMIN' || role === 'EXPERT_HELPDESK') {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: 'Only administrators can manage customers',
      code: 'FORBIDDEN'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error during authorization',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// Middleware to check if user can manage contacts
export const canManageContacts = (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'UNAUTHORIZED'
      });
    }

    const { role, customerId: userCustomerId } = user;
    const customerId = parseInt(req.params.id);

    if (isNaN(customerId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid customer ID',
        code: 'INVALID_CUSTOMER_ID'
      });
    }

    // ADMIN and EXPERT_HELPDESK can manage contacts for any customer
    if (role === 'ADMIN' || role === 'EXPERT_HELPDESK') {
      return next();
    }

    // ZONE_MANAGER and ZONE_USER can manage contacts for customers in their zones
    if (role === 'ZONE_MANAGER' || role === 'ZONE_USER') {
      return next();
    }

    // SERVICE_PERSON and other roles cannot manage contacts

    // CUSTOMER_CONTACT and SERVICE_PERSON cannot manage contacts
    return res.status(403).json({
      success: false,
      error: 'Insufficient permissions to manage contacts',
      code: 'FORBIDDEN'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error during authorization',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// Middleware to check if user can view customers
export const canViewCustomers = (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'UNAUTHORIZED'
      });
    }

    const { role } = user;

    // ADMIN, EXPERT_HELPDESK, and SERVICE_PERSON can view all customers
    if (role === 'ADMIN' || role === 'EXPERT_HELPDESK' || role === 'SERVICE_PERSON') {
      return next();
    }

    // ZONE_USER and ZONE_MANAGER can view customers in their assigned zones
    if (role === 'ZONE_USER' || role === 'ZONE_MANAGER') {
      return next();
    }

    // EXTERNAL_USER can view all customers for ticket creation
    if (role === 'EXTERNAL_USER') {
      return next();
    }

    // Other roles without explicit access are denied

    return res.status(403).json({
      success: false,
      error: 'Insufficient permissions to view customers',
      code: 'FORBIDDEN'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error during authorization',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
};
