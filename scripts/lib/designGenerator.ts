import { join } from "path"
import { writeFile, access } from "fs/promises"
import { constants } from "fs"
import {
  getTotalVariants,
  generatePatternApplications,
  type PatternApplication,
} from "../../lib/utils/variantGenerator"
import { applyAllFilters, type CircuitInfo } from "../../lib/codegen/filters"
import { SlideVariationSolver } from "../../lib/utils/SlideVariationSolver"
import { getUsedDimensionsPerPin } from "../../lib/utils/slide-variation-explorer"
import { Pattern1Pin } from "../../lib/small-patterns/patterns-1pin/Pattern1Pin"
import { Pattern2Pin } from "../../lib/small-patterns/patterns-2pin/Pattern2Pin"

function generateCircuitCodeString(
  patternApplications: PatternApplication[],
  allSlideVariations: [number, number, number][],
  pinCount: number,
): string {
  const range = (n: number) => Array.from({ length: n }, (_, i) => i)

  let code = `export default () => (
  <board routingDisabled>
    <chip
      name="U1"
      schPinArrangement={{
        rightSide: {
          direction: "top-to-bottom",
          pins: [${range(pinCount)
            .map((p) => p + 1)
            .join(", ")}],
        },
      }}
      schX={0}
      schY={0}
      schRotation={0}
    />`

  for (const application of patternApplications) {
    const slideVars = allSlideVariations[application.targetPin]!

    if (application.patternType === "Pattern1Pin") {
      const props = {
        pins: [application.pins[0]!],
        pinCount,
        slideVariations: slideVars,
        variant: application.patternVariant,
      }

      const patternCode = Pattern1Pin.getCode(props)
      if (patternCode.trim()) {
        code += `
    ${patternCode
      .trim()
      .split("\n")
      .map((line) => line.trim())
      .join("\n    ")}`
      }
    } else if (application.patternType === "Pattern2Pin") {
      const props = {
        pins: [application.pins[0]!, application.pins[1]!],
        pinCount,
        slideVariations: slideVars,
        variant: application.patternVariant,
      }

      const patternCode = Pattern2Pin.getCode(props)
      if (patternCode.trim()) {
        code += `
    ${patternCode
      .trim()
      .split("\n")
      .map((line) => line.trim())
      .join("\n    ")}`
      }
    }
  }

  code += `
  </board>
)`

  return code
}

export interface GenerationOptions {
  pinCount: number
  maxComponents: number
  verbose: boolean
  outputDir: string
  regenerate: boolean
  worker?: { current: number; total: number }
}

export interface ValidDesign {
  variant: number
  slideVariations: [number, number, number][]
  patternApplications: PatternApplication[]
  circuitCode: string
  filename: string
}

export async function generateAllValidDesigns(
  options: GenerationOptions,
): Promise<ValidDesign[]> {
  const { pinCount, maxComponents, verbose, outputDir, regenerate, worker } =
    options

  console.log(`🔍 Calculating total variants for pin count ${pinCount}...`)
  const totalVariants = getTotalVariants(pinCount)
  console.log(`📈 Total variants to process: ${totalVariants.toLocaleString()}`)

  // Calculate worker's variant range if worker is specified
  let startVariant = 0
  let endVariant = totalVariants

  if (worker) {
    const variantsPerWorker = Math.ceil(totalVariants / worker.total)
    startVariant = (worker.current - 1) * variantsPerWorker
    endVariant = Math.min(startVariant + variantsPerWorker, totalVariants)

    console.log(
      `👷 Worker ${worker.current}/${worker.total} processing variants ${startVariant} to ${endVariant - 1} (${endVariant - startVariant} variants)`,
    )
  }

  const validDesigns: ValidDesign[] = []
  let processedCount = 0
  let filteredCount = 0
  let solvedCount = 0
  let skippedCount = 0

  const startTime = Date.now()

  for (let variant = startVariant; variant < endVariant; variant++) {
    processedCount++

    if (
      verbose ||
      processedCount %
        Math.max(1, Math.floor((endVariant - startVariant) / 20)) ===
        0
    ) {
      const elapsed = (Date.now() - startTime) / 1000
      const rate = processedCount / elapsed
      const remaining = endVariant - variant - 1
      const eta = remaining > 0 ? remaining / rate : 0

      console.log(
        `⏳ Processing variant ${variant + 1}/${endVariant} (${(((variant - startVariant + 1) / (endVariant - startVariant)) * 100).toFixed(1)}%) - ETA: ${Math.round(eta)}s`,
      )
    }

    try {
      // Generate pattern applications for this variant
      const patternApplications = generatePatternApplications(variant, pinCount)

      // Skip if no patterns (all null)
      if (patternApplications.length === 0) {
        continue
      }

      const circuitInfo: CircuitInfo = {
        patternApplications,
        pinCount,
        variant,
      }

      // Apply filters before expensive slide variation solving
      const filterResult = applyAllFilters(circuitInfo, maxComponents)
      if (!filterResult.passed) {
        filteredCount++
        if (verbose) {
          console.log(
            `  🚫 Filtered out variant ${variant}: ${filterResult.reason}`,
          )
        }
        continue
      }

      if (verbose) {
        console.log(
          `  ✅ Variant ${variant} passed filters, solving slide variations...`,
        )
      }

      // Calculate which slideVariation dimensions are used by each pin's pattern
      const usedDimensionsPerPin = getUsedDimensionsPerPin(
        patternApplications,
        pinCount,
      )

      // Solve slide variations to find collision-free configuration
      const slideVariationSolver = new SlideVariationSolver({
        variant,
        pinCount,
        usedDimensionsPerPin,
        maxIterations: 250e3,
        onProgress: verbose
          ? (progress) => {
              if (progress.variationIndex % 500 === 0) {
                console.log(
                  `    🔄 Iteration ${progress.variationIndex}: ${JSON.stringify(progress.currentVariation)} (collisions: ${progress.collisionInfo.hasCollisions})`,
                )
              }
            }
          : undefined,
      })

      const solution = await slideVariationSolver.solve()

      if (!solution) {
        if (verbose) {
          console.log(
            `  ❌ No collision-free solution found for variant ${variant}`,
          )
        }
        continue
      }

      solvedCount++

      if (verbose) {
        console.log(
          `  🎯 Found solution for variant ${variant}: slide variations ${JSON.stringify(solution.slideVariations)}`,
        )
      }

      // Generate circuit code with the pattern applications
      const circuitCode = generateCircuitCodeString(
        patternApplications,
        solution.slideVariations,
        pinCount,
      )

      // Create filename: p{pinCount}-v{variant}.circuit.tsx
      const filename = `p${pinCount}-v${variant}.circuit.tsx`
      const filepath = join(outputDir, filename)

      // Check if file exists and skip if regenerate is false
      if (!regenerate) {
        try {
          await access(filepath, constants.F_OK)
          // File exists, skip it
          skippedCount++
          if (verbose) {
            console.log(`  ⏭️  Skipping existing file: ${filename}`)
          }
          continue
        } catch {
          // File doesn't exist, continue with generation
        }
      } else {
        // Regenerate is enabled, check if we're overwriting
        try {
          await access(filepath, constants.F_OK)
          if (verbose) {
            console.log(`  🔄 Overwriting existing file: ${filename}`)
          }
        } catch {
          // File doesn't exist, will be created
        }
      }

      // Save the design
      await writeFile(filepath, circuitCode)

      const validDesign: ValidDesign = {
        variant,
        slideVariations: solution.slideVariations,
        patternApplications,
        circuitCode,
        filename,
      }

      validDesigns.push(validDesign)

      if (verbose) {
        console.log(`  💾 Saved ${filename}`)
      }
    } catch (error) {
      console.error(`❌ Error processing variant ${variant}:`, error)
      if (verbose) {
        console.error(error)
      }
    }
  }

  const elapsed = (Date.now() - startTime) / 1000

  console.log("")
  console.log(`📊 Generation Statistics:`)
  console.log(`  Total variants processed: ${processedCount.toLocaleString()}`)
  console.log(
    `  Filtered out: ${filteredCount.toLocaleString()} (${((filteredCount / processedCount) * 100).toFixed(1)}%)`,
  )
  console.log(
    `  Passed filters: ${(processedCount - filteredCount).toLocaleString()}`,
  )
  console.log(
    `  Successfully solved: ${solvedCount.toLocaleString()} (${((solvedCount / processedCount) * 100).toFixed(1)}%)`,
  )
  if (skippedCount > 0) {
    console.log(`  Skipped existing files: ${skippedCount.toLocaleString()}`)
  }
  console.log(`  Total time: ${elapsed.toFixed(1)}s`)
  console.log(
    `  Average time per variant: ${((elapsed / processedCount) * 1000).toFixed(1)}ms`,
  )

  return validDesigns
}
