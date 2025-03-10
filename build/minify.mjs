import fs from "node:fs/promises";
import path from "node:path";
import swc from "@swc/core";

const rjs = /\.js$/;

export async function minify( { filename, dir } ) {
    const contents = await fs.readFile( path.join( dir, filename ), "utf8" );

    const { code } = await swc.minify(
        contents,
        {
            compress: {
                ecma: 5,
                hoist_funs: false,
                loops: false
            },
            format: {
                ecma: 5,
                asciiOnly: true
            },
            inlineSourcesContent: false,
            mangle: true,
            module: false,
            sourceMap: false
        }
    );

    const minFilename = filename.replace( rjs, ".min.js" );

    await fs.writeFile(
        path.join( dir, minFilename ),
        code
    );

    console.log( `file ${ minFilename } created.` );
}
