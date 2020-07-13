import React, { createContext, useEffect, useState } from 'react';
import neatCsv from 'neat-csv';
import { scaleQuantile, scaleQuantize, ScaleQuantile, ScaleQuantize } from "d3-scale";


/**
 * Data collected by NYT with cumulative counts of coronavirus cases in the United States.
 * Format: 
 *    us->        date,	cases, deaths
 *    state->     date,	state,	fips,	cases,	deaths
 *    counties->  date, county, state, fips, cases, deaths
 *  See: https://github.com/nytimes/covid-19-data
 */
const CovidDataUrls = {
    us: 'https://raw.githubusercontent.com/nytimes/covid-19-data/master/us.csv',
    states: 'https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-states.csv',
    counties: 'https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv'
}

// Structure of data from CSV:
type UsDataPoint = {
  date:string,
  cases:string,
  deaths:string
}

type StateDataPoint = UsDataPoint & {
  state:string,
  fips:string
}

type CountiesDataPoint = StateDataPoint & {
  county: string
}

// Data structure of data used in app:
export type CountiesByDate = {
  [date:string]: CountiesById
}

export type CountiesById = {
  [countyId:string]: Data
}

export type Data = {
  cases: number,
  deaths: number,
  county: string
  state: string
}

// Enums
export type Measurement = 'cases' | 'deaths';
export type Scale = 'quantize' | 'quantile';

// Colors being used in map, from lighters to darkest
export const mapColors = [
  '#1769AA',
  '#2A75B1',
  '#3D82B9',
  '#508FC1',
  '#639CC9',
  '#77A9D1',
  '#8AB6D9',
  '#9DC3E1',
  '#B0D0E9',
  '#C3DDF1',
  '#D7EAF9',
].reverse();

const colorKeys = mapColors.map((c,i)=>{return i});

// Shape of data context for the whole app
export type DataContext = {
  data: CountiesByDate,
  max:{
    [key in Measurement]:number
  },
  colorScales: {
    [key in Scale]:{
      [key in Measurement] : ScaleQuantile<number> | ScaleQuantize<number>;
    }
  }
} | undefined;

const DataContext = createContext<DataContext>(undefined);

const DataProvider:React.FC = (props) => {
  const [state, setState] =  useState<DataContext>(undefined);
  
  useEffect(()=>{
    const getFile = async () =>{
      try{
        // Fetch csv
        const csv = await fetch(CovidDataUrls.states)
          .then((response)=>{ return response.text() })
          .then((rawCSV)=>{ return neatCsv(rawCSV) });

        // Temporary holding variables 
        let mappedCounties:CountiesByDate = {};
        let allDeaths:number[] = [];
        let allCases:number[] = [];
        let highestCases: number = 0;
        let highestDeaths: number = 0;

        // For each row of the csv
        (csv as CountiesDataPoint[]).forEach((dataPoint)=>{
          
          // convert cases and deaths to numbers
          const cases = parseInt(dataPoint.cases);
          const deaths = parseInt(dataPoint.deaths);
          
          // Add them to temp array
          allCases.push(cases);
          allDeaths.push(deaths);
          
          // See if highest
          if(highestCases < cases){ highestCases = cases }
          if(highestDeaths < deaths){ highestDeaths = deaths }

          // Create data point for our data sctructure 
          const point:Data = {
            cases,
            deaths,
            county: dataPoint.county,
            state: dataPoint.state
          }

          // If there is no entry for this date, create new object
          if(mappedCounties[dataPoint.date] === undefined){
            mappedCounties[dataPoint.date]={}
          }

          // Add data point to map
          mappedCounties[dataPoint.date]={
            ...mappedCounties[dataPoint.date],
            [dataPoint.fips]: point
          }

        });

        // Create quantile scales for deaths and cases
        const colorScaleQuantileDeaths = scaleQuantile()
          .domain(allDeaths)
          .range(colorKeys);
        
        const colorScaleQuantileCases = scaleQuantile()
          .domain(allCases)
          .range(colorKeys);
          
        // Create quantize scales for deaths and cases
        const colorScaleScaleQuantizeDeaths = scaleQuantize()
          .domain([0, highestDeaths])
          .range(colorKeys);

        const colorScaleScaleQuantizeCases = scaleQuantize()
          .domain([0, highestCases])
          .range(colorKeys);

        setState({
          data: mappedCounties,
          max:{
            deaths: highestDeaths,
            cases: highestCases
          },
          colorScales:{
            quantile:{
              deaths: colorScaleQuantileDeaths,
              cases: colorScaleQuantileCases
            },
            quantize:{
              deaths :colorScaleScaleQuantizeDeaths,
              cases: colorScaleScaleQuantizeCases
            }
          }
        });
      }catch(error){
        console.error('There was an issue initializing..',error);
      }
    }
    getFile();

  },[]);

  return (
   <DataContext.Provider
    value={state}
   >
       {props.children}
   </DataContext.Provider>
  );
}

export { DataProvider };

export default DataContext;


