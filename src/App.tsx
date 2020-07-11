import React from 'react';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { CssBaseline } from '@material-ui/core';

import neatCsv from 'neat-csv';

const primaryColor = '#1769aa';
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
});


function App() {

  React.useEffect(()=>{
    const getFile = async () =>{
      try{
        const csv = await fetch('https://raw.githubusercontent.com/nytimes/covid-19-data/master/us.csv')
          .then((response)=>{ return response.text() })
          .then((rawCSV)=>{ return neatCsv(rawCSV) });
        console.log(csv);
        
      }catch(error){
        console.error('There was an issue initializing ');
      }
    }

    getFile();

  },[]);

  return (
    <MuiThemeProvider theme={customTheme}>
      <CssBaseline/>
      <div>
        test
      </div>
    </MuiThemeProvider>
  );
}

export default App;
