import fs from "node:fs/promises";
import path from "node:path";
import { exec as nodeExec } from "node:child_process";
import util from "node:util";
import { minify } from "./minify.mjs";

const exec = util.promisify( nodeExec );

const pkg = JSON.parse( await fs.readFile( "./package.json", "utf8" ) );

async function isCleanWorkingDir() {
    const { stdout } = await exec( "git status --untracked-files=no --porcelain" );
    return !stdout.trim();
}

async function versionForDist( { srcPath, destPath, version } ) {
    const code = await fs.readFile( srcPath, "utf8" );
    const compiledContents = code.replace( /@VERSION/g, version );

    await fs.mkdir( path.dirname( destPath ), { recursive: true } );
    await fs.writeFile( destPath, compiledContents );
    console.log( `${ destPath } v${ version } created.` );
}

export async function build( { version = process.env.VERSION } = {} ) {

    // Add the short commit hash to the version string
    // when the version is not for a release.
    if ( !version ) {
        const { stdout } = await exec( "git rev-parse --short HEAD" );
        const isClean = await isCleanWorkingDir();

        // "+SHA" is semantically correct
        // Add ".dirty" as well if the working dir is not clean
        version = `${ pkg.version }+${ stdout.trim() }${
            isClean ? "" : ".dirty"
        }`;
    }

    await versionForDist( {
        srcPath: "src/jquery.mousewheel.js",
        destPath: "dist/jquery.mousewheel.js",
        version
    } );

    await minify( {
        srcPath: "dist/jquery.mousewheel.js",
        destPath: "dist/jquery.mousewheel.min.js",
        version
    } );
}
