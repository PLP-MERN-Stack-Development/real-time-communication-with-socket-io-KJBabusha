import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Chat from './pages/Chat';

const App = () => {
  const [username, setUsername] = useState('');

  return (
    <Router>
      <Routes>
        <Route path='/' element={<Login setUsername={setUsername} />} />
        <Route path='/chat' element={<Chat username={username} />} />
      </Routes>
    </Router>
  );
};

export default App;
