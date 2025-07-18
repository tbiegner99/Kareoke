import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  Navigate,
} from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Header from './ui/pages/Header/Header';
import Home from './ui/pages/Home/Home';
import { theme } from './theme';
import styles from './App.module.css';
import { SongsListController } from './ui/pages/SongList/SongsListController';
import { ToastProvider } from './ui/context/ToastContext';

import { RoomController } from './ui/pages/Room/RoomController';
import { RoomContainer } from './ui/pages/Room/RoomContainer';
import { Provider } from 'react-redux';
import { store } from './store';
import { PlaylistController } from './ui/pages/Playlist/PlaylistController';

import { BASE_URL } from './utils/constants';

const AppContainer = () => {
  return (
    <Box component='main' className={styles.main}>
      <Header />
      <div className='content'>
        <Outlet />
      </div>
    </Box>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Provider store={store}>
        <ToastProvider>
          <Router>
            <Box className={styles.app}>
              <Routes>
                <Route path={BASE_URL} element={<AppContainer />}>
                  <Route path={''} element={<Home />} />
                  <Route path='room/:roomId' element={<RoomContainer />}>
                    <Route index element={<RoomController />} />
                    <Route
                      path='songs'
                      element={<SongsListController mini={false} />}
                    />
                    <Route path='playlist' element={<PlaylistController />} />
                    <Route path='*' element={<Navigate to='/room/:roomId' />} />
                  </Route>
                  <Route path='*' element={<Home />} />
                </Route>
              </Routes>
            </Box>
          </Router>
        </ToastProvider>
      </Provider>
    </ThemeProvider>
  );
};

export default App;
