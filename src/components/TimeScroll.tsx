import React, {Fragment, useContext, useState} from 'react';
import DataContext, { Measurement, Scale, mapColors} from './DataContext';
import StateMap from './USMap';
import ReactTooltip from 'react-tooltip';

import { makeStyles } from '@material-ui/core/styles';
import { 
  Slider,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Typography,
  Link,
  CircularProgress
} from '@material-ui/core';

const timeScrollStyles = makeStyles(theme =>({
  root:{
    margin: theme.spacing(1, 'auto'),
    maxWidth: '100vh'
  },
  settings:{
    margin: theme.spacing(2),
  },
  controls: {
    margin: theme.spacing(1, 4),
  },
  gradientScale:{
    height: theme.spacing(2),
    backgroundImage:`linear-gradient(to right, ${mapColors[0]} , ${mapColors[mapColors.length-1]})`
  },
  textLeft:{
    textAlign: 'right',
    margin: theme.spacing(0,1,0,0),
  },
  textRight:{
    margin: theme.spacing(0,0,0,1),
  },
  textCenter:{
    textAlign: 'center',
  },
  footer:{
    textAlign: 'center',
    color: theme.palette.grey[500],
    fontSize: '0.5rem'
  }
}));

const selectStyles = makeStyles(theme =>({
  measureSelect:{
    margin: theme.spacing(0,1,0,0)
  }
}));

const CustomSelect:React.FC<{
  value: string,
  label: string,
  options:{value:string, label:string}[],
  change: (value:string)=>void
}> = (props) =>{

  const { value,label, options, change } = props;
  const classes = selectStyles();

  const handleMeasureChange = (event: React.ChangeEvent<{
    name?: string | undefined;
    value: unknown;
  }>) => {
    change(event.target.value as string);
  }

  return (
    <FormControl variant="outlined" className={classes.measureSelect}>
    <InputLabel htmlFor="map-measure-change-label">{label}</InputLabel>
    <Select
      native
      value={value}
      onChange={handleMeasureChange}
      label={label}
    >
      {options.map((option, index)=>
        <option 
          key = {`${label}-${option.label}-${option.value}-${index}`} 
          value={option.value}
        >
          {option.label}
        </option>
      )}
    </Select>
  </FormControl>
  )
}

const TimeScroll:React.FC = () => {

  const classes = timeScrollStyles();

  const dataContext = useContext(DataContext);

  const getDate = (value:number) =>{
    return dates[value];
  }
  
  const dates = Object.keys(dataContext ? dataContext.data : {});

  // Number value of date
  const [currDate, setDate ] = useState<number>(0);

  // Step value for slider
  const [step, setStep] = useState<number>(1);
  
  // String value for map tooltip
  const [tooltip, setTooltip ]= useState<string>('');
  
  // Measurement selected, one of ['cases', 'deaths']
  const [measure, setMeasure] = useState<Measurement>('cases');

  // Scale selected, one of ['quantile', 'quantize']
  const [scale, setScale] = useState<Scale>('quantile');

  
  // Data being passed to Map component
  const passedData = dataContext?.data[getDate(currDate)];
  const passedScale = dataContext?.colorScales[scale][measure];

  /**
   * Makes human readable label for slider
   * @param {number} value slider value
   */
  const getSliderLabel = (value:number):string =>{
    const parts = dates[value].split('-');
    return `${parts[1]}/${parts[2]}`;
  }

  const handleSliderChange = (event: React.ChangeEvent<{}>, value: number | number[]) =>{
    setDate(value as number);
  }

  const handleMeasureChange = (newValue: string) => {    
    setMeasure(newValue as Measurement);
  }

  const handleScaleChange = (newValue: string) => {    
    setScale(newValue as Scale);
  }

  const handleStepChange = (newValue: string) => {    
    setStep(parseInt(newValue));
  }

  return (
    <div className={classes.root}>
      {(passedData!==undefined && passedScale!==undefined) ? (
        <Fragment>
          <div className ={classes.settings}>
            <CustomSelect
              value={measure}
              label={'Measure'}
              change={handleMeasureChange}
              options={[
                {label: 'Cases', value: 'cases'},
                {label: 'Deaths', value: 'deaths'}
              ]}
            />
            <CustomSelect
              value={scale}
              label={'Scale'}
              change={handleScaleChange}
              options={[
                {label: 'Quantile', value: 'quantile'},
                {label: 'Quantize', value: 'quantize'},
              ]}
            />
            <CustomSelect
              value={step.toString()}
              label={'Step'}
              change={handleStepChange}
              options={[
                {label: '1', value: '1'},
                {label: '7', value: '7'},
                {label: '30', value: '30'},
              ]}
            />
          </div>
          <Grid
            container
            direction="row"
            justify="center"
            alignItems="center"
          >
            <Grid xs={12} item className={classes.textCenter}>
              <Typography variant="caption">Showing COVID </Typography>
              <Typography variant="caption" color="primary">{measure+' '}</Typography>
              <Typography variant="caption">with </Typography>
              <Typography variant="caption" color="primary">{scale+' '}</Typography>
              <Typography variant="caption">scale </Typography>
            </Grid>
            <Grid xs={1} item className={classes.textLeft}>0</Grid>
            <Grid xs={8} item><div className={classes.gradientScale}/></Grid>
            <Grid xs={1} item className={classes.textRight}>{dataContext? dataContext.max[measure] : 1}</Grid>
          </Grid>
          <StateMap 
            data = {passedData}
            scale = {passedScale}
            measure = {measure}
            setTooltip = {setTooltip}
          />
          <ReactTooltip>{tooltip}</ReactTooltip>
          <div className ={classes.controls}>
            <Slider
              value={currDate}
              onChange={handleSliderChange}
              getAriaValueText = {getSliderLabel}
              marks
              min={0}
              max={dates.length-1}
              valueLabelDisplay="on"
              valueLabelFormat={getSliderLabel}
              step={step}
            />
          </div>
        </Fragment>
      ):(
        <Grid container direction="row" justify="center" alignItems="center">
          <Grid item xs={12}><CircularProgress variant="indeterminate" /></Grid>
        </Grid>
      )}
      <Typography className ={classes.footer}>Using data from <Link href="https://github.com/nytimes/covid-19-data" target="_blank">NYT Covid-19 GitHub dataset</Link></Typography>
    </div>
  );
}

export default TimeScroll;