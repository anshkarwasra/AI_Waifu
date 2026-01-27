import Back from '../../assets/Back.svg'
import { Link } from 'react-router-dom'
const Settings = () => {
    

  return (
    <div>
        <div className={`content montserrat  flex-col gap-3 inset-0 z-10 h-screen w-screen absolute bg-[rgb(20,20,20)] ease-in-out py-24 px-20    `}>

          <div className="header flex items-center text-white text  text-4xl">
            <div className="back -mx-16 -mt-48 relative">
              <Link to={'/'}><img src={Back}  /></Link>
            </div>
            <div className="heading mx-32">
              Settings
            </div>

          </div>
          <div className="main  ">
            <ul className="optionContainer flex flex-col gap-7">
              <div className="option">
                Option 1
              </div>
              <div className="option">
                Option 2
              </div>
              <div className="option">
                Option 3
              </div>
              <div className="option">
                Option 4
              </div>
              <div className="option">
                Option 5
              </div>

            </ul>
          </div>
        </div>
    </div>
  )
}

export default Settings