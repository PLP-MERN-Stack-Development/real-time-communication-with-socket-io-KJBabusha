import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = ({ setUsername }) => {
  const [input, setInput] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if(input.trim() === '') return;
    setUsername(input.trim());
    navigate('/chat');
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100'>
      <form
        onSubmit={handleSubmit}
        className='bg-white p-8 rounded-xl shadow-md flex flex-col gap-4 w-96'
      >
        <h1 className='text-2xl font-bold text-center'>Enter Your Username</h1>
        <input
          type='text'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Username'
          className='border px-3 py-2 rounded outline-none'
        />
        <button
          type='submit'
          className='bg-blue-600 text-white py-2 rounded hover:bg-blue-700'
        >
          Join Chat
        </button>
      </form>
    </div>
  );
};

export default Login;
