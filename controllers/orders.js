const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const Order = require('../models/order');
const { err500 } = require('../utils/catchErrors');

exports.getOrders = (req, res, next) => {
  Order.find({ 'user.userId': req.user._id })
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'My Orders',
        orders: orders,
      });
    })
    .catch(err => {
      return err500(err, next);
    });
};

exports.postOrder = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .then(user => {
      const products = user.cart.items.map(item => {
        return { quantity: item.quantity, product: { ...item.productId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user._id,
        },
        products: products,
      });

      return order.save();
    })
    .then(result => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect('/orders');
    })
    .catch(err => {
      return err500(err, next);
    });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then(order => {
      if (!order) {
        return next(new Error('No order found!'));
      }

      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error('Unauthorized to view this invoice'));
      }

      const invoiceName = `invoice - ${orderId}.pdf`;
      const invoicePath = path.join('data', 'invoices', invoiceName);
      const pdf = new PDFDocument();

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${invoiceName}"`);
      pdf.registerFont('Eup', 'fonts/Euphemia UCAS Bold 2.6.6.ttf');
      pdf.pipe(fs.createWriteStream(invoicePath));
      pdf.pipe(res);

      pdf.font('Helvetica-Bold');
      pdf.fontSize(26).text('Invoice', { align: 'center', underline: true });
      pdf.font('Eup');
      pdf.moveDown();

      let totalPrice = 0;

      order.products.forEach(prod => {
        totalPrice += prod.quantity * prod.product.price;
        pdf.fontSize(16).font('Times-Roman');
        pdf.text(
          `${prod.product.title} - ${prod.quantity} x$${prod.product.price}`
        );
      });

      pdf.moveDown();
      pdf.text(`Total Price: $${totalPrice}`);
      pdf.end();
    })
    .catch(err => {
      next(err);
    });
};
