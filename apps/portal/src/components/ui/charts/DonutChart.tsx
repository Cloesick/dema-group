import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

interface DonutChartProps {
  data: Array<{
    name: string
    value: number
  }>
  colors?: string[]
  width?: number
  height?: number
  innerRadius?: number
  outerRadius?: number
}

export function DonutChart({
  data,
  colors = ['#2196f3', '#f44336', '#4caf50', '#ff9800'],
  width = 200,
  height = 200,
  innerRadius = 60,
  outerRadius = 80
}: DonutChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !data.length) return

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove()

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`)

    // Create color scale
    const color = d3.scaleOrdinal<string>()
      .domain(data.map((d: { name: string }) => d.name))
      .range(colors)

    // Create pie generator
    const pie = d3.pie<{ name: string; value: number }>()
      .value((d: { name: string; value: number }) => d.value)
      .sort(null)

    // Create arc generator
    const arc = d3.arc<d3.PieArcDatum<{ name: string; value: number }>>()      .innerRadius(innerRadius)
      .outerRadius(outerRadius)

    // Create arcs
    const arcs = svg.selectAll('path')
      .data(pie(data))
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', (d: d3.PieArcDatum<{ name: string; value: number }>) => color(d.data.name))
      .attr('stroke', 'white')
      .style('stroke-width', '2px')

    // Add labels
    const label = svg.selectAll('text')
      .data(pie(data))
      .enter()
      .append('text')
      .attr('transform', (d: d3.PieArcDatum<{ name: string; value: number }>) => `translate(${arc.centroid(d)})`)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .text((d: d3.PieArcDatum<{ name: string; value: number }>) => d.data.value)
      .style('fill', 'white')
      .style('font-size', '12px')
      .style('font-weight', 'bold')

  }, [data, colors, width, height, innerRadius, outerRadius])

  return (
    <svg ref={svgRef} />
  )
}
