module.exports = {
  doubleCsrfOptions: {
    getSecret: () => '$@#%1',
    cookieName: 'csrf',
    getTokenFromRequest: req => {
      if (req.body.csrfToken) {
        return req.body.csrfToken;
      }
      return req.headers['x-csrf-token'];
    },
  },
};
