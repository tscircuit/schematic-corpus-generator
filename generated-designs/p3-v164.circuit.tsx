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
    <group>
      <resistor
        name="R2_1"
        resistance="1000"
        schX="1.8"
        schY="1"
        schRotation="-90deg"
        connections={{ pin1: "net.VCC", pin2: "U1.2" }}
      />
      <resistor
        name="R2_2"
        resistance="1000"
        schX="1.8"
        schY="-1"
        schRotation="-90deg"
        connections={{ pin1: "U1.2", pin2: "net.GND" }}
      />
    </group>
    <group>
      <capacitor
        name="C3_1"
        capacitance="100nF"
        schX="2.6"
        schY="-1.2"
        schRotation="-90deg"
        connections={{ pin1: "U1.3", pin2: "net.GND" }}
      />
      <capacitor
        name="C3_2"
        capacitance="100nF"
        schX="3.6"
        schY="-1.2"
        schRotation="-90deg"
        connections={{ pin1: "U1.3", pin2: "net.GND" }}
      />
      <capacitor
        name="C3_3"
        capacitance="100nF"
        schX="4.6"
        schY="-1.2"
        schRotation="-90deg"
        connections={{ pin1: "U1.3", pin2: "net.GND" }}
      />
      <capacitor
        name="C3_4"
        capacitance="100nF"
        schX="5.6"
        schY="-1.2"
        schRotation="-90deg"
        connections={{ pin1: "U1.3", pin2: "net.GND" }}
      />
    </group>
  </board>
)
