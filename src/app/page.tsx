'use client';

import { Box, Stack, TextField, Typography, IconButton, Avatar, Button } from '@mui/material';
import { useState, useRef, useEffect } from 'react';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { styled } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import React from 'react';

/* -----------------------------
   Outer Container & Header
------------------------------*/

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

/* -----------------------------
   3D Message Bubbles
------------------------------*/

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
  fontFamily: "Segoe UI Emoji, Apple Color Emoji, Noto Color Emoji, sans-serif",
}));

const TypingIndicator = () => (
  <Box display="flex" justifyContent="center" alignItems="center" p={2}>
    <Typography
      variant="body2"
      sx={{
        color: '#666666',
        fontFamily: "Segoe UI Emoji, Apple Color Emoji, Noto Color Emoji, sans-serif",
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

/* -----------------------------
   Flat Recommended Button
------------------------------*/

// A flat, custom-styled button with no extra nesting.
const FlatRecommendedButton = styled('button')(({ theme }) => ({
  background: 'linear-gradient(135deg, #f7f7f7, #eaeaea)',
  border: 'none',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
  borderRadius: '12px',
  padding: '6px 12px',
  fontSize: '0.875rem',
  color: '#388E3C',
  cursor: 'pointer',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
  textTransform: 'none',
  margin: '4px',
  outline: 'none',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
    background: 'linear-gradient(135deg, #eaeaea, #dedede)',
  },
}));

/* -----------------------------
   Recommendations Container
------------------------------*/

const RecommendationsContainer = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #fff, #f2f2f2)',
  padding: theme.spacing(1),
  borderRadius: '12px',
  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

/* -----------------------------
   Dynamic Recommendations Logic
------------------------------*/

// Utility to shuffle an array.
const shuffleArray = (array: string[]): string[] => {
  let newArray = array.slice();
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const getRecommendedQuestions = (query: string): string[] => {
  const lowerQuery = query.toLowerCase();
  let baseQuestions: string[] = [];
  if (lowerQuery.includes("chocolate")) {
    baseQuestions = [
      "Which manufacturers offer luxury chocolates?",
      "What are the best-selling chocolate manufacturers?",
      "Are there any organic chocolate manufacturers?"
    ];
  } else if (lowerQuery.includes("tea")) {
    baseQuestions = [
      "Who manufactures private-label organic tea?",
      "What are the trending tea products?",
      "Which tea manufacturers have sustainability certifications?"
    ];
  } else if (lowerQuery.includes("protein")) {
    baseQuestions = [
      "List manufacturers specializing in vegan protein bars?",
      "Which companies offer high-protein snack bars?",
      "Are there manufacturers focusing on low-sugar protein bars?"
    ];
  } else {
    // General starting recommendations.
    baseQuestions = [
      "Which manufacturers offer luxury chocolates?",
      "Who manufactures private-label organic tea?",
      "List manufacturers specializing in vegan protein bars?"
    ];
  }
  // Randomize the order each time.
  return shuffleArray(baseQuestions);
};

/* -----------------------------
   Main Chat Component
------------------------------*/

export default function Home() {
  const router = useRouter();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm Harvest AI. How can I help you explore manufacturers today? 😀",
      timestamp: getCurrentTime(),
    },
  ]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  // Recommended questions are hidden during streaming
  const [recommendedQuestions, setRecommendedQuestions] = useState<string[]>([]);
  // Flag to check if component is mounted on client side
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // When streaming stops, recalc recommended questions (thus re-randomizing them)
  useEffect(() => {
    if (!isAssistantTyping) {
      const lastUserMsg = [...messages].reverse().find((msg) => msg.role === 'user');
      const newRecommendations = lastUserMsg
        ? getRecommendedQuestions(lastUserMsg.content)
        : getRecommendedQuestions("");
      setRecommendedQuestions(newRecommendations);
    }
  }, [isAssistantTyping]);

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;
    setIsLoading(true);

    const newUserMessage = { role: 'user', content: message, timestamp: getCurrentTime() };
    const newAssistantMessage = { role: 'assistant', content: '. . .', timestamp: getCurrentTime() };

    // Append the new messages.
    setMessages((prevMessages) => [
      ...prevMessages,
      newUserMessage,
      newAssistantMessage,
    ]);
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

          setMessages((prevMessages) => {
            const updatedMessages = [...prevMessages];
            updatedMessages[updatedMessages.length - 1] = {
              ...updatedMessages[updatedMessages.length - 1],
              content: updatedContent,
            };
            return updatedMessages;
          });
        }
      } else {
        throw new Error('Response body is null');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: 'assistant',
          content: 'There was an error processing your request. 😕',
          timestamp: getCurrentTime(),
        },
      ]);
    }

    setIsAssistantTyping(false);
    setIsLoading(false);
    setMessage('');
    // The change in isAssistantTyping triggers the useEffect to re-randomize recommendations.
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <OuterContainer>
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
        }}
      >
        {/* Header */}
        <Header>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 'bold',
              letterSpacing: 0.5,
              fontFamily: "Segoe UI Emoji, Apple Color Emoji, Noto Color Emoji, sans-serif",
            }}
          >
            Harvest AI
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
            <Box
              key={index}
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
          ))}
          {isAssistantTyping && <TypingIndicator />}
          <div ref={messagesEndRef} aria-live="polite" />
        </Stack>

        {/* Taskbar: Recommended Questions & Input */}
        <Stack sx={{ p: 2, backgroundColor: '#FFFFFF', boxShadow: '0 -2px 5px rgba(0,0,0,0.1)' }} spacing={1}>
          {/* Render recommended questions only if mounted, not streaming, and with available suggestions */}
          {mounted && !isAssistantTyping && recommendedQuestions.length > 0 && (
            <RecommendationsContainer>
              <Typography variant="subtitle2" color="#777" sx={{ mb: 1 }}>
                Suggested Questions
              </Typography>
              <Stack direction="row" spacing={1} sx={{ justifyContent: 'center', flexWrap: 'wrap' }}>
                {recommendedQuestions.map((q, index) => (
                  <FlatRecommendedButton key={index} onClick={() => setMessage(q)}>
                    {q}
                  </FlatRecommendedButton>
                ))}
              </Stack>
            </RecommendationsContainer>
          )}
          {/* Text Input and Send Button */}
          <Stack direction="row" spacing={2}>
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
      </Stack>

      {/* Action Buttons */}
      <Link href="https://harvestmarketplace.netlify.app/" passHref>
        <Button
          variant="contained"
          sx={{
            position: 'absolute',
            bottom: 105,
            right: 25,
            padding: '6px 12px',
            fontSize: '0.875rem',
            borderRadius: '8px',
            backgroundColor: '#388E3C',
            '&:hover': { backgroundColor: '#2E7D32' },
          }}
        >
          Marketplace
        </Button>
      </Link>
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
