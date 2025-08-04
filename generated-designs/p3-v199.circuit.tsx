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
    connections={{pin1: "U1.1", pin2: "net.GND"}}
    />
    <group>
    <capacitor
    name="C2_3"
    capacitance="100nF"
    schX="2.6"
    schY="-0.1"
    schRotation="-90deg"
    connections={{pin1: "U1.2", pin2: "U1.3"}}
    />
    <resistor
    name="R2_3"
    resistance="1k"
    schX="1.5999999999999999"
    schY="-0.1"
    schRotation="-90deg"
    connections={{pin1: "U1.2", pin2: "U1.3"}}
    />
    </group>
  </board>
)