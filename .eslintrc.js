module.exports = {
	"env": {
		"browser": true,
		"commonjs": false,
		"es2021": true,
		"node": true
	},
	"parserOptions": {
		"ecmaVersion": 13,
		"sourceType": "module"
	},
	"ignorePatterns": ["dist/*.js"],
	"rules": {
		"linebreak-style": [
			"error",
			"unix"
		],
		"quotes": [
			"error",
			"double"
		],
		"semi": [
			"error",
			"always"
		]
	}
};
