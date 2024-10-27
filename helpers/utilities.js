/*
 * Title: Utilites
 * Description: Important utilies functions
 * Author: Mohammed Kofil
 * Date: 20-10-2024
 */

// dependencies
const crypto = require('crypto');
const enviornment = require('./environment');

// module scaffolding
const utilites = {};

// parse JSON string to an headersObject
utilites.parseJSON = (jsonString) => {
	let output = {};
	try {
		output = JSON.parse(jsonString);
	} catch {
		output = {};
	}
	return output;
};

// create SHA256 hash
utilites.hash = (str) => {
	if (typeof str === 'string' && str.length > 0) {
		const hash = crypto
			.createHmac('sha256', enviornment.screctKey)
			.update(str)
			.digest('hex');
		return hash;
	}
	return false;
};

// create random string
utilites.createRandomString = (strlength) => {
	let length = strlength;
	length = typeof length === 'number' && length > 0 ? length : false;
	if (length) {
		// define all the possible characters that could go into a string
		const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';
		// start the final string
		let str = '';
		for (let i = 1; i <= length; i++) {
			// get a random character from the possibleCharacters string
			const randomCharacter = possibleCharacters.charAt(
				Math.floor(Math.random() * possibleCharacters.length)
			);
			// append this character to the final string
			str += randomCharacter;
		}
		// return the final string
		return str;
	}
	return false;
};

module.exports = utilites;
