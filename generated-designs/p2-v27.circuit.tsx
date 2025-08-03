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
    <resistor
    name="R1_1"
    resistance="1000"
    schX="1.6"
    schY="1.1"
    schRotation="-90deg"
    connections={{pin1: "net.VCC", pin2: "U1.1"}}
    />
    <resistor
    name="R1_2"
    resistance="1000"
    schX="1.6"
    schY="-0.9"
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