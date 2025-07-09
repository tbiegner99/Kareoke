import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Header from './components/Header/Header';
import Home from './components/Home/Home';
import SongList from './components/SongList/SongList';
import Playlist from './components/Playlist/Playlist';
import Search from './components/Search/Search';
import { theme } from './theme';
import styles from './App.module.css';
import { SongsListController } from './components/SongList/SongsListController';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box className={styles.app}>
          <Header />
          <Box component='main' className={styles.main}>
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/songs' element={<SongsListController />} />
              <Route path='/playlist' element={<Playlist />} />
              <Route path='/search' element={<Search />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
};

export default App;
