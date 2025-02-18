import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Admin from './pages/Admin';

const App: React.FC = () => {
  return (
    <Router>
      <Header />
      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={<Admin />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
};

export default App;
