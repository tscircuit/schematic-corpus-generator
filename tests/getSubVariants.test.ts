import { expect, test } from "bun:test"
import { getSubVariants } from "../lib/utils/getSubVariants"

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
