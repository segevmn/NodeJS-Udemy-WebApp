module.exports = {
  contentSecurityPolicy: {
    useDefaults: true,

    directives: {
      connectSrc: ["'self'", 'https://js.stripe.com'],

      scriptSrc: ["'self'", "'unsafe-inline'", 'https://js.stripe.com'],

      frameSrc: ["'self'", 'https://js.stripe.com'],

      scriptSrcAttr: ["'unsafe-inline'"],
    },
  },
};
