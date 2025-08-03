import { join } from "path"
import { writeFile } from "fs/promises"
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
  const { pinCount, maxComponents, verbose, outputDir } = options

  console.log(`🔍 Calculating total variants for pin count ${pinCount}...`)
  const totalVariants = getTotalVariants(pinCount)
  console.log(`📈 Total variants to process: ${totalVariants.toLocaleString()}`)

  const validDesigns: ValidDesign[] = []
  let processedCount = 0
  let filteredCount = 0
  let solvedCount = 0

  const startTime = Date.now()

  for (let variant = 0; variant < totalVariants; variant++) {
    processedCount++

    if (
      verbose ||
      processedCount % Math.max(1, Math.floor(totalVariants / 20)) === 0
    ) {
      const elapsed = (Date.now() - startTime) / 1000
      const rate = processedCount / elapsed
      const eta =
        totalVariants > processedCount
          ? (totalVariants - processedCount) / rate
          : 0

      console.log(
        `⏳ Processing variant ${variant + 1}/${totalVariants} (${((variant / totalVariants) * 100).toFixed(1)}%) - ETA: ${Math.round(eta)}s`,
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
        maxIterations: 100e3,
        onProgress: verbose
          ? (progress) => {
              if (progress.variationIndex % 100 === 0) {
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
  console.log(`  Total time: ${elapsed.toFixed(1)}s`)
  console.log(
    `  Average time per variant: ${((elapsed / processedCount) * 1000).toFixed(1)}ms`,
  )

  return validDesigns
}
