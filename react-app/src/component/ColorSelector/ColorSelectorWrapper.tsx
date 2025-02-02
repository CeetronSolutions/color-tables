import * as React from "react";
import { d3ColorScales } from "../Utils/d3ColorScale";
import { ColorSelectorComponent } from "./ColorSelectorComponent";

export declare type colorScaleObj = {
  name: string;
  color:
    | [number, number, number, number][]
    | ((t: number) => string | string[]);
};
export type colorScaleArray = Array<colorScaleObj>;

declare type legendProps = {
  useColorTableColors?: boolean;
  newColorScaleData?: any;
  colorTables?: any;
  useRange?: boolean;
  getRange?: any;
  isCont?: boolean;
  useBreakpoint?: boolean;
  getBreakpoint?: any;
};

export const ColorSelectorWrapper: React.FC<legendProps> = ({
  useColorTableColors,
  newColorScaleData,
  colorTables,
  useRange,
  getRange,
  isCont,
  useBreakpoint,
  getBreakpoint,
}: legendProps) => {
  let continuousLegend;
  let discreteLegend;

  const continuosColorData: colorScaleArray = [];
  const continuosD3ColorData: colorScaleArray = [];
  const discreteColorData: colorScaleArray = [];
  const discreteD3ColorData: colorScaleArray = [];

  const [isAuto, setAuto] = React.useState(true);

  // For altering data range
  const onChangeRange = React.useCallback(
    (e) => {
      if (e.value === "Auto") {
        getRange("Auto");
        setAuto(true);
      } else {
        setAuto(false);
        let inputValue1 = (document.getElementById("minV") as HTMLInputElement)
          .value;
        let inputValue2 = (document.getElementById("maxV") as HTMLInputElement)
          .value;
        getRange([parseFloat(inputValue1), parseFloat(inputValue2)]);
      }
    },
    [getRange]
  );

  const onChangeBreakpoint = React.useCallback(
    (e) => {
      if (e.value === "None") {
        setAuto(true);
        getBreakpoint("None");
      } else {
        setAuto(false);
        let breakpoint = (
          document.getElementById("breakpoint") as HTMLInputElement
        ).value;
        let breakpointArray: any;
        if (breakpoint.length > 0) {
          breakpointArray = breakpoint?.split(",");
        }

        getBreakpoint(breakpointArray);
      }
    },
    [getBreakpoint]
  );

  if (!useRange) {
    // Continuous legend using color table  data
    const colorTableContinuousData = colorTables?.filter((element: any) => {
      return element.discrete === false;
    });

    colorTableContinuousData?.forEach((element: any) => {
      continuosColorData.push({ color: element.colors, name: element.name });
    });

    // Continuous legend using d3 data
    const d3continuousData = d3ColorScales?.filter((element: any) => {
      return element.discrete === false;
    });

    d3continuousData?.forEach((element: any) => {
      continuosD3ColorData.push({ color: element.colors, name: element.name });
    });

    // Discrete legend using color table data
    const discreteData = colorTables?.filter((element: any) => {
      return element.discrete === true;
    });

    discreteData?.forEach((element: any) => {
      discreteColorData.push({ color: element.colors, name: element.name });
    });

    // Discrete legend using d3 data
    const d3discreteData = d3ColorScales?.filter((element: any) => {
      return element.discrete === true;
    });

    d3discreteData?.forEach((element: any) => {
      discreteD3ColorData.push({ color: element.colors, name: element.name });
    });

    // return continuous and discrete legend which uses d3 data
    if (!useColorTableColors) {
      continuousLegend = continuosD3ColorData.map((val: any, index: any) => {
        return (
          <ColorSelectorComponent
            legendColor={val.color}
            legendColorName={val.name}
            useContColorTable={false}
            uniqueId={index}
            colorScaleData={newColorScaleData}
            key={index}
          />
        );
      });

      discreteLegend = d3discreteData.map((val: any, index: any) => {
        return (
          <ColorSelectorComponent
            colorsObject={val.colors}
            legendColorName={val.name}
            useDiscColorTable={false}
            colorScaleData={newColorScaleData}
            key={index}
          />
        );
      });
    }

    // return continuous and discrete legend which uses colortable data
    else if (useColorTableColors) {
      continuousLegend = continuosColorData.map((value: any, index: any) => {
        return (
          <ColorSelectorComponent
            colorsObject={value}
            useContColorTable={true}
            uniqueId={index}
            colorScaleData={newColorScaleData}
            key={index}
          />
        );
      });

      discreteLegend = discreteColorData.map((val: any, index: any) => {
        return (
          <ColorSelectorComponent
            colorsObject={discreteColorData[index]}
            legendColorName={val.name}
            useDiscColorTable={true}
            colorScaleData={newColorScaleData}
            key={index}
          />
        );
      });
    }
  }

  // Sampling through range
  if (useRange) {
    // eslint-disable-next-line
    {
      // eslint-disable-next-line
      useRange;
    }
    return (
      <div
        onChange={(ev) => {
          onChangeRange(ev.target);
        }}
      >
        <input
          type="radio"
          value="Auto"
          name="range"
          disabled={!isCont}
          defaultChecked
        />{" "}
        Auto <br />
        <input type="radio" value="Domain" name="range" disabled={!isCont} />
        <input
          type="text"
          id="minV"
          size={4}
          placeholder="min"
          disabled={isAuto || !isCont}
        />
        <input
          type="text"
          id="maxV"
          size={4}
          placeholder="max"
          disabled={isAuto || !isCont}
        />
      </div>
    );
  } else if (useBreakpoint) {
    // eslint-disable-next-line
    {
      // eslint-disable-next-line
      useBreakpoint;
    }
    return (
      <div
        onChange={(ev) => {
          onChangeBreakpoint(ev.target);
        }}
      >
        <input type="radio" value="None" name="legend" defaultChecked />
        None <br />
        <input type="radio" value="domain" name="legend" />
        <input type="text" id="breakpoint" size={16} disabled={isAuto} />
      </div>
    );
  }

  return (
    <div
      className="legendWrapper"
      style={{
        height: 200,
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
        overflowX: "hidden",
      }}
    >
      {continuousLegend}
      {discreteLegend}
    </div>
  );
};
