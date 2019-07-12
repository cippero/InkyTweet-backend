const express = require('express');
const passport = require('passport');
const router = express.Router();
const db = require('../models');


// This route checks for the existence of a user in the session
router.get('/user', (req, res, next) => {
	// console.log('user is ', req.user.handle);
	if (req.user === undefined) { res.json({user: null}); return console.log('No user logged in.'); }
	db.Tweet.find({"_id" : {"$in" : req.user.writtenTweets}}, function(errorWritten, writtenTweets) { 
		if (errorWritten) { return console.log("****************ERROR*******************\n", errorWritten); }
		db.Tweet.find({"_id" : {"$in" : req.user.purchasedTweets}}, function(errorPurchased, purchasedTweets) {
			if (errorPurchased) { return console.log("****************ERROR*******************\n", errorPurchased); }
			db.User.find({subscriptions: req.user.twitterId}, function(errorSubs, users) {
				if (errorSubs) { return console.log("****************ERROR*******************\n", errorSubs); }
				let followers = [];
				users.forEach(singleUser => followers.push(singleUser.handle));
				res.json({user: req.user, writtenTweets: writtenTweets, purchasedTweets: purchasedTweets, followers: followers});
			});
		});
	});
});

router.get('/login', passport.authenticate('twitter', 
	{session: true, 
	 successRedirect: process.env.FRONTEND_URL + '/profile', 
	 failureRedirect: process.env.FRONTEND_URL,
	 failureFlash: 'Incorrect user credentials',
	 successFlash: 'Welcome!' }));

router.get('/return', 
  passport.authenticate('twitter', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect(`${process.env.FRONTEND_URL}/user/${req.user.handle}`);
});

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect(process.env.FRONTEND_URL + '/');
});

module.exports = router;