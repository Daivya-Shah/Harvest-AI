"use client";
import Image from "next/image";
import Head from "next/head";
import {
  Container,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  Grid,
} from "@mui/material";
import { styled } from "@mui/system";
import MenuIcon from "@mui/icons-material/Menu";


import React, { useEffect, useState } from "react";
import Link from 'next/link';

const StyledButton = styled(Button)({
  borderRadius: "20px",
  textTransform: "none",
  padding: "10px 20px",
});

export default function Navbar() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <Toolbar sx={{ padding: '30px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <Link href="/" passHref>
            
          </Link>
          <div>
            {isMobile && (
              <div className="mobile-menu">
                <IconButton
                  edge="start"
                  color="inherit"
                  aria-label="menu"
                  aria-controls="mobile-menu"
                  aria-haspopup="true"
                  onClick={handleMenuOpen}
                >
                  <MenuIcon sx={{color: '#FFFFFF'}}/>
                </IconButton>
                <Menu
                  id="mobile-menu"
                  anchorEl={anchorEl}
                  keepMounted
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  sx={{
                    '& .MuiMenu-paper': {
                      backgroundColor: '#444444', 
                    },
                  }}
                >
                  <MenuItem onClick={handleMenuClose} component="a" href="/" style={{ color:'#FFFFFF', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem' }} >Home</MenuItem>
                  <MenuItem onClick={handleMenuClose} component="a" href="/chatbot" style={{ color:'#FFFFFF', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem' }}>Chat</MenuItem>
                  {/*<MenuItem onClick={handleMenuClose} component="a" href="/search" style={{ color:'#FFFFFF', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem' }}>Search</MenuItem>*/}
                </Menu>
              </div>
            )}
            
            {!isMobile && (
              <div className="desktop-menu">
                <StyledButton color="inherit" href="/" style={{ color:'#FFFFFF', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem' }}>
                  Home
                </StyledButton>
                <StyledButton color="inherit" href="/chatbot" style={{ color:'#FFFFFF', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem' }}>
                  Chat
                </StyledButton>
                {/*<StyledButton color="inherit" href="/search" style={{ color:'#FFFFFF', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem' }}>
                  Search
                </StyledButton>*/}
              </div>
            )}
          </div>
        </Toolbar>
  );
}
