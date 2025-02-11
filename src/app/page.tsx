'use client';

import { Box, Stack, TextField, Typography, IconButton, Avatar, Button } from '@mui/material';
import { useState, useRef, useEffect } from 'react';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { styled } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import React from 'react';
import { motion } from 'framer-motion';

// -----------------------------
// Floating Particles for 3D Background Effect
// -----------------------------
const FloatingParticles = () => (
  <>
    <motion.div
      style={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        width: 50,
        height: 50,
        background: 'rgba(255,255,255,0.3)',
        borderRadius: '50%',
        filter: 'blur(4px)',
        zIndex: 0,
      }}
      animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
      transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      style={{
        position: 'absolute',
        bottom: '20%',
        right: '10%',
        width: 70,
        height: 70,
        background: 'rgba(255,255,255,0.2)',
        borderRadius: '50%',
        filter: 'blur(6px)',
        zIndex: 0,
      }}
      animate={{ x: [0, -80, 0], y: [0, 40, 0] }}
      transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      style={{
        position: 'absolute',
        top: '40%',
        left: '70%',
        width: 40,
        height: 40,
        background: 'rgba(255,255,255,0.25)',
        borderRadius: '50%',
        filter: 'blur(3px)',
        zIndex: 0,
      }}
      animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
      transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
    />
  </>
);

// -----------------------------
// Styled Components
// -----------------------------
const OuterContainer = styled(Box)(({ theme }) => ({
  width: '100vw',
  height: '100vh',
  background: '#F7F7F7',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  perspective: '1200px',
}));

const Header = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #388E3C, #2E7D32)',
  color: '#FFFFFF',
  borderRadius: '0 0 16px 16px',
  textAlign: 'center',
  padding: theme.spacing(2),
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  zIndex: 1,
  transform: 'translateZ(0)',
}));

const AssistantMessageBubble = styled(Box)(({ theme }) => ({
  backgroundColor: '#FFFFFF',
  color: '#333333',
  borderRadius: '16px',
  padding: '16px',
  maxWidth: '75%',
  wordBreak: 'break-word',
  lineHeight: 1.5,
  fontSize: '15px',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
  border: '1px solid #E0E0E0',
  whiteSpace: 'pre-wrap',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  transformStyle: 'preserve-3d',
  transform: 'translateY(0) rotateX(0deg)',
  '@keyframes fadeIn': {
    from: { opacity: 0, transform: 'translateY(10px) rotateX(0deg)' },
    to: { opacity: 1, transform: 'translateY(0) rotateX(0deg)' },
  },
  animation: 'fadeIn 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px) rotateX(3deg)',
    boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
  },
}));

const UserMessageBubble = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #66BB6A, #43A047)',
  color: '#FFFFFF',
  borderRadius: '16px',
  padding: '16px',
  maxWidth: '75%',
  wordBreak: 'break-word',
  lineHeight: 1.5,
  fontSize: '15px',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
  whiteSpace: 'pre-wrap',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  transformStyle: 'preserve-3d',
  transform: 'translateY(0) rotateX(0deg)',
  '@keyframes fadeIn': {
    from: { opacity: 0, transform: 'translateY(10px) rotateX(0deg)' },
    to: { opacity: 1, transform: 'translateY(0) rotateX(0deg)' },
  },
  animation: 'fadeIn 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px) rotateX(3deg)',
    boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
  },
}));

const Timestamp = styled(Typography)(({ theme }) => ({
  fontSize: '12px',
  color: '#777777',
  alignSelf: 'flex-end',
  marginTop: '4px',
  fontFamily: `"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`,
}));

const TypingIndicator = () => (
  <Box display="flex" justifyContent="center" alignItems="center" p={2}>
    <Typography
      variant="body2"
      sx={{
        color: '#666666',
        fontFamily: `"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`,
      }}
    >
      Typing...
    </Typography>
  </Box>
);

const getCurrentTime = () => {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

// -----------------------------
// Framer Motion Variants
// -----------------------------
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, when: 'beforeChildren' },
  },
};

const messageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
};

const headerVariants = {
  hidden: { y: -50, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 200, damping: 20 },
  },
};

const buttonVariants = {
  hover: { scale: 1.1, transition: { duration: 0.3 } },
  tap: { scale: 0.95 },
};

// -----------------------------
// Main Chat Component
// -----------------------------
export default function Home() {
  const router = useRouter();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi! I'm Harv. How can I help you explore manufacturers today? 😀`,
      timestamp: getCurrentTime(),
    },
  ]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to the bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;
    setIsLoading(true);

    const newUserMessage = { role: 'user', content: message, timestamp: getCurrentTime() };
    const newAssistantMessage = { role: 'assistant', content: '. . .', timestamp: getCurrentTime() };

    setMessages((prev) => [...prev, newUserMessage, newAssistantMessage]);
    setIsAssistantTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([{ role: 'system', content: '' }, ...messages, newUserMessage]),
      });
      if (!response.ok) throw new Error('Network response was not ok');

      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let updatedContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          updatedContent += decoder.decode(value, { stream: true });
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { ...updated[updated.length - 1], content: updatedContent };
            return updated;
          });
        }
      } else {
        throw new Error('Response body is null');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'There was an error processing your request. 😕', timestamp: getCurrentTime() },
      ]);
    }

    setIsAssistantTyping(false);
    setIsLoading(false);
    setMessage('');
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <OuterContainer>
      {/* Floating Particles Background */}
      <FloatingParticles />

      <Stack
        direction="column"
        width="100%"
        height="100%"
        spacing={2}
        sx={{
          backgroundColor: '#FFFFFF',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Header */}
        <Header>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 'bold',
              letterSpacing: 0.5,
              fontFamily: `"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`,
            }}
          >
            Harv
          </Typography>
        </Header>

        {/* Messages Area */}
        <Stack
          direction="column"
          flexGrow={1}
          overflow="auto"
          p={2}
          sx={{
            backgroundColor: '#F9F9F9',
            boxShadow: 'inset 0 2px 5px rgba(0, 0, 0, 0.1)',
          }}
        >
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ y: 0, scale: 1 }}
              animate={{ y: [0, -3, 0], scale: [1, 1.02, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Box
                display="flex"
                justifyContent={msg.role === 'assistant' ? 'flex-start' : 'flex-end'}
                mb={2}
              >
                <Stack direction="row" spacing={1} alignItems="flex-end">
                  {msg.role === 'assistant' ? (
                    <>
                      <Avatar sx={{ backgroundColor: '#66BB6A', width: 40, height: 40 }}>
                        <AutoAwesomeIcon />
                      </Avatar>
                      <AssistantMessageBubble>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                        <Timestamp>{msg.timestamp}</Timestamp>
                      </AssistantMessageBubble>
                    </>
                  ) : (
                    <>
                      <UserMessageBubble>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                        <Timestamp>{msg.timestamp}</Timestamp>
                      </UserMessageBubble>
                      <Avatar sx={{ backgroundColor: '#388E3C', width: 40, height: 40 }}>
                        <PersonIcon />
                      </Avatar>
                    </>
                  )}
                </Stack>
              </Box>
            </motion.div>
          ))}
          {isAssistantTyping && <TypingIndicator />}
          <div ref={messagesEndRef} aria-live="polite" />
        </Stack>

        {/* Text Input and Send Button */}
        <Stack direction="row" spacing={2} sx={{ p: 2 }}>
          <TextField
            label="Type your message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isLoading}
            variant="outlined"
            size="small"
            sx={{
              backgroundColor: '#FAFAFA',
              borderRadius: 12,
              '& .MuiOutlinedInput-root': {
                borderRadius: 12,
                '& fieldset': { borderColor: '#CCCCCC' },
                '&:hover fieldset': { borderColor: '#BBBBBB' },
                '&.Mui-focused fieldset': { borderColor: '#388E3C' },
              },
              '& .MuiInputBase-input': { padding: '10px 14px', color: '#333333' },
              '& .MuiInputLabel-root': { color: '#777777' },
            }}
          />
          <IconButton
            onClick={sendMessage}
            disabled={isLoading || !message.trim()}
            size="large"
            sx={{
              borderRadius: 12,
              backgroundColor: '#388E3C',
              color: '#FFFFFF',
              '&:hover': { backgroundColor: '#2E7D32' },
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              padding: '12px',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              '&:active': { transform: 'translateY(-2px)', boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)' },
            }}
          >
            <SendIcon />
          </IconButton>
        </Stack>
      </Stack>

      {/* Action Buttons */}
      <Button
        onClick={() => router.push('/addProfessor')}
        variant="contained"
        sx={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          padding: '6px 12px',
          fontSize: '0.875rem',
          borderRadius: '8px',
          backgroundColor: '#388E3C',
          '&:hover': { backgroundColor: '#2E7D32' },
        }}
      >
        Add Manufacturer
      </Button>
      <Button
        onClick={() => router.push('/')}
        variant="contained"
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          padding: '6px 12px',
          fontSize: '0.875rem',
          borderRadius: '8px',
          backgroundColor: '#388E3C',
          '&:hover': { backgroundColor: '#2E7D32' },
        }}
      >
        Home Page
      </Button>
    </OuterContainer>
  );
}
