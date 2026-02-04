import React, { useState } from 'react';

const KnittingChart: React.FC = () => {
    const [currentRow, setCurrentRow] = useState(14);
    const [totalRows] = useState(48);

    return (
        <div className="knitting-chart-section" style={{ marginTop: 0 }}>
            <h3>Knitting chart line by line</h3>
            <div className="chart-container">
                <img src="/IconsImages/LineByLineChart.png" alt="Knitting Chart" className="chart-image" />
                <div className="chart-controls">
                    <div className="total-rows">{totalRows}</div>
                    <div className="row-navigator">
                        <button
                            className="nav-button"
                            onClick={() => setCurrentRow(Math.max(1, currentRow - 1))}
                            disabled={currentRow <= 1}
                            aria-label="Previous row"
                        >
                            &lt;
                        </button>
                        <div className="current-row-display">
                            <span className="row-label">Current row:</span>
                            <span className="row-number">{currentRow}</span>
                        </div>
                        <button
                            className="nav-button"
                            onClick={() => setCurrentRow(Math.min(totalRows, currentRow + 1))}
                            disabled={currentRow >= totalRows}
                            aria-label="Next row"
                        >
                            &gt;
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KnittingChart;
