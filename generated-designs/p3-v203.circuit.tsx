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
    <group>
      <resistor
        name="R1_1"
        resistance="1000"
        schX="1.6"
        schY="1.2"
        schRotation="-90deg"
        connections={{ pin1: "net.VCC", pin2: "U1.1" }}
      />
      <resistor
        name="R1_2"
        resistance="1000"
        schX="1.6"
        schY="-0.8"
        schRotation="-90deg"
        connections={{ pin1: "U1.1", pin2: "net.GND" }}
      />
    </group>
    <group>
      <resistor
        name="R3_1"
        resistance="1000"
        schX="2.4000000000000004"
        schY="0.8"
        schRotation="-90deg"
        connections={{ pin1: "net.VCC", pin2: "U1.3" }}
      />
      <resistor
        name="R3_2"
        resistance="1000"
        schX="2.4000000000000004"
        schY="-1.2"
        schRotation="-90deg"
        connections={{ pin1: "U1.3", pin2: "net.GND" }}
      />
    </group>
  </board>
)
