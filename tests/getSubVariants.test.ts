import { expect, test } from "bun:test"
import {
  getSubVariants,
  SubVariantGenerator,
} from "../lib/utils/getSubVariants"

test("getSubVariants should work correctly for basic case", () => {
  // Test case: 2 dimensions with 3 and 4 variants respectively
  const ar = []
  for (let i = 0; i < 12; i++) {
    ar.push(getSubVariants(i, [3, 4]))
  }
  expect(ar.map((v) => v.join(","))).toMatchInlineSnapshot(`
    [
      "0,0",
      "0,1",
      "0,2",
      "0,3",
      "1,0",
      "1,1",
      "1,2",
      "1,3",
      "2,0",
      "2,1",
      "2,2",
      "2,3",
    ]
  `)
})

test("SubVariantGenerator should work correctly with .get() method", () => {
  const generator = new SubVariantGenerator([3, 4])

  // Test getting variants in order
  const variants = []
  for (let i = 0; i < 12; i++) {
    variants.push(generator.get(i))
  }

  expect(variants.map((v) => v?.join(","))).toMatchInlineSnapshot(`
    [
      "0,0",
      "0,1",
      "0,2",
      "0,3",
      "1,0",
      "1,1",
      "1,2",
      "1,3",
      "2,0",
      "2,1",
      "2,2",
      "2,3",
    ]
  `)

  // Test that getting out of bounds returns null
  expect(generator.get(12)).toBe(null)
  expect(generator.get(100)).toBe(null)
})

test("SubVariantGenerator should work correctly with .next() method", () => {
  const generator = new SubVariantGenerator([3, 4])

  const variants = []
  let variant = generator.next()
  while (variant !== null) {
    variants.push(variant)
    variant = generator.next()
  }

  expect(variants.map((v) => v.join(","))).toMatchInlineSnapshot(`
    [
      "0,0",
      "0,1",
      "0,2",
      "0,3",
      "1,0",
      "1,1",
      "1,2",
      "1,3",
      "2,0",
      "2,1",
      "2,2",
      "2,3",
    ]
  `)
})

test("SubVariantGenerator should handle shouldSkip function correctly", () => {
  const generator = new SubVariantGenerator([3, 3], (subVariants) => {
    // Skip variants where both values are even
    return subVariants[0]! % 2 === 0 && subVariants[1]! % 2 === 0
  })

  const variants = []
  for (let i = 0; i < 10; i++) {
    const variant = generator.get(i)
    if (variant === null) break
    variants.push(variant)
  }

  expect(variants.map((v) => v.join(","))).toMatchInlineSnapshot(`
    [
      "0,1",
      "1,0",
      "1,1",
      "1,2",
      "2,1",
    ]
  `)
})

test("SubVariantGenerator should match getSubVariants results", () => {
  const subVariantCounts = [2, 3, 2]
  const generator = new SubVariantGenerator(subVariantCounts)

  // Compare first 12 results
  for (let i = 0; i < 12; i++) {
    const generatorResult = generator.get(i)
    const getSubVariantsResult = getSubVariants(i, subVariantCounts)

    expect(generatorResult).toEqual(getSubVariantsResult)
  }
})

test("SubVariantGenerator getTotalCount should work correctly", () => {
  const generator = new SubVariantGenerator([3, 4])
  expect(generator.getTotalCount()).toBe(12)

  const generatorWithSkip = new SubVariantGenerator([3, 3], (subVariants) => {
    return subVariants[0]! % 2 === 0 && subVariants[1]! % 2 === 0
  })
  expect(generatorWithSkip.getTotalCount()).toBe(5)
})
