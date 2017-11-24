import React from 'react'
import{Card, Image, Icon, Header, Label, Item} from 'semantic-ui-react'
import moment from 'moment'

import Layout from '../components/layout'
import Collapsible from '../components/Collapsible'
import SourceCodeSnippet from '../components/SourceCodeSnippet'
import SuccessesAndFailuresBars from '../components/SuccessesAndFailuresBars'
import TestResultDeviceIcon from '../components/test-result-device-icon'
import getReportById from '../services/get-report-by-id'
import getReportsByCategory from '../services/get-reports-by-category'
import getScreenshotUrl from '../services/get-sceenshot-url'

import SuccessIcon from 'react-icons/lib/fa/check'
import FailIcon from 'react-icons/lib/md/close'

const MAX_RECENT_FAILURES = 4

const mapToSuccessAndFailure = historicReports => historicReports.map(r => Object.assign({}, {
  t: r.StartedAt,
  value: r.Duration,
  success: r.Result === 'success',
  href: `/details?id=${r._id}`
}))

const AtSecond = ({shotAt, startShotAt}) =>
  <span>
    {(shotAt - startShotAt) / 1000}
  </span>

// const ResultIcon = ({report}) =>
//   report.Result === 'success' ? <span className="f2 light-green"><SuccessIcon /></span> : <span className="f2 orange"><FailIcon /></span>

const CommandName = ({codeStack}) =>
  <span>
    {
      codeStack[0].Source.find(src => src.Line === codeStack[0].Location.Line)
        .Value
        .replace('await', '')
        .replace('(', ' (')
        .trim()
    }
  </span>

const color = success => success ? 'green' : 'orange'

const trunc = msg => msg ? msg.substring(0, 50) + '...' : msg

const indexOfReport = (report, reports) => reports.findIndex(r => r._id === report._id)

// const Timeline = ({reportDir, startTimeline, timeline}) =>
//   <div className="Timeline mt4">
//     <h3>Sequence of steps ({timeline.length})</h3>
//     <Item.Group divided>
//     {
//       timeline.map((s, i) =>
//       <Item key={i}>
//         <Item.Image as='a' size='medium' target='_blank' href={getScreenshotUrl(reportDir, s.Screenshot)} src={getScreenshotUrl(reportDir, s.Screenshot)} />
//         <Item.Content>
//           <Item.Header>
//             <CommandName codeStack={s.CodeStack} />
//           </Item.Header>
//           <Item.Meta>
//             at second <AtSecond shotAt={s.ShotAt} startShotAt={startTimeline} />
//           </Item.Meta>
//           <Item.Meta>
//             <a href={s.Page.Url}>{s.Page.Title}</a>
//           </Item.Meta>
//           <Item.Meta>
//           { s.Message &&
//             <Label size='medium' basic color="orange">
//               {s.Message}
//             </Label>
//           }
//           </Item.Meta>
//           <Item.Description>
//             <small>
//               <SourceCodeSnippet key={i} code={s.CodeStack[0].Source} location={s.CodeStack[0].Location} />
//             </small>
//           </Item.Description>
//           <Item.Extra>
//             { s.Success === false &&
//               <span>
//                 <pre>
//                   <code>
//                     {s.OrgStack}
//                   </code>
//                 </pre>

//               </span>
//             }
//           </Item.Extra>
//         </Item.Content>
//       </Item>
//       )
//     }
//     </Item.Group>
//   </div>

  const Timeline = ({reportDir, startTimeline, timeline}) =>
  <div className="Timeline mt4">
    <h3>Sequence of steps ({timeline.length})</h3>

    <Card.Group itemsPerRow={4}>
    {
      timeline.map((s, i) =>
            <Card stackable>
              <Card.Content>

                <Card.Meta>
                  <small>
                    after <AtSecond shotAt={s.ShotAt} startShotAt={startTimeline} />s
                  </small>
                </Card.Meta>

                <Card.Meta>
                  <a href={s.Page.Url}>{s.Page.Title}</a>
                </Card.Meta>

                <div className="f6 h3">
                  <CommandName codeStack={s.CodeStack} />
                </div>

                <Image as='a' size='large' target='_blank' href={getScreenshotUrl(reportDir, s.Screenshot)} src={getScreenshotUrl(reportDir, s.Screenshot)} />

                <Card.Content textAlign="center" className="mt3">
                  {s.Message &&
                    <Label size='tiny' basic color="orange">
                      {s.Message}
                    </Label>
                  }
                </Card.Content>

                <Card.Content extra>
                  <div className="mt1">
                  <Collapsible className="mt2" label="Source">
                    <small>
                      <SourceCodeSnippet code={s.CodeStack[0].Source} location={s.CodeStack[0].Location} />
                    </small>
                  </Collapsible>
                  </div>
                  </Card.Content>
              </Card.Content>
            </Card>
      )
    }
    </Card.Group>
  </div>


const RecentFailures = ({failedReports}) =>
  <div className="RecentFailures mt4">
    <h3>Previous failures on this device ({failedReports.length})</h3>
    <Card.Group itemsPerRow={MAX_RECENT_FAILURES}>
    {
      failedReports.map((r, i) =>
        <Card key={i} color='orange'>
          <Card.Content>
            <Image
              as='a'
              size='tiny'
              floated='right'
              href={`/details?id=${r._id}`}
              target='_blank'
              src={getScreenshotUrl(r.ReportDir, r.Screenshots[0].Screenshot)} />
            <Card.Meta>
              <div>
                {r.Screenshots[0].Page.Title}
              </div>
              <small className='date'>
                {moment(r.Screenshots[0].ShotAt).fromNow()}
              </small>
              <small className='date'>
                {r.Duration}s
              </small>
            </Card.Meta>
            <Card.Description>
              <strong>
                <CommandName codeStack={r.Screenshots[0].CodeStack} />
              </strong>

              { r.Screenshots[0].Message &&
                <Label size='medium' basic color="orange" title={r.Screenshots[0].Message}>
                  {trunc(r.Screenshots[0].Message)}
                </Label>
              }

              <div className="mt1">
                <Collapsible className="mt2" label="Details">
                  <small>
                    <SourceCodeSnippet code={r.Screenshots[0].CodeStack[0].Source} location={r.Screenshots[0].CodeStack[0].Location} />
                  </small>
                </Collapsible>
              </div>

              </Card.Description>
          </Card.Content>
        </Card>
      )
    }
    </Card.Group>
  </div>

export default class extends React.Component {
  static async getInitialProps ({ query: { id } }) {
    const report = await getReportById(id)
    // TODO Should only get reports after (in time) the current report
    let historicReports = await getReportsByCategory(report.HashCategory, {since: report.StartedAt})
    console.log(historicReports)

    if (historicReports === null) historicReports = []

    const failedReports = historicReports
      .filter(r => r.Result !== 'success')
      .filter(r => r.DeviceSettings.Name === report.DeviceSettings.Name)
      .slice(1, MAX_RECENT_FAILURES + 1)

    return { report, historicReports, failedReports }
  }

  render () {
    return (
      <Layout title="Test Report">
        <div className="mt4">
          <Header as='h2' dividing>
            <TestResultDeviceIcon result={this.props.report.Result} deviceSettings={this.props.report.DeviceSettings} />
            &nbsp;
           {this.props.report.Title}
          </Header>

          <div className="Headline-details black-60 cf">
            <strong>
            {moment(this.props.report.StartedAt).fromNow()}
            </strong>
            &nbsp;
            &middot;
            &nbsp;
            <span>
              {this.props.report.Prefix}
            </span>

            <span className="Headline-successesAndFailures fr">
              <SuccessesAndFailuresBars
              selectedBar={indexOfReport(this.props.report, this.props.historicReports)}
              data={mapToSuccessAndFailure(this.props.historicReports)}
              maxBars={50}
              />
            </span>
          </div>

          { this.props.report.Result === 'error' &&
            <div className="cf mt2 courier orange ba pa1">
              <strong>
                {this.props.report.Screenshots[0].Message}
              </strong>
            </div>
          }

          {
            this.props.failedReports.length > 0 &&
              <RecentFailures reportDir={this.props.report.ReportDir} failedReports={this.props.failedReports} />
          }

          <Timeline
            reportDir={this.props.report.ReportDir}
            startTimeline={this.props.report.Screenshots[this.props.report.Screenshots.length - 1].ShotAt}
            timeline={this.props.report.Screenshots} />
        </div>
      </Layout>
    )
  }
}
