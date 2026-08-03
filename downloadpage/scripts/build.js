#!/usr/bin/env node

/**
 * GitHub Release Download Beta
 * Build Script
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const DIST = path.join(ROOT, "dist");

const OUTPUT = path.join(
    DIST,
    "download.html"
);

function log(message) {
    console.log(
        `[Build] ${message}`
    );
}

function runBuild() {

    log("Running Vite build...");

    execSync(
        "pnpm run build",
        {
            stdio: "inherit"
        }
    );

}

function checkOutput() {

    if (!fs.existsSync(OUTPUT)) {

        throw new Error(
            "dist/download.html not found."
        );

    }

    log("download.html generated.");

}

function cleanup() {

    const files =
        fs.readdirSync(DIST);

    for (const file of files) {

        if (
            file === "download.html"
        )
            continue;

        fs.rmSync(
            path.join(DIST, file),
            {
                recursive: true,
                force: true
            }
        );

        log(
            `Removed ${file}`
        );

    }

}

function appendBuildInfo() {

    const html =
        fs.readFileSync(
            OUTPUT,
            "utf8"
        );

    const info =
`\n<!--
GitHub Release Download Beta
Built: ${new Date().toISOString()}
-->
`;

    fs.writeFileSync(
        OUTPUT,
        html + info
    );

}

function printSize() {

    const stat =
        fs.statSync(OUTPUT);

    const size =
        (
            stat.size /
            1024
        ).toFixed(2);

    log(
        `download.html (${size} KB)`
    );

}

async function main() {

    // 个人用不到它
    // console.clear();

    log(
        "GitHub Release Download Beta"
    );

    runBuild();

    checkOutput();

    cleanup();

    appendBuildInfo();

    printSize();

    log(
        "Done."
    );

}

main().catch(error => {

    console.error();

    console.error(error);

    process.exit(1);

});