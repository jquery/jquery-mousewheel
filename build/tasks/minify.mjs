import fs from "node:fs/promises";
import swc from "@swc/core";
import path from "node:path";

export async function minify( { srcPath, destPath, version } ) {
    const contents = await fs.readFile( srcPath, "utf8" );

    await fs.mkdir( path.dirname( destPath ), { recursive: true } );

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
                asciiOnly: true,
                comments: false,
                preamble: `/*! jQuery Mousewheel ${ version }` +
                    " | (c) OpenJS Foundation and other contributors" +
                    " | jquery.org/license */\n"
            },
            inlineSourcesContent: false,
            mangle: true,
            module: false,
            sourceMap: false
        }
    );

    await fs.writeFile(
        destPath,
        code
    );

    console.log( `file ${ destPath } created.` );
}
