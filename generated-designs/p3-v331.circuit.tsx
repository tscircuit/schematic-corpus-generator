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
  </board>
)
