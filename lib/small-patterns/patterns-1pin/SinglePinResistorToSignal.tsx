export const SinglePinResistorToSignal = ({ pins }: { pins: [number] }) => {
  const [pin] = pins

  return (
    <resistor
      name={`R${pin}`}
      resistance={1000}
      connections={{
        pin1: `U1.${pin}`,
        pin2: `net.SIG${pin}`,
      }}
    />
  )
}
