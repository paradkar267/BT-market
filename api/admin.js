import adminCampaignsHandler from './_admin/admin-campaigns.js';
import adminCouponsHandler from './_admin/admin-coupons.js';
import adminCustomersHandler from './_admin/admin-customers.js';
import adminOrdersHandler from './_admin/admin-orders.js';
import adminRefundHandler from './_admin/admin-refund.js';

export default async function handler(req, res) {
  const url = req.url || '';

  if (url.includes('admin-campaigns') || url.includes('action=campaigns')) {
    return adminCampaignsHandler(req, res);
  }
  if (url.includes('admin-coupons') || url.includes('action=coupons')) {
    return adminCouponsHandler(req, res);
  }
  if (url.includes('admin-customers') || url.includes('action=customers')) {
    return adminCustomersHandler(req, res);
  }
  if (url.includes('admin-refund') || url.includes('action=refund')) {
    return adminRefundHandler(req, res);
  }
  if (url.includes('admin-orders') || url.includes('action=orders')) {
    return adminOrdersHandler(req, res);
  }

  // Default fallback handler
  return adminOrdersHandler(req, res);
}
