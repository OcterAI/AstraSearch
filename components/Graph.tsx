import React, { useEffect, useRef } from 'react';

// Declare functionPlot as a global variable to satisfy TypeScript
declare const functionPlot: any;

interface GraphProps {
  equations: string[];
}

const Graph: React.FC<GraphProps> = ({ equations }) => {
  const graphRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (graphRef.current && typeof functionPlot !== 'undefined') {
      try {
        const plotData = equations.map(eq => ({
          // Allow expressions like 'y=x^2' or just 'x^2'
          fn: eq.includes('=') ? eq.split('=')[1].trim() : eq,
          graphType: 'polyline'
        }));
        
        // Ensure the container is empty before plotting
        graphRef.current.innerHTML = '';

        functionPlot({
          target: graphRef.current,
          width: graphRef.current.clientWidth > 0 ? graphRef.current.clientWidth : 500,
          height: 400,
          grid: true,
          data: plotData,
          tip: {
            xLine: true,
            yLine: true
          }
        });
      } catch (error) {
        console.error("Failed to plot graph:", error);
        // Display a user-friendly error message in the graph container
        if(graphRef.current) {
            graphRef.current.innerHTML = `<div class="text-[color:var(--on-error-container)] bg-[color:var(--error-container)] p-4 rounded-lg">
            <p><strong>Could not plot the graph.</strong> Please check if the equation is valid. Error: ${(error as Error).message}</p>
            </div>`;
        }
      }
    }
  }, [equations]);

  return (
    <div className="w-full max-w-3xl mx-auto mt-4 bg-[color:var(--surface)] rounded-2xl shadow-xl p-4 md:p-6 animate-fade-in">
      <div ref={graphRef} />
    </div>
  );
};

export default Graph;