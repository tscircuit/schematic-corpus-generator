#!/usr/bin/env bun

import { parseArgs } from "util"
import { mkdir, writeFile } from "fs/promises"
import { join } from "path"
import { generateAllValidDesigns } from "./lib/designGenerator"

interface CodegenOptions {
  pinCount: number
  outputDir: string
  maxComponents: number
  verbose: boolean
}

function parseCliArgs(): CodegenOptions {
  const { values, positionals } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      "pin-count": {
        type: "string",
        short: "p",
        default: "3",
      },
      "output-dir": {
        type: "string",
        short: "o",
        default: "./generated-designs",
      },
      "max-components": {
        type: "string",
        short: "m",
        default: "10",
      },
      verbose: {
        type: "boolean",
        short: "v",
        default: false,
      },
      help: {
        type: "boolean",
        short: "h",
      },
    },
    allowPositionals: true,
  })

  if (values.help) {
    console.log(`
Usage: bun scripts/codegen.ts [options]

Options:
  -p, --pin-count <number>     Pin count to generate designs for (default: 3)
  -o, --output-dir <path>      Output directory for generated designs (default: ./generated-designs)
  -m, --max-components <number> Maximum components per design (default: 10)
  -v, --verbose               Enable verbose logging
  -h, --help                  Show this help message

Example:
  bun scripts/codegen.ts --pin-count 3 --verbose
`)
    process.exit(0)
  }

  const pinCount = parseInt(values["pin-count"] || "3")
  const maxComponents = parseInt(values["max-components"] || "10")

  if (isNaN(pinCount) || pinCount < 1) {
    console.error("Error: pin-count must be a positive integer")
    process.exit(1)
  }

  if (isNaN(maxComponents) || maxComponents < 1) {
    console.error("Error: max-components must be a positive integer")
    process.exit(1)
  }

  return {
    pinCount,
    outputDir: values["output-dir"] || "./generated-designs",
    maxComponents,
    verbose: values.verbose || false,
  }
}

async function main() {
  const options = parseCliArgs()

  console.log(`🚀 Starting codegen for pin count ${options.pinCount}`)
  console.log(`📁 Output directory: ${options.outputDir}`)
  console.log(`🔧 Max components per design: ${options.maxComponents}`)
  console.log(`📝 Verbose logging: ${options.verbose ? "enabled" : "disabled"}`)
  console.log("")

  try {
    // Ensure output directory exists
    await mkdir(options.outputDir, { recursive: true })

    // Generate all valid designs
    const validDesigns = await generateAllValidDesigns({
      pinCount: options.pinCount,
      maxComponents: options.maxComponents,
      verbose: options.verbose,
      outputDir: options.outputDir,
    })

    console.log("")
    console.log(`✅ Generation complete!`)
    console.log(
      `📊 Generated ${validDesigns.length} valid designs for pin count ${options.pinCount}`,
    )
    console.log(`📁 Files saved to: ${options.outputDir}`)
  } catch (error) {
    console.error("❌ Error during generation:", error)
    process.exit(1)
  }
}

if (import.meta.main) {
  main()
}
