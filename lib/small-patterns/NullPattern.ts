import type { SmallPatternProps, SmallPatternComponent } from "./types"

export const NullPattern: SmallPatternComponent = (
  props: SmallPatternProps,
) => {
  return null
}

NullPattern.usedSlideVariationDimensions = []
NullPattern.getCode = () => {
  return ""
}
