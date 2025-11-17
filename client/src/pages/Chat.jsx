import { useEffect, useState } from 'react';
import { useSocket } from '../socket/socket';

const Chat = ({ username }) => {
  const { connect, sendMessage, messages, typingUsers, setTyping, users } = useSocket();
  const [input, setInput] = useState('');

  const [activePrivate, setActivePrivate] = useState(null);
  const [privateInput, setPrivateInput] = useState('');

  const notificationSound = new Audio('../public/notification.mp3');


  const [reactions, setReactions] = useState({});



  useEffect(() => {
  if(messages.length === 0) return;
  const lastMsg = messages[messages.length - 1];

  // Only play sound if message not sent by self
  if(lastMsg.sender !== username){
    notificationSound.play().catch(() => {});
  }
}, [messages]);

  useEffect(() => {
  if('Notification' in window){
    Notification.requestPermission();
  }
}, []);

  useEffect(() => {
  if(messages.length === 0) return;
  const lastMsg = messages[messages.length - 1];

  if(lastMsg.sender !== username && Notification.permission === 'granted'){
    new Notification(`${lastMsg.sender}`, {
      body: lastMsg.message,
      icon: '/favicon.ico',
    });
  }
}, [messages]);

  useEffect(() => {
  const lastMsg = messages[messages.length - 1];
  if(lastMsg?.system){
    notificationSound.play().catch(() => {});
    if(Notification.permission === 'granted'){
      new Notification('Chat System', { body: lastMsg.message });
    }
  }
}, [messages]);



  const [unreadCount, setUnreadCount] = useState(0);

useEffect(() => {
  const handleVisibility = () => {
    if(document.hidden){
      setUnreadCount(prev => prev + 1);
    } else {
      setUnreadCount(0);
    }
  };

  document.addEventListener('visibilitychange', handleVisibility);
  return () => document.removeEventListener('visibilitychange', handleVisibility);
}, []);


  useEffect(() => {
  document.title = unreadCount > 0 ? `(${unreadCount}) Chat App` : 'Real-Time Chat';
}, [unreadCount]);


  useEffect(() => {
  const lastMsg = messages[messages.length - 1];
  if(lastMsg?.isPrivate && lastMsg.sender !== username){
    notificationSound.play().catch(() => {});
    if(Notification.permission === 'granted'){
      new Notification(`Private: ${lastMsg.sender}`, { body: lastMsg.message });
    }
  }
}, [messages]);
 
// delete the above


  useEffect(() => {
    if(username) connect(username);
  }, [username]);

  const handleSend = () => {
    if(input.trim() === '') return;
    sendMessage(input);
    setInput('');
    setTyping(false);
  };

  const handleInput = (e) => {
    const value = e.target.value;
    setInput(value);
    setTyping(value.length > 0);
  };

  const handlePrivateSend = () => {
  if(privateInput.trim() === '' || !activePrivate) return;
  sendPrivateMessage(activePrivate.id, privateInput); // use socket ID
  setPrivateInput('');
  };





  return (
    <div className='min-h-screen bg-gray-100 flex'>

      {/* Sidebar */}
         <aside className='w-64 bg-white shadow-md p-4 flex flex-col'>
  <h2 className='text-xl font-bold mb-4'>Users Online</h2>

  <p className='text-sm text-gray-500 mb-3'>
    {users.length} user{users.length !== 1 && 's'} online
  </p>

  <div className='flex-1 overflow-y-auto'>
    {users.map(user => {
      if(user.username === username) return null; // skip self
      return (
        <button
          key={user.id}
          className='w-full text-left p-2 mb-2 bg-gray-100 rounded hover:bg-gray-200'
          onClick={() => setActivePrivate(user)}
        >
          {user.username}
        </button>
      );
    })}
  </div>
</aside>



      {/* Chat Panel */}
      <main className='flex-1 p-6 flex flex-col items-center'>

        <h1 className='text-3xl font-bold mb-4'>Real-Time Chat</h1>

        <div className='w-full max-w-2xl bg-white rounded-xl shadow p-4 flex flex-col gap-3'>

          {/* Messages */}
          {/* Messages */}
<div className='h-96 overflow-y-auto border rounded p-3 bg-gray-50 flex flex-col gap-2'>

  {messages.map((msg) => {
  // determine if this message was sent by the current user
  const isSelf = msg.sender ? msg.sender === username : false;

  if(msg.system){
      // System messages (join/leave)
      return (
        <div key={msg.id} className={`flex ${isSelf ? 'justify-end' : 'justify-start'} flex-col`}>
  <div
    className={`px-3 py-2 rounded-lg max-w-xs break-words shadow ${isSelf ? 'bg-blue-600 text-white' : 'bg-white'}`}
  >
    {!isSelf && <p className='text-sm font-semibold mb-1'>{msg.sender}</p>}
    <p>{msg.message}</p>
    <p className='text-[10px] text-gray-200 mt-1 text-right'>
      {new Date(msg.timestamp).toLocaleTimeString()}
    </p>
  </div>

  {/* Reactions */}
  <div className='flex gap-1 mt-1 text-sm'>
    {['👍','❤️','😂','😮','😢','👏'].map((emoji) => (
      <button
        key={emoji}
        className='hover:bg-gray-200 px-1 rounded'
        onClick={() => {
          setReactions(prev => {
            const msgReacts = prev[msg.id] || [];
            return {...prev, [msg.id]: [...msgReacts, emoji]};
          });
        }}
      >
        {emoji}
      </button>
    ))}
    {/* Display current reactions */}
    {reactions[msg.id] && (
      <span className='ml-1'>
        {reactions[msg.id].join(' ')}
      </span>
    )}
  </div>
</div>

      );
    }

    {activePrivate && (
  <div className='mt-4 p-3 border rounded bg-gray-50 flex flex-col gap-2'>
    <h3 className='font-semibold'>
      Private chat with {activePrivate.username}
    </h3>

    <div className='h-48 overflow-y-auto flex flex-col gap-1'>
      {messages
        .filter(msg =>
          msg.isPrivate &&
          ((msg.senderId === activePrivate.id && msg.sender !== username) ||
          (msg.sender === username && msg.isPrivate))
        )
        .map(msg => {
          const isSelf = msg.sender === username;
          return (
            <div key={msg.id} className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
              <div className={`px-3 py-2 rounded-lg max-w-xs break-words shadow ${isSelf ? 'bg-green-500 text-white' : 'bg-white'}`}>
                {!isSelf && <p className='text-sm font-semibold mb-1'>{msg.sender}</p>}
                <p>{msg.message}</p>
                <p className='text-[10px] text-gray-200 mt-1 text-right'>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          );
        })}
    </div>

    <div className='flex gap-2 mt-2'>
      <input
        value={privateInput}
        onChange={(e) => setPrivateInput(e.target.value)}
        className='flex-1 border rounded px-3 py-2 outline-none'
        placeholder='Type a private message...'
      />
      <button
        onClick={handlePrivateSend}
        className='bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700'
      >
        Send
      </button>
    </div>
  </div>
)}


    return (
      <div
        key={msg.id}
        className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}
      >
        <div
          className={`px-3 py-2 rounded-lg max-w-xs break-words shadow 
            ${isSelf ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white rounded-bl-none'}
          `}
        >
          <p className='text-sm font-semibold mb-1'>
            {!isSelf && msg.sender}
          </p>

          <p>{msg.message}</p>

          <p className='text-[10px] text-gray-200 mt-1 text-right'>
            {new Date(msg.timestamp).toLocaleTimeString()}
          </p>
        </div>
      </div>
    );
  })}

</div>


          {/* Typing Indicator */}
          {typingUsers.length > 0 && (
            <p className='text-sm text-gray-500 h-4'>
              {typingUsers.join(', ')} typing...
            </p>
          )}

          {/* Input Box */}
          {/* Input Box */}
<div className='flex flex-col gap-1'>
  <div className='flex gap-2'>
    <input
      value={input}
      onChange={(e) => {
        const value = e.target.value;
        setInput(value);
        setTyping(value.length > 0);
      }}
      className='flex-1 border rounded px-3 py-2 outline-none'
      placeholder='Type a message...'
    />

    <button
      onClick={handleSend}
      className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'
    >
      Send
    </button>
  </div>

  {/* Typing indicator */}
  {typingUsers.length > 0 && (
    <p className='text-sm text-gray-500'>
      {typingUsers.join(', ')} typing...
    </p>
  )}
</div>

        </div>
      </main>
    </div>
  );
};

export default Chat;
