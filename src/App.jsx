import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import SignIn from './pages/SignIn'
import Admin from './pages/Admin'
import './App.css'
import AllProjects from './pages/AllProjects'
import ProtectedRoute from './components/ProtectedRoute'
import Gallery from './pages/Gallery'

function App() {
  return (
   <Router>
    <div className='overflow-hidden'>
      <Routes>
        <Route index element={<Home />} />
        <Route path="/all-projects" element={<AllProjects />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/admin" element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        } />
        <Route path="/gallery-view" element={
          <ProtectedRoute>
            <Gallery/>
          </ProtectedRoute>
        } />
      </Routes>
    </div>
   </Router>
  )
}

export default App
