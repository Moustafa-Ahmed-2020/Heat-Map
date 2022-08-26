document.addEventListener("DOMContentLoaded", function () {
  function heatMap(obj) {
    const dataSet = obj.monthlyVariance;
    const base = obj.baseTemperature;
    const w = 1500;
    const h = 500;
    const pad = { left: 70, right: 50, top: 50, bottom: 50 };
    const wLeg = 400;
    const hLeg = 150;
    const padLeg = { left: 15, right: 15, top: 30, bottom: 30 };

    const minYear = d3.min(dataSet, (d) => d.year);
    const maxYear = d3.max(dataSet, (d) => d.year);
    const minMonth = d3.min(dataSet, (d) => d.month);
    const maxMonth = d3.max(dataSet, (d) => d.month);
    const minTemp = d3.min(dataSet, (d) => base + d.variance);
    const maxTemp = d3.max(dataSet, (d) => base + d.variance);

    const years = [];

    for (let y = minYear; y <= maxYear; y++) {
      years.push(y);
    }

    const dataSetLegend = [];
    for (
      let t = minTemp;
      t <= maxTemp;
      t += (maxTemp - minTemp) / 6 - Number.EPSILON
    ) {
      dataSetLegend.push(t.toFixed(4));
    }

    const rectWidth =
      (wLeg - padLeg.left - padLeg.right) / dataSetLegend.length;

    const tScale = d3
      .scaleSequential()
      .domain([minTemp, maxTemp])
      .interpolator(d3.interpolateInferno);

    function parseTime(int) {
      const date = d3.timeParse("%m")(int);
      const month = d3.timeFormat("%B")(date);
      return month;
    }

    const xScale = d3
      .scaleLinear()
      .domain([minYear, maxYear])
      .range([pad.left, w - pad.right]);

    const xScaleLegend = d3
      .scaleLinear()
      .domain([minTemp, maxTemp])
      .range([padLeg.left, wLeg - padLeg.right]);

    const yScale = d3
      .scaleLinear()
      .domain([minMonth, maxMonth])
      .range([h - pad.bottom - pad.top, pad.top]);

    const svg = d3
      .select("#container")
      .append("svg")
      .attr("width", w)
      .attr("height", h);

    const legend = d3
      .select("#container")
      .append("svg")
      .attr("id", "legend")
      .attr("width", wLeg)
      .attr("height", hLeg)
      .style("border", "1px solid black")
      .style("background-color", "#bfbfbf")
      .style("margin", "1rem");

    legend
      .selectAll("rect")
      .data(dataSetLegend)
      .enter()
      .append("rect")
      .attr("x", (d, i) => i * rectWidth + padLeg.left)
      .attr("y", hLeg - padLeg.bottom - 50)
      .attr("width", rectWidth)
      .attr("height", 50)
      .attr("fill", (d) => tScale(d));

    legend
      .append("text")
      .text("Legend")
      .attr("font-size", "1.5rem")
      .attr("x", wLeg / 2 - 30)
      .attr("y", padLeg.top);

    svg
      .append("text")
      .attr("x", w / 2 - 50)
      .attr("y", pad.top / 2)
      .attr("id", "title")
      .attr("font-size", "1.5rem")
      .text("Monthly Heat Map");

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    const legendAxis = d3.axisBottom(xScaleLegend);

    const tooltip = d3
      .select("body")
      .append("div")
      .attr("id", "tooltip")
      .style("opacity", 0);

    const description = d3
      .select("svg")
      .append("text")
      .attr("x", w / 2 - 150 + "px")
      .attr("y", pad.top - 10 + "px")
      .attr("id", "description")
      .html(
        "This chart represents earth surface temperature variation over time"
      );

    svg
      .append("g")
      .attr(
        "transform",
        `translate(0,${h - pad.bottom - (h - pad.top - pad.bottom) / 24})`
      )
      .call(xAxis.tickFormat(d3.format("d")))
      .attr("id", "x-axis");

    svg
      .append("g")
      .attr(
        "transform",
        `translate(${pad.left},${(h - pad.top - pad.bottom) / 24})`
      )
      .call(yAxis.tickFormat((d) => parseTime(d)))
      .attr("id", "y-axis");

    legend
      .append("g")
      .attr("transform", `translate(0,${hLeg - padLeg.bottom})`)
      .call(legendAxis.tickValues(dataSetLegend));

    svg
      .selectAll("rect")
      .data(dataSet)
      .enter()
      .append("rect")
      .attr("class", "cell")
      .attr("data-month", (d) => d.month - 1)
      .attr("data-year", (d) => d.year)
      .attr("data-temp", (d) => base + d.variance)
      .attr("fill", (d) => `${tScale(base + d.variance)}`)
      .attr("x", (d) => xScale(d.year))
      .attr("y", (d) => yScale(d.month))
      //.attr("width", (d) => xScale(d.year))
      .attr("width", (w - pad.left - pad.right) / years.length)
      .attr("height", (h - pad.top - pad.bottom) / 12)
      .on("mouseover", (e, d) => {
        tooltip.transition().duration(200);
        tooltip.style("opacity", 0.9);
        tooltip.attr("data-year", d.year);
        tooltip.style("top", e.pageY + "px").style("left", e.pageX + "px");

        tooltip.html(() => {
          return `Year:${d.year}<br>Month:${parseTime(d.month)}<br>Temp:${
            base + d.variance
          }`;
        });
      })
      .on("mouseout", () => {
        tooltip.transition().duration(200).style("opacity", 0);
      });
  }

  async function getData(url) {
    const req = await fetch(url)
      .then((response) => response.json())
      .then((data) => heatMap(data))
      .catch((error) => console.log(error));
  }
  getData(
    "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"
  );
});