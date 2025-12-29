import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

interface LineChartProps {
  data: Array<{
    date: string
    value: number
  }>
  width?: number
  height?: number
  color?: string
  margin?: { top: number; right: number; bottom: number; left: number }
}

export function LineChart({
  data,
  width = 600,
  height = 400,
  color = '#2196f3',
  margin = { top: 20, right: 20, bottom: 30, left: 40 }
}: LineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !data.length) return

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove()

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)

    // Create scales
    const x = d3.scaleTime()
      .domain(d3.extent(data, (d: { date: string }) => new Date(d.date)) as [Date, Date])
      .range([margin.left, width - margin.right])

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, (d: { value: number }) => d.value) || 0])
      .nice()
      .range([height - margin.bottom, margin.top])

    // Create line generator
    const line = d3.line<{ date: string; value: number }>()
      .x((d: { date: string; value: number }) => x(new Date(d.date)))
      .y((d: { date: string; value: number }) => y(d.value))

    // Add the line path
    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 2)
      .attr('d', line)

    // Add x-axis
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))

    // Add y-axis
    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))

    // Add dots
    svg.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (d: { date: string }) => x(new Date(d.date)))
      .attr('cy', (d: { value: number }) => y(d.value))
      .attr('r', 4)
      .attr('fill', color)

  }, [data, width, height, color, margin])

  return (
    <svg ref={svgRef} />
  )
}
