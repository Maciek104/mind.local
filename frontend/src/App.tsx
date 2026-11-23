import './App.css'

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import Aside from './components/Aside/Aside.tsx'

import Home from './pages/Home/Home.tsx'

function App() {
  return (
    <>
      <Router>
        <div className="layout">
          <Aside />
          
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </div>
      </Router>
    </>
  )
}

export default App
