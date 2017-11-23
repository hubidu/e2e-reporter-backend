import DesktopIcon from 'react-icons/lib/fa/desktop'
import MobileIcon from 'react-icons/lib/fa/mobile'
import TabletIcon from 'react-icons/lib/fa/tablet'

export default ({result, deviceSettings}) => {
  const color = (result === 'error' || result === false) ? 'orange' : 'green'

  return (
    <span className={`f4 mr1 ${color}`} title={deviceSettings ? `${deviceSettings.Type} ${deviceSettings.Width}x${deviceSettings.Height}` : ''} >
      {
        deviceSettings && deviceSettings.Type === 'desktop' ? <DesktopIcon /> : null
      }
      {
        deviceSettings && deviceSettings.Type === 'mobile' ? <MobileIcon /> : null
      }
      {
        deviceSettings && deviceSettings.Type === 'tablet' ? <TabletIcon /> : null
      }
    </span>
  )
}
