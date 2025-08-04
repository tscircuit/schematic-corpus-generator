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
    schY="0.8"
    schRotation="0deg"
    connections={{pin1: "U1.1", pin2: "net.SIG1"}}
    />
    <group>
    <capacitor
    name="C2_3"
    capacitance="100nF"
    schX="2.4"
    schY="-0.1"
    schRotation="-90deg"
    connections={{pin1: "U1.2", pin2: "U1.3"}}
    />
    <resistor
    name="R2_3"
    resistance="1k"
    schX="1.4"
    schY="-0.1"
    schRotation="-90deg"
    connections={{pin1: "U1.2", pin2: "U1.3"}}
    />
    </group>
  </board>
)