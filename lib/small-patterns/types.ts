export interface SmallPatternProps {
  pins: number[]
  pinCount: number

  /**
   * Slide variations are used to "shift" the pattern along some axis, they are
   * used to try to move patterns until there isn't a collision with another
   * pattern.
   *
   * When designing a small pattern, you should incorporate slideVariations
   * along any relevant axis.
   * - slideVariations[0] increases from ~[0, 20] as integers
   * - slideVariations[1] starts at 0 and increases both positively and
   *   negatively, i.e. [0, 1, -1, 2, -2, 3, -3, ...] up to 8
   * - slideVariations[2] increases from ~[0, 10] as integers
   *
   * The default slideVariations is [0,0,0]
   *
   * Generally, you want lower slideVariations to = the most conventional layout,
   * then use the increasing slideVariations to indicate progressively different
   * layouts with further spacing or varied positioning.
   */
  slideVariations: [number, number, number]
}

export interface SmallPatternComponent {
  (props: SmallPatternProps): React.JSX.Element | null
  /**
   * Declares which slideVariation dimensions this pattern actually uses.
   * Only the specified dimensions will be varied during animation, significantly
   * reducing the number of animation frames.
   *
   * @example
   * // Pattern only uses horizontal offset (dimension 0)
   * usedSlideVariationDimensions: [0]
   *
   * @example
   * // Pattern uses all three dimensions
   * usedSlideVariationDimensions: [0, 1, 2]
   */
  usedSlideVariationDimensions?: number[]

  getCode(props: SmallPatternProps): string
}
