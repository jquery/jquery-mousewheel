import jqueryConfig from "eslint-config-jquery";
import globals from "globals";

export default [
	{
		ignores: [ "dist/**/*.js" ],
		rules: {
			...jqueryConfig.rules,
			indent: [ "error", "tab" ]
		}
	},

	{
		files: [
			"src/**/*.js",
			"dist/**/*.js",
			"test/**/*.js"
		],
		languageOptions: {

			// Support: IE 9 - 11+
			ecmaVersion: 5,

			sourceType: "script",

			// Support: Non-browser envs like jsdom
			// Don't include `globals.browser`, take browser globals from `window`.
			globals: {
				window: "readonly",
				define: "readonly",
				module: "readonly",
				jQuery: "readonly"
			}
		}
	},

	{
		files: [ "src/**/*.js" ],
		rules: {
			strict: [ "error", "function" ],
			indent: [
				"error",
				"tab",
				{

					// This makes it so code within the wrapper is not indented.
					ignoredNodes: [
						"Program > FunctionDeclaration > *"
					]
				}
			]
		}
	},

	{
		files: [ "test/**/*.js" ],
		languageOptions: {
			globals: {
				QUnit: "readonly"
			}
		},
		rules: {
			strict: [ "error", "global" ]
		}
	},

	{
		files: [ "*.js" ],
		languageOptions: {
			ecmaVersion: "latest",
			sourceType: "commonjs",
			globals: {
				...globals.node
			}
		},
		rules: {
			...jqueryConfig.rules
		}
	},

	{
		files: [ "*.mjs", "build/**/*.mjs" ],
		languageOptions: {
			ecmaVersion: "latest",
			sourceType: "module",
			globals: {
				...globals.node
			}
		},
		rules: {
			...jqueryConfig.rules
		}
	}
];
