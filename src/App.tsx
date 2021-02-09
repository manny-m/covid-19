import React from 'react';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { CssBaseline } from '@material-ui/core';
import { DataProvider } from './components/DataContext';
import TimeScroll from './components/TimeScroll';

const primaryColor = '#3299ff';
const secondaryColor = '#aa4d17';
const errorColor = '#b2483e';
const warnColor = '#FFCF44';
const infoColor = '#3491bb';
const successColor = '#00a152';


const customTheme = createMuiTheme({
  palette: {
    primary:{ main: primaryColor },
    secondary:{ main: secondaryColor },
    error:{ main: errorColor },
    warning:{ main: warnColor },
    info:{ main: infoColor },
    success:{ main: successColor },
    type:'dark'
  }
  test1
});


function App() {
  return (
    <MuiThemeProvider theme={customTheme}>
      <CssBaseline/>
      <DataProvider>
        <TimeScroll/>
      </DataProvider>
    </MuiThemeProvider>
  );
}

export default App;
