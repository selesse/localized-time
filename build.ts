import { $ } from "bun";

const isDemo = process.argv.includes("--demo");

async function buildLibrary() {
  console.log("Building library...");

  // Build core
  await Bun.build({
    entrypoints: ["./src/core/index.ts"],
    outdir: "./dist/core",
    format: "esm",
    target: "browser",
    minify: false,
  });

  // Build web component
  await Bun.build({
    entrypoints: ["./src/web/index.ts"],
    outdir: "./dist/web",
    format: "esm",
    target: "browser",
    minify: false,
  });

  // Build React component
  await Bun.build({
    entrypoints: ["./src/react/index.ts"],
    outdir: "./dist/react",
    format: "esm",
    target: "browser",
    minify: false,
    external: ["react", "react/jsx-runtime"],
  });

  // Generate type declarations
  await $`tsc --emitDeclarationOnly`;

  console.log("Library built successfully!");
}

async function buildDemo() {
  console.log("Building demo...");

  // Build demo bundle
  await Bun.build({
    entrypoints: ["./demo/demo.ts"],
    outdir: "./dist/demo",
    format: "esm",
    target: "browser",
    minify: true,
  });

  // Copy HTML file with adjusted script path for production
  const html = await Bun.file("./demo/index.html").text();
  const prodHtml = html.replace("./demo.ts", "./demo.js");
  await Bun.write("./dist/demo/index.html", prodHtml);

  console.log("Demo built successfully!");
}

async function main() {
  await buildLibrary();

  if (isDemo) {
    await buildDemo();
  }
}

main().catch(console.error);
