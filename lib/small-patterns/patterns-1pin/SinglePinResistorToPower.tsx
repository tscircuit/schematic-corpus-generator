import { getPinPosition } from "../utils/getPinPosition"

export const SinglePinResistorToPower = ({
  pins,
  pinCount,
}: {
  pins: [number]
  pinCount: number
}) => {
  const [pin] = pins
  const pinPosition = getPinPosition(pin, pinCount)

  return (
    <resistor
      name={`R${pin}`}
      resistance={1000}
      schX={pinPosition.x + 1}
      schY={pinPosition.y + 1}
      schRotation="90deg"
      connections={{
        pin1: `U1.${pin}`,
        pin2: "net.VCC",
      }}
    />
  )
}
