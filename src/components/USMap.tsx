import React, { Fragment, memo } from 'react';
import { useTheme } from '@material-ui/core/styles';
import {
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";
import { ScaleQuantile, ScaleQuantize } from "d3-scale";
import { CountiesById, mapColors, Measurement } from './DataContext';

/**
 * Census Bureau’s cartographic boundary shapefiles
 * See: https://github.com/topojson/us-atlas
 */
const atlasUrls = {
  states: 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json',
  counties: 'https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json'
}


type MapProps = {
  data: CountiesById,
  scale: ScaleQuantile<number> | ScaleQuantize<number>,
  measure: Measurement,
  setTooltip?:(newToolTip:string)=>void
}

const USMap:React.FC<MapProps> = (props) => {
  const { data , scale, measure,  setTooltip } = props;

  // Color to use when hovering over state
  const hoverColor = useTheme().palette.background.paper;
  
  // Uppercase first letter of measure just for style 
  const measureText = `${measure.charAt(0).toUpperCase() + measure.slice(1)}`;
  
  return (
    <Fragment>
      <ComposableMap projection="geoAlbersUsa"  data-tip="">
        <Geographies geography={atlasUrls.states}>
          {({ geographies }) =>
            geographies.map(geo => {
              const cur = data[geo.id];            
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={cur ? mapColors[scale(cur[measure])] : mapColors[0]}
                  onMouseEnter={
                    setTooltip 
                      ? () => { setTooltip(cur 
                        ? `${measureText} in ${cur.state}: ${cur[measure]}` 
                        : `No ${measure} reported`)}
                      : undefined
                  }
                  onMouseLeave={ 
                    setTooltip 
                      ? () => { setTooltip("")}
                      : undefined
                  }
                  style={{
                    hover: {
                      fill: hoverColor,
                      outline: "none"
                    },
                    pressed: {
                      fill: hoverColor,
                      outline: "none"
                    } 
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
    </Fragment>
  );
}

export default memo(USMap);