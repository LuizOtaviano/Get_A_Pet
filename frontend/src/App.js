import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// Components
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Container from './components/layout/Container'

// Pages
import Login from './components/pages/Auth/Login'
import Register from "./components/pages/Auth/Register"
import Home from "./components/pages/Home"

function App() {
  return (
    <Router>
      <Navbar />
      <Container>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </Container>
      <Footer />
    </Router>
  )
}

export default App;
