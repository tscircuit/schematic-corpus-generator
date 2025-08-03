export const Toolbar = (props: {
  variant: number
  pinCount: number
  allSlideVariations: Array<[number, number, number]>
  onChangeVariant: (newVariant: number) => void
  onChangePinCount: (newPinCount: number) => void
  onChangeAllSlideVariations: (
    newAllSlideVariations: Array<[number, number, number]>,
  ) => void
}) => {
  const { variant, pinCount } = props
  return (
    <div>
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
            onChange={(e: any) =>
              props.onChangePinCount(Number(e.target.value))
            }
          />
        </label>
      </div>
      <details>
        <summary style={{ paddingTop: 4, paddingBottom: 4 }}>
          Slide Variations
        </summary>
        <div>
          {props.allSlideVariations.map((slideVariations, index) => (
            <div key={`slide-variation-${index}`}>
              {slideVariations.map((value, dimIdx) => (
                <input
                  key={`slide-var-input-${index}-${dimIdx}`}
                  type="number"
                  value={value}
                  style={{ width: 40, marginRight: 4 }}
                  onChange={(e: any) => {
                    const newValue = Number(e.target.value)
                    const newAllSlideVariations = props.allSlideVariations.map(
                      (sv, i) =>
                        i === index
                          ? [
                              ...sv.slice(0, dimIdx),
                              newValue,
                              ...sv.slice(dimIdx + 1),
                            ]
                          : sv,
                    )
                    props.onChangeAllSlideVariations(
                      newAllSlideVariations as any,
                    )
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </details>
    </div>
  )
}
