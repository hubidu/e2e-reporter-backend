import moment from 'moment'

const capValue = val => val >= 1.0 ? 1.0 : val

const defaultLabelFormatFn = d => moment(d.t).format("ddd, H:mm") + ' in ' + d.value + ' s'

const BarWidth = 5
const BarGap = 1
const Height = 30

const color = success => success ? '#23d160' : '#ff3860'
const selectedColor = selected => selected ? 'blue' : '#eee'
const byDate = (a, b) => {
  return a.t - b.t
}
const desc = sortFn => (a, b) => -1 * sortFn(a, b)

export default ({ data, markers = [], selectedBar = -1, labelFormatFn = defaultLabelFormatFn, maxBars = 10, maxValue = 120, onBarClicked = () => {} }) => {
  let mappedData = [...data, ...markers].sort(desc(byDate)).slice(0, maxBars - 1)

  let i = mappedData.length - 1
  while (i > 0) {
    if (mappedData[i].value === undefined) {
      mappedData[i] = undefined
      i = i - 1
    } else {
      break
    }
  }
  mappedData = mappedData.filter(m => !!m)

  return (
      <div
        className="TestHistoryBars"
        style={{display: 'inline-block', 'lineHeight': 1, 'verticalAlign': 'baseline', height: `${Height}px`, width: `${maxBars * (BarWidth + BarGap)}px`}}>
      {
        mappedData.map((d, i) =>
          <a href={d.href} key={i}
            style={{'position': 'relative', display: 'inline-block', width: `${BarWidth}px`, 'height': `100%`, 'marginRight': `${BarGap}px`, 'backgroundColor': `#fff`, 'borderBottom': `2px solid ${selectedColor(selectedBar === i)}`}}
            title={labelFormatFn(d)}
            onClick={ev => onBarClicked(i)}
            >
                { d.value === undefined ?
                  <span className="TestHistoryBars-bar"
                    style={{display: 'block', 'position': 'absolute', 'left': `${BarWidth/2}px`,'bottom': 0, height: `${Height}px`, width: `2px`, 'backgroundColor': `#96ccff`}}
                    onClick={ev => onBarClicked(i)}
                  >
                  &nbsp;
                  </span>

                  :
                  <span className="TestHistoryBars-bar"
                    style={{display: 'block', 'position': 'absolute', 'bottom': 0, height: `${capValue(d.value / maxValue) * Height}px`, width: `${BarWidth}px`, 'backgroundColor': `${color(d.success)}`}}
                    onClick={ev => onBarClicked(i)}
                  >
                  &nbsp;
                  </span>
                }
          </a>
      )
      }
      <style jsx>{`
      .TestHistoryBars-bar:hover {
        background-color: #ccc !important;
      }
      `}</style>
      </div>
  )
}

