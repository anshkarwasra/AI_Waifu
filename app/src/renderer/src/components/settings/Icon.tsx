import SettingsIcon from '../../assets/settings.svg'
import { Link } from 'react-router-dom'
const Icon = () => {
  return (
    <div>
        <Link to={'/settings'}><img src={SettingsIcon}  /></Link>
    </div>
  )
}

export default Icon