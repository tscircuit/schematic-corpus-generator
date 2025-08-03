export const getPinPosition = (pin: number, pinCount: number) => {
  return {
    x: 0.6,
    y:
      (0.2 * (pinCount - 1)) / 2 -
      ((pin - 1) / (pinCount - 1)) * (0.2 * (pinCount - 1)),
  }
}
