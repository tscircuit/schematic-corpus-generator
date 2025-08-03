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
