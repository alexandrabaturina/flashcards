import { formatTime, sum } from './helpers.js';

document.addEventListener('DOMContentLoaded', function () {

  visualizeCategories();

  const coll = document.querySelectorAll('.collapsible');

  // Open collapsible sections
  coll.forEach(section => {
    section.addEventListener('click', event => {

      const stack = event.target.closest('.collapsible');

      section.classList.toggle('active');
      const content = section.nextElementSibling;
      if (content.style.maxHeight) {
        content.style.maxHeight = null;
      } else {
        // Svg height is 400 px
        content.style.maxHeight = content.scrollHeight + 400 + "px";
      }

      visualizeStackProgress(stack.dataset.id);
    })
  })
})

function visualizeCategories() {
  // Get categories to visualize
  fetch('/get-categories', {
    method: 'GET'
  })
    .then(response => response.json())
    .then(items => {
      // Prepare data
      let data = {}

      JSON.parse(items).forEach(item => {
        const category = item["fields"]["title"]
        data[category] = data[category] + 1 || 1;
      });

      // Sort categories by number of tries
      const sorted = Object.entries(data).sort((a, b) => b[1] - a[1]);

      // Show only 6 categories
      if (sorted.length > 5) {
        const sliced = [];
        let slicedSum = 0;
        for (let i = 0; i < 5; i++) {
          sliced[i] = sorted[i];
          slicedSum += sliced[i][1]
        }
        sliced.push(["Other", sum(data) - slicedSum]);

        let dataset = {}
        sliced.forEach(item => {
          dataset[item[0]] = item[1]
        })
        data = dataset;
      }

      // Get categories
      const keys = Object.keys(data);

      // Set the dimensions and margins of the graph
      const width = 300
      const height = 470
      const margin = 40
      const radius = 110

      const svg = d3.select("#categories-chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + (height - 150) / 2 + ")");

      // Set color scale
      const color = d3.scaleOrdinal()
        .domain(data)
        .range(["#f5a3b7", "#745582", "#fab73d", "#72a75b", "#715f65", "#8498af"])

      // Compute the position of each group on the pie
      const pie = d3.pie()
        .value(function (d) { return d.value; })
      const data_ready = pie(d3.entries(data))

      // Build the pie chart
      svg
        .selectAll('arc')
        .data(data_ready)
        .enter()
        .append('path')
        .attr('d', d3.arc()
          .innerRadius(60)
          .outerRadius(radius)
        )
        .attr('fill', function (d) { return (color(d.data.key)) })
        .attr("stroke", "black")
        .style("stroke-width", "2px")
        .style("opacity", 0.7)

      // Add title
      svg.append("text")
        .attr("x", 0)
        .attr("y", (0 - radius - 20))
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "800")
        .text(`Top-${keys.length} Practiced Categories`)

      // Add annotations
      svg
        .selectAll('arc')
        .data(data_ready)
        .enter()
        .append('text')
        .text(function (d) { return d.data.value })
        .attr("transform", function (d) {
          return "translate(" + d3.arc()
            .innerRadius(60)
            .outerRadius(radius).centroid(d) + ")";
        })
        .style("text-anchor", "middle")
        .style("font-size", "14px")

      // Add legend
      const size = 20
      svg.selectAll("categories")
        .data(keys)
        .enter()
        .append("rect")
        .attr("x", -150)
        .attr("y", function (d, i) { return 150 + i * (size + 5) })
        .attr("width", size)
        .attr("height", size)
        .style("fill", function (d) { return color(d) })

      // Add one dot in the legend for each category
      svg.selectAll("labels")
        .data(keys)
        .enter()
        .append("text")
        .attr("x", -150 + size * 1.2)
        .attr("y", function (d, i) { return 150 + i * (size + 5) + (size / 2) })
        .style("fill", function (d) { return color(d) })
        .text(function (d) { return d })
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        .style("font-size", "16px")
    });
}

function visualizeStackProgress(stack) {

  // Get stack data
  fetch(`/get-data-to-visualize-stacks/${stack}`, {
    method: 'GET'
  })
    .then(response => response.json())
    .then(data => {
      const attempts = JSON.parse(data);
      const questions = attempts[0]["fields"]["number_of_questions"];

      const stackProgressDiv = document.querySelector(`[svg-data-id="${stack}"]`);
      stackProgressDiv.innerHTML = '';

      const basicWidth = stackProgressDiv.offsetWidth;

      // Set chart dimensions and margins
      const margin = { top: 30, right: 20, bottom: 110, left: 20 },
        width = basicWidth - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

      // Append svg object
      const svg = d3.select(`[svg-data-id="${stack}"]`)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

      // Add title
      svg.append("text")
        .attr("x", (width / 2))
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "800")
        .text(`Last ${attempts.length} Attempts`);


      // Add X axis
      const x = d3.scaleBand()
        .range([0, width])
        .domain(attempts.map(function (attempt) {
          return formatDateTime(attempt["fields"]["timestamp"]);
        }
        ))
        .padding(0.2);

      function formatDateTime(datetime) {
        return `${datetime.slice(0, 10)} ${datetime.slice(11, 19)}`;
      }

      svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,10)rotate(-65)")
        .style("text-anchor", "end");

      // Add Y axis
      const y = d3.scaleLinear()
        .domain([0, questions])
        .range([height, 0])

      svg.append("g")
        .call(d3.axisLeft(y).ticks(questions))

      // Add bars
      svg.selectAll("bar")
        .data(attempts)
        .enter()
        .append("rect")
        .attr("x", function (attempt) { return x(formatDateTime(attempt["fields"]["timestamp"])); })
        .attr("y", function (attempt) { return y(attempt["fields"]["correct_answers"]); })
        .attr("width", x.bandwidth())
        .attr("height", function (attempt) { return height - y(attempt["fields"]["correct_answers"]); })
        .attr("fill", "#8498af")
        .on("mouseover", function (attempt) {
          div.transition()
            .duration(100)
            .style("opacity", 0.9);
          div.html(`
          Time spent:</br>
          ${formatTime(attempt["fields"]["time_spent"])}
          `)
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
          d3.select(this).transition().attr("fill", "#72a75b");
        })
        .on("mouseout", function () {
          div.transition()
            .duration(100)
            .style("opacity", 0);
          d3.select(this).transition().attr("fill", "#8498af");
        });

      // Add tooltip
      const div = d3.select(`[svg-data-id="${stack}"]`)
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
    })
}