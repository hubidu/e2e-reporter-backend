import TestError from '../components/test-error'
import TestSourceStacktrace from '../components/test-source-stacktrace'

import round from '../services/utils/round'

const filePathSplit = filepath => {
  let parts = filepath.split('\\')
  if (parts.length === 0) parts = filepath.split('/')

  return {
    file: parts[parts.length - 1],
    path: parts.slice(1, parts.length - 1).join('/')
  }
}

const backgroundColor = meta => {
  if (!meta) return

  if (meta.Success === true) return 'has-background-success'
  if (meta.Success === false) return 'has-background-danger'
  return ''
}

const formatRelTime = (startedAt, meta) => round((meta.ShotAt - startedAt) / 1000, 1)

const hasMetaInfo = line => line.meta
const hasMoreThanOneStackframe = line => line.meta.CodeStack && line.meta.CodeStack.length > 1


const TestSourceLine = ({startedAt, selected, isInRange, lineNo, line, onClick}) =>
  <div
    className={`TestSourceLine ${hasMetaInfo(line) ? 'TestSourceLine--selectable' : ''} ${selected ? 'TestSourceLine--selected' : ''}`}
    key={lineNo}
    onClick={(e) => onClick &&
       hasMetaInfo(line) &&
       onClick({
      lineNo,
      line
    })}>

    <div className={`${isInRange ? 'has-text-dark' : ''}`}>
      <span className="TestSourceLine-relTime has-text-grey">
        {`${line.meta ? formatRelTime(startedAt, line.meta) : '' }`}
      </span>

      <span className={`TestSourceLine-indicator ${backgroundColor(line.meta)}`}>&nbsp;</span>

      <span className="TestSourceLine-lineNo">
        {lineNo}
      </span>

      <span className={`TestSourceLine-code`}>
        {line.source}
      </span>
    </div>
    {
      hasMetaInfo(line) &&
      line.meta.Success === false &&
        <div className="TestSourceLine-errorBox is-clipped">
          <TestError screenshot={line.meta} />
        </div>
    }
    {
      selected &&
      hasMetaInfo(line) &&
      hasMoreThanOneStackframe(line) &&
        <TestSourceStacktrace stack={line.meta.CodeStack} />
    }

    <style jsx>{`
    .TestSourceLine {
      line-height: 1.2em;
    }
    .TestSourceLine-relTime {
      display: inline-block;
      width: 3em;
      font-size: 0.75em;
    }
    .TestSourceLine--selectable {
      font-weight: bold;
      background-color: #eee;
    }
    .TestSourceLine--selectable:hover {
      cursor: pointer;
      background-color: #ccc;
    }
    .TestSourceLine--selected {
    }
    .TestSourceLine-indicator {
      display: inline-block;
      border-radius: 2px;
      width: 1.2em;
      margin: 2px 2px 1px 1px;
      background-color: fafafa;
    }
    .TestSourceLine-lineNo {
      display: inline-block;
      width: 3em;
    }
    .TestSourceLine-code {

    }
    .TestSourceLine-errorBox {
      margin-top: 1em;
      margin-left: 1.3em;
      padding: 5px 1em;
    }
    `}</style>
  </div>

const isInRange = (range, lineNo) => range && (lineNo >= range[0] && lineNo <= range[1])

export default ({startedAt, filepath, source, selectedLine, lineRange, onClickLine}) =>
  <div>
    <p className="has-text-grey is-size-7">
      {filePathSplit(filepath).file}
      <span className="has-text-grey-light"> - {filePathSplit(filepath).path}</span>
    </p>
    <pre className="TestSourceView-content has-text-grey-light has-background-white is-size-7">
      <code>
      {
        source.map((l, i) =>
          <TestSourceLine
            key={i}
            startedAt={startedAt}
            selected={selectedLine === i + 1}
            isInRange={isInRange(lineRange, i)}
            lineNo={i + 1}
            line={l}
            onClick={(e) => onClickLine && onClickLine(e)}
          />
        )
      }
      </code>
    </pre>
    <style jsx>{`
    .TestSourceView-content {
      overflow-x: hidden;
      padding: 0;
    }
    `}</style>
  </div>
