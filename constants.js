const SENDER_MAIL = 'nodejsordershop@gmail.com';
const APPLICATION_PASSWORD = 'vhly qhfz vmit ochv';
const ITEMS_PER_PAGE = 1;
const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.uazlqbd.mongodb.net/${process.env.MONGO_DEF_DATABASE}`;

exports.senderMail = SENDER_MAIL;
exports.applicationPassword = APPLICATION_PASSWORD;
exports.productsPerPage = ITEMS_PER_PAGE;
exports.mongoDBURI = MONGODB_URI;
