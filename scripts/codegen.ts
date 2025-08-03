#!/usr/bin/env bun

import { parseArgs } from "util"
import { mkdir, writeFile } from "fs/promises"
import { join } from "path"
import { spawn } from "child_process"
import { generateAllValidDesigns } from "./lib/designGenerator"

interface CodegenOptions {
  pinCount: number
  outputDir: string
  maxComponents: number
  verbose: boolean
  regenerate: boolean
  worker?: { current: number; total: number }
  parallelWorkers?: number
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
      regenerate: {
        type: "boolean",
        short: "r",
        default: false,
      },
      worker: {
        type: "string",
        short: "w",
      },
      "parallel-workers": {
        type: "string",
        short: "j",
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
  -r, --regenerate            Overwrite existing files (default: false)
  -w, --worker <fraction>     Worker fraction (e.g., 1/3 for worker 1 of 3)
  -j, --parallel-workers <number> Number of parallel workers to spawn
  -h, --help                  Show this help message

Examples:
  bun scripts/codegen.ts --pin-count 3 --verbose
  bun scripts/codegen.ts --pin-count 3 --parallel-workers 4
  bun scripts/codegen.ts --pin-count 3 --worker 1/3
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

  // Parse worker fraction
  let worker: { current: number; total: number } | undefined
  if (values.worker) {
    const match = values.worker.match(/^(\d+)\/(\d+)$/)
    if (!match) {
      console.error("Error: worker must be in format 'current/total' (e.g., '1/3')")
      process.exit(1)
    }
    const current = parseInt(match[1])
    const total = parseInt(match[2])
    if (current < 1 || current > total || total < 1) {
      console.error("Error: worker fraction must be valid (e.g., '1/3', '2/3', '3/3')")
      process.exit(1)
    }
    worker = { current, total }
  }

  // Parse parallel workers
  let parallelWorkers: number | undefined
  if (values["parallel-workers"]) {
    parallelWorkers = parseInt(values["parallel-workers"])
    if (isNaN(parallelWorkers) || parallelWorkers < 1) {
      console.error("Error: parallel-workers must be a positive integer")
      process.exit(1)
    }
  }

  return {
    pinCount,
    outputDir: values["output-dir"] || "./generated-designs",
    maxComponents,
    verbose: values.verbose || false,
    regenerate: values.regenerate || false,
    worker,
    parallelWorkers,
  }
}

async function spawnWorkers(options: CodegenOptions): Promise<void> {
  if (!options.parallelWorkers) {
    throw new Error("parallelWorkers must be specified when spawning workers")
  }

  const workers: Promise<void>[] = []
  
  for (let i = 1; i <= options.parallelWorkers; i++) {
    const workerArgs = [
      "scripts/codegen.ts",
      "--pin-count", options.pinCount.toString(),
      "--output-dir", options.outputDir,
      "--max-components", options.maxComponents.toString(),
      "--worker", `${i}/${options.parallelWorkers}`,
    ]
    
    if (options.verbose) workerArgs.push("--verbose")
    if (options.regenerate) workerArgs.push("--regenerate")

    const workerPromise = new Promise<void>((resolve, reject) => {
      const child = spawn("bun", workerArgs, {
        stdio: "pipe",
      })

      child.stdout?.on("data", (data) => {
        const output = data.toString()
        // Prefix worker output with worker ID
        process.stdout.write(`[Worker ${i}/${options.parallelWorkers}] ${output}`)
      })

      child.stderr?.on("data", (data) => {
        const output = data.toString()
        process.stderr.write(`[Worker ${i}/${options.parallelWorkers}] ${output}`)
      })

      child.on("close", (code) => {
        if (code === 0) {
          resolve()
        } else {
          reject(new Error(`Worker ${i}/${options.parallelWorkers} exited with code ${code}`))
        }
      })

      child.on("error", (err) => {
        reject(new Error(`Worker ${i}/${options.parallelWorkers} failed to start: ${err.message}`))
      })
    })

    workers.push(workerPromise)
  }

  try {
    await Promise.all(workers)
    console.log(`\n✅ All ${options.parallelWorkers} workers completed successfully!`)
  } catch (error) {
    console.error(`\n❌ One or more workers failed:`, error)
    process.exit(1)
  }
}

async function main() {
  const options = parseCliArgs()

  // If parallel workers specified, spawn workers instead of running directly
  if (options.parallelWorkers) {
    console.log(`🚀 Starting ${options.parallelWorkers} parallel workers for pin count ${options.pinCount}`)
    console.log(`📁 Output directory: ${options.outputDir}`)
    console.log(`🔧 Max components per design: ${options.maxComponents}`)
    console.log(`📝 Verbose logging: ${options.verbose ? "enabled" : "disabled"}`)
    console.log(`🔄 Regenerate existing files: ${options.regenerate ? "enabled" : "disabled"}`)
    console.log("")
    
    await spawnWorkers(options)
    return
  }

  // Single worker mode (including when --worker is specified)
  const workerInfo = options.worker ? ` (Worker ${options.worker.current}/${options.worker.total})` : ""
  console.log(`🚀 Starting codegen for pin count ${options.pinCount}${workerInfo}`)
  console.log(`📁 Output directory: ${options.outputDir}`)
  console.log(`🔧 Max components per design: ${options.maxComponents}`)
  console.log(`📝 Verbose logging: ${options.verbose ? "enabled" : "disabled"}`)
  console.log(`🔄 Regenerate existing files: ${options.regenerate ? "enabled" : "disabled"}`)
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
      regenerate: options.regenerate,
      worker: options.worker,
    })

    console.log("")
    console.log(`✅ Generation complete!${workerInfo}`)
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
