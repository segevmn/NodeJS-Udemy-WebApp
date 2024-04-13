exports.getMessgae = msg => {
  let message = msg;
  if (message.length > 0) {
    mag = message[0];
  } else {
    message = null;
  }
  return message;
};

// move to controllers
