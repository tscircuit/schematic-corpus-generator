export const Toolbar = (props: {
  variant: number
  pinCount: number
  onChangeVariant: (newVariant: number) => void
  onChangePinCount: (newPinCount: number) => void
}) => {
  const { variant, pinCount } = props
  return (
    <div>
      <label>
        Variant:{" "}
        <input
          type="number"
          name="variant"
          value={variant}
          min={0}
          onChange={(e: any) => props.onChangeVariant(Number(e.target.value))}
        />
      </label>
      <label style={{ marginLeft: 16 }}>
        Pin Count:{" "}
        <input
          type="number"
          name="pinCount"
          value={pinCount}
          min={1}
          onChange={(e: any) => props.onChangePinCount(Number(e.target.value))}
        />
      </label>
    </div>
  )
}
