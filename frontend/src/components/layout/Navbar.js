import { Link } from 'react-router-dom'
import Logo from '../../assets/img/logo.png'
import styles from './Navbar.module.css'

function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.navbar_logo}>
        <img src={Logo} alt="Get A Pet" />
        <h2>Get A Pet</h2>
      </div>
      <ul>
        <li>
          <Link to="/">Adotar</Link>
        </li>
        <li>
          <Link to="/login">Entrar</Link>
        </li>
        <li>
          <Link to="register">Cadastrar</Link>
        </li>
      </ul>
    </nav>
  )
}

export default Navbar
