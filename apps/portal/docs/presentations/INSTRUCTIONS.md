# Instructions for Gemini Presentation Creation

## File Locations
All files are in: `apps/portal/docs/`

### Required Files
1. **Presentation Content**
   - Location: `apps/portal/docs/presentations/BUILD-PROCESS.md`
   - Contains: Slide outline and structure
   - Use for: Main presentation content

2. **Metrics Data**
   - Location: `apps/portal/docs/presentations/METRICS-SUMMARY.md`
   - Contains: JSON-formatted metrics
   - Use for: Charts and visualizations

### Supporting Documentation
3. **Build Process Details**
   - Location: `apps/portal/docs/deployment/BUILD-PROCESS.md`
   - Contains: Detailed build steps
   - Use for: Additional context

4. **Performance Details**
   - Location: `apps/portal/docs/deployment/PERFORMANCE.md`
   - Contains: Performance guidelines
   - Use for: Metrics context

5. **Diagrams**
   - Location: `apps/portal/docs/deployment/diagrams/`
   - Files:
     - `BUILD-FLOW.md` - Process diagrams
     - `PERFORMANCE-METRICS.md` - Performance visuals
     - `ERROR-HANDLING.md` - Error flows

## Steps for Gemini

1. **Initial Setup**
   ```
   Use: apps/portal/docs/presentations/BUILD-PROCESS.md
   Purpose: Main presentation structure
   ```

2. **Add Metrics**
   ```
   Use: apps/portal/docs/presentations/METRICS-SUMMARY.md
   Purpose: Data for charts
   ```

3. **Add Diagrams**
   ```
   Use: apps/portal/docs/deployment/diagrams/*.md
   Purpose: Process flows and visualizations
   ```

## Quick References

### For Build Process
```bash
cat apps/portal/docs/presentations/BUILD-PROCESS.md
```

### For Metrics
```bash
cat apps/portal/docs/presentations/METRICS-SUMMARY.md
```

### For Diagrams
```bash
cat apps/portal/docs/deployment/diagrams/BUILD-FLOW.md
cat apps/portal/docs/deployment/diagrams/PERFORMANCE-METRICS.md
cat apps/portal/docs/deployment/diagrams/ERROR-HANDLING.md
```

## Gemini Prompts

1. **Start Presentation**
   ```
   I'll provide content from: apps/portal/docs/presentations/BUILD-PROCESS.md
   ```

2. **Add Metrics**
   ```
   I'll provide metrics from: apps/portal/docs/presentations/METRICS-SUMMARY.md
   ```

3. **Add Diagrams**
   ```
   I'll provide diagrams from: apps/portal/docs/deployment/diagrams/
   ```

## File Order for Sharing
1. `presentations/BUILD-PROCESS.md`
2. `presentations/METRICS-SUMMARY.md`
3. `deployment/diagrams/BUILD-FLOW.md`
4. `deployment/diagrams/PERFORMANCE-METRICS.md`
5. `deployment/diagrams/ERROR-HANDLING.md`

Remember: Share one file at a time with Gemini and wait for confirmation before proceeding to the next.
