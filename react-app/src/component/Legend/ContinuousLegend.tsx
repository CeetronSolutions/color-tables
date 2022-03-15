import * as React from "react";
import {useCallback} from "react"; 
import { useRef } from "react";
import { RGBToHex, colorsArray } from "../Utils/continousLegend";
import { select, scaleLinear, scaleSequential, axisBottom } from "d3";
import { colorTablesArray } from "../ColorTableTypes";
import { ColorSelectorWrapper } from "../ColorSelector/ColorTableSelectorWrapper";

declare type legendProps = {
    min: number;
    max: number;
    dataObjectName: string;
    position?: number[] | null;
    colorName: string;
    colorTables: colorTablesArray | string;
    horizontal?: boolean | null;
    getColorMapname?: any | null;
}

declare type ItemColor = {
    color: string;
    offset: number;
}

export const ContinuousLegend: React.FC<legendProps> = ({
    min,
    max,
    dataObjectName,
    position,
    colorName,
    colorTables,
    horizontal,
    getColorMapname
}: legendProps) => {
    const divRef = useRef<HTMLDivElement>(null);
    const [updateLegend, setUpdateLegendColor] = React.useState([] as any);

    // Get new colorscale from colorselector and update legend
    const colorScaleObject = React.useCallback((colorScaleObject: any) => {
        setUpdateLegendColor(colorScaleObject);
        if (getColorMapname) {
            // needed to change the color of the map
            getColorMapname(colorScaleObject.name);
        }
    }, []);

    React.useEffect(() => {
        if (divRef.current) {
            continuousLegend();
        };
        return function cleanup() {
            select(divRef.current).select("div").remove();
            select(divRef.current).select("svg").remove();
        };
    }, [min, max, colorName, colorTables, horizontal, updateLegend]);

    const [isToggled, setIsToggled] = React.useState(false);
    const handleClick = useCallback(() => {
        setIsToggled(true);
    }, []);

    async function continuousLegend() {
        const itemColor: ItemColor[] = [];
        let dataSet;

        if (typeof colorTables === "string") {
            let res = await fetch(colorTables);
            dataSet = await res.json()
        }
        // Return the matched colors array from color.tables.json file
        let colorTableColors = typeof colorTables === "string" ? 
            colorsArray(colorName, dataSet)
            :
            colorsArray(colorName, colorTables);

        // Update color of legend based on color selector scales
        if (updateLegend.color) {
            colorTableColors = updateLegend.color;
        } else {
            colorTableColors;
        }

        colorTableColors.forEach((value: [number, number, number, number]) => {
            // return the color and offset needed to draw the legend
            itemColor.push({
                offset: RGBToHex(value).offset,
                color: RGBToHex(value).color,
            });
        });
        const colorScale = scaleSequential().domain([min, max]);
        // append a defs (for definition) element to your SVG
        const svgLegend = select(divRef.current)
            .append("svg")
            .style("background-color", "#ffffffcc")
            .style("border-radius", "5px");
        if (!horizontal) {
            svgLegend
                .style("transform", "rotate(270deg)")
                .style("margin-top", "80px");
        }
        const defs = svgLegend.append("defs");
        // append a linearGradient element to the defs and give it a unique id
        const linearGradient = defs
            .append("linearGradient")
            .attr("id", "linear-gradient")
            .attr("x1", "0%")
            .attr("x2", "100%") //since it's a horizontal linear gradient
            .attr("y1", "0%")
            .attr("y2", "0%");
        // append multiple color stops by using D3's data/enter step
        linearGradient
            .selectAll("stop")
            .data(itemColor)
            .enter()
            .append("stop")
            .attr("offset", function (data) {
                return data.offset + "%";
            })
            .attr("stop-color", function (data) {
                return data.color;
            });

        // append title
        svgLegend
            .append("text")
            .attr("class", "legendTitle")
            .attr("x", 25)
            .attr("y", 20)
            .style("text-anchor", "left")
            .text(dataObjectName);

        // draw the rectangle and fill with gradient
        svgLegend
            .append("rect")
            .attr("x", 25)
            .attr("y", 30)
            .attr("width", 250)
            .attr("height", 25)
            .style("fill", "url(#linear-gradient)");

        //create tick marks
        const xLeg = scaleLinear().domain([min, max]).range([10, 258]);

        const axisLeg = axisBottom(xLeg).tickValues(colorScale.domain());

        svgLegend
            .attr("class", "axis")
            .append("g")
            .attr("transform", "translate(15, 55)")
            .style("font-size", "10px")
            .style("font-weight", "700")
            .call(axisLeg);
    }

    return (
        <div
            style={{
                position: "absolute",
                right: position ? position[0] : ' ',
                top: position ? position[1] : ' ',
            }}
        >
            <div id="legend" ref={divRef} onClick={handleClick}></div>
            {isToggled && (
                <ColorSelectorWrapper colorScaleObject={colorScaleObject} />
            )}
        </div>
    );
};

ContinuousLegend.defaultProps = {
    position: [5, 10],
};
