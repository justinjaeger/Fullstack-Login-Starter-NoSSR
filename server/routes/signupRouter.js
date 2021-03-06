const express = require("express");
const router = express.Router();

const signupController = require('../controllers/signupController');
const tokenController = require('../controllers/tokenController');
const emailController = require('../controllers/emailController');

// TEST: emailer
// router.post('/email',
//   // send email with link
//   emailController.sendVerificationEmail,
//   (req, res) => {
//     return res.status(202).send({ message: `Email sent to ${req.body.email}` });
// });

// Sign up a user
router.post('/',
  signupController.validateEmailAndUsername,
  signupController.validatePassword,
  signupController.hashPassword,
  signupController.createUser,
  emailController.sendVerificationEmail,
  (req, res) => {
    return res.status(200).send({ 
      message: `Please verify the email sent to ${req.body.email}.`,
    });
});

// RESEND VERIFICATION EMAIL
router.post('/resend-verification',
  emailController.sendVerificationEmail,
  (req, res) => {
    return res.status(200).send({ message: `Please verify the email sent to ${req.body.email}.` });
});

// Fires when you click the verification link sent to your email
router.get('/verify-email', // ?username={username}
  emailController.decryptUsername,
  signupController.authenticateUser,
  (req, res) => {
    res.clearCookie('reset_password');
    res.cookie('authenticated', `XXX${res.locals.username}XXX`);
    return res.redirect('/');
});

// Delete Account
router.get('/delete-account',
  tokenController.removeCookie,
  signupController.deleteAccount,
  (req, res) => {
    return res.status(200).send({ message: 'account successfully deleted'});
});

// If we refresh on /signup it just goes back to homepage
router.get('/', (req, res) => {
  return res.redirect('/');
});

module.exports = router;