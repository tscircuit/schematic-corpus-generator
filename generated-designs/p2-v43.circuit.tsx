export default () => (
  <board routingDisabled>
    <chip
      name="U1"
      schPinArrangement={{
        rightSide: {
          direction: "top-to-bottom",
          pins: [1, 2],
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
    schY="-1.0999999999999999"
    schRotation="-90deg"
    connections={{pin1: "U1.1", pin2: "net.GND"}}
    />
    <capacitor
    name="C1_2"
    capacitance="100nF"
    schX="2"
    schY="-1.0999999999999999"
    schRotation="-90deg"
    connections={{pin1: "U1.1", pin2: "net.GND"}}
    />
    </group>
    <resistor
    name="R2"
    resistance="1000"
    schX="1.6"
    schY="-0.1"
    schRotation="0deg"
    connections={{pin1: "U1.2", pin2: "net.SIG2"}}
    />
  </board>
)