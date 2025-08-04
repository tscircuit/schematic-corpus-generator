export default () => (
  <board routingDisabled>
    <chip
      name="U1"
      schPinArrangement={{
        rightSide: {
          direction: "top-to-bottom",
          pins: [1, 2, 3],
        },
      }}
      schX={0}
      schY={0}
      schRotation={0}
    />
    <resistor
      name="R1"
      resistance="1000"
      schX="1"
      schY="-1.2"
      schRotation="-90deg"
      connections={{ pin1: "U1.1", pin2: "net.GND" }}
    />
    <resistor
      name="R2"
      resistance="1000"
      schX="1.8"
      schY="-1.2"
      schRotation="-90deg"
      connections={{ pin1: "U1.2", pin2: "net.GND" }}
    />
    <resistor
      name="R3"
      resistance="1000"
      schX="1"
      schY="1.2"
      schRotation="90deg"
      connections={{ pin1: "U1.3", pin2: "net.VCC" }}
    />
  </board>
)
