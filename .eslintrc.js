module.exports = {
    // Support: IE11 without transpilation
    "parserOptions": {
        "ecmaVersion": 5
    },
    // Support: Non-browser envs like jsdom
    "env": {},
    "extends": "jquery",
    "globals": {
        "window": "readonly",
        "define": "readonly",
        "module": "readonly",
        "jQuery": "readonly"
    },
    "rules": {
    }
};