export const SinglePinToVoltageDivider = ({ pins }: { pins: [number] }) => {
  const [pin] = pins

  return (
    <group>
      <resistor
        name={`R${pin}_1`}
        resistance={1000}
        schRotation="90deg"
        connections={{
          pin1: `net.VCC`,
          pin2: "net.GND",
        }}
      />
      <resistor
        name={`R${pin}_2`}
        resistance={1000}
        schRotation="90deg"
        connections={{
          pin1: `U1.${pin}`,
          pin2: "net.GND",
        }}
      />
    </group>
  )
}
