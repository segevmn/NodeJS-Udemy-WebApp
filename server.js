const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const { doubleCsrf } = require('csrf-csrf');
const cookieParser = require('cookie-parser');
const connectFlash = require('connect-flash');
const multer = require('multer');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const fs = require('fs');
const https = require('https');

const { doubleCsrfOptions } = require('./config/doubleCsrfOptions');
const errorsController = require('./controllers/errors');
const User = require('./models/user');
const multerConfig = require('./config/multerConfig');
const helmetConfig = require('./config/helmetConfig');
const sessionConfig = require('./config/sessionConfig');

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.uazlqbd.mongodb.net/${process.env.MONGO_DEF_DATABASE}`;
const app = express();
const store = new MongoDBStore({ uri: MONGODB_URI, collection: 'sessions' });
const { doubleCsrfProtection } = doubleCsrf(doubleCsrfOptions);

// const privateKey = fs.readFileSync('server.key');
// const certificate = fs.readFileSync('server.cert');

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'access.log'),
  { flags: 'a' }
);

app.use(helmet(helmetConfig));
app.use(compression());
app.use(morgan('combined', { stream: accessLogStream }));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  multer({
    storage: multerConfig.fileStorage,
    fileFilter: multerConfig.fileFilter,
  }).single('image')
);
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(session(sessionConfig));
app.use(cookieParser('*&798'));
app.use(doubleCsrfProtection);
app.use(connectFlash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.doubleCsrfToken = req.csrfToken();
  next();
});

// async
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }

  // try {
  //   const user = await User.findById(req.session.user._id);
  //   if (!user) return next();
  //   req.user = user;
  //   next();
  // } catch (err) {
  //   next(new Error(err));
  // }

  User.findById(req.session.user._id)
    .then(user => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch(err => {
      next(new Error(err));
    });
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorsController.get500);
app.use(errorsController.get404);

app.use((error, req, res, next) => {
  res.status(500).render('500', {
    path: null,
    pageTitle: 'Error!',
    isAuthenticated: req.session.isLoggedIn,
  });
});

mongoose
  .connect(MONGODB_URI)
  .then(result => {
    // https
    //   .createServer({ key: privateKey, cert: certificate }, app)
    //   .listen(process.env.PORT || 3000);
    app.listen(process.env.PORT || 3000);
  })
  .catch(err => {
    console.log(err);
  });
