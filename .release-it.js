"use strict";

module.exports = {
	preReleaseBase: 1,
	hooks: {
		"before:init": "bash ./build/release/pre-release.sh",
		"after:version:bump":
			"sed -i 's/main\\/AUTHORS.txt/${version}\\/AUTHORS.txt/' package.json",
		"after:bump": "cross-env VERSION=${version} npm run build",
		"before:git:release": "git add -f dist/ changelog.md",
		"after:release": "echo 'Run the following to complete the release:' && " +
			"echo './build/release/post-release.sh $\{version}'"
	},
	git: {

		// Use the node script directly to avoid an npm script
		// command log entry in the GH release notes
		changelog: "node build/release/changelog.mjs ${from} ${to}",
		commitMessage: "Release: ${version}",
		getLatestTagFromAllRefs: true,
		pushRepo: "git@github.com:jquery/jquery-mousewheel.git",
		requireBranch: "main",
		requireCleanWorkingDir: true
	},
	github: {
		pushRepo: "git@github.com:jquery/jquery-mousewheel.git",
		release: true,
		tokenRef: "JQUERY_GITHUB_TOKEN"
	},
	npm: {
		publish: true
	}
};
