const Invoice = require('../models/Invoice');
const logger = require('../utils/logger');

/**
 * Get client's invoices
 * @route GET /api/invoices
 */
exports.getClientInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ client: req.user.id })
      .sort({ dueDate: 1 })
      .populate('project', 'name');
    
    res.json(invoices);
  } catch (err) {
    logger.error(`Error fetching client invoices: ${err.message}`);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Create a new invoice
 * @route POST /api/invoices
 */
exports.createInvoice = async (req, res) => {
  try {
    const { project, amount, currency, dueDate, items, notes } = req.body;

    // Generate invoice number (you might want to use a more sophisticated method)
    const invoiceNumber = `INV-${Date.now()}`;

    const invoice = new Invoice({
      client: req.user.id,
      project,
      invoiceNumber,
      amount,
      currency,
      dueDate,
      items,
      notes
    });

    await invoice.save();
    res.status(201).json(invoice);
  } catch (err) {
    logger.error(`Error creating invoice: ${err.message}`);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update invoice status
 * @route PUT /api/invoices/:id/status
 */
exports.updateInvoiceStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    if (invoice.client.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    invoice.status = status;
    await invoice.save();

    res.json(invoice);
  } catch (err) {
    logger.error(`Error updating invoice status: ${err.message}`);
    res.status(500).json({ message: 'Server error' });
  }
}; 