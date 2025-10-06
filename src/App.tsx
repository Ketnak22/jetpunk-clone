
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import { Map } from './Map';
import { Uploader } from './Uploader';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <>
            <Link to="/load"><button>Załaduj mapę</button></Link>
            <Link to="/upload"><button>Prześlij mapę</button></Link>
          </>
        } />
        <Route path="/load" element={<Map url='maps/polska.svg' />} />
        <Route path="/upload" element={<Uploader />} />
      </Routes>
    </Router>
  );
}

export default App;
