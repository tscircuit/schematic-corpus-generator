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
      <capacitor
        name="C1_1"
        capacitance="100nF"
        schX="1"
        schY="-1.2"
        schRotation="-90deg"
        connections={{ pin1: "U1.1", pin2: "net.GND" }}
      />
      <capacitor
        name="C1_2"
        capacitance="100nF"
        schX="2"
        schY="-1.2"
        schRotation="-90deg"
        connections={{ pin1: "U1.1", pin2: "net.GND" }}
      />
    </group>
    <group>
      <capacitor
        name="C3_1"
        capacitance="100nF"
        schX="3"
        schY="-1.2"
        schRotation="-90deg"
        connections={{ pin1: "U1.3", pin2: "net.GND" }}
      />
      <capacitor
        name="C3_2"
        capacitance="100nF"
        schX="4"
        schY="-1.2"
        schRotation="-90deg"
        connections={{ pin1: "U1.3", pin2: "net.GND" }}
      />
    </group>
  </board>
)
