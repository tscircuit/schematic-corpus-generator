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
      schX="1.6"
      schY="0.2"
      schRotation="0deg"
      connections={{ pin1: "U1.1", pin2: "net.SIG1" }}
    />
    <group>
      <resistor
        name="R3_1"
        resistance="1000"
        schX="1.6"
        schY="1.1"
        schRotation="-90deg"
        connections={{ pin1: "net.VCC", pin2: "U1.3" }}
      />
      <resistor
        name="R3_2"
        resistance="1000"
        schX="1.6"
        schY="-1.1"
        schRotation="-90deg"
        connections={{ pin1: "U1.3", pin2: "net.GND" }}
      />
    </group>
  </board>
)
