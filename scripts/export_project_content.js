"use strict"

const fs = require("fs")
const path = require("path")
const ts = require("typescript")

require.extensions[".ts"] = (module, filename) => {
  const source = fs.readFileSync(filename, "utf8")
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
    fileName: filename,
  }).outputText
  module._compile(output, filename)
}

const projectRoot = path.resolve(__dirname, "..")
const data = require(path.join(projectRoot, "lib", "data.ts"))

process.stdout.write(JSON.stringify({
  referenceCategories: data.referenceCategories,
  checklistCategories: data.checklistCategories,
  caseCampaigns: data.caseCampaigns,
}))
