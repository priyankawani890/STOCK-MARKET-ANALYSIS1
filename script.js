document.addEventListener("DOMContentLoaded", () => {
  // Fetch data and render the initial chart
  fetchAndCreateChart("5y", "AAPL");

  // Event listeners for range buttons
  document.getElementById("btn1month").addEventListener("click", () => {
      fetchAndCreateChart("1mo", st);
  });

  document.getElementById("btn3months").addEventListener("click", () => {
      fetchAndCreateChart("3mo", st);
  });

  document.getElementById("btn1year").addEventListener("click", () => {
      fetchAndCreateChart("1y", st);
  });

  document.getElementById("btn5years").addEventListener("click", () => {
      fetchAndCreateChart("5y", st);
  });

  // Fetch and render stock list
  renderStockList();

  // Function to render stock list
  async function renderStockList() {
      const stocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'PYPL', 'TSLA', 'JPM', 'NVDA', 'NFLX', 'DIS'];
      const stockList = document.getElementById('stockList');

      stocks.forEach(async stock => {
          const listItem = document.createElement('li');
          listItem.textContent = stock;
          listItem.addEventListener('click', () => {
              fetchAndCreateChart("5y", stock);
          });
          stockList.appendChild(listItem);
      });
  }

  // Fetch stock data and create chart
  async function fetchAndCreateChart(range, symbol) {
      const url = `https://stocks3.onrender.com/api/stocks/getstocksdata`;
      try {
          const response = await fetch(url);
          const result = await response.json();
          const chartData = result.stocksData[0][symbol][range].value;
          const labels = result.stocksData[0][symbol][range].timeStamp.map(timestamp => new Date(timestamp * 1000).toLocaleDateString());
          drawChartWithPointer(chartData, labels, symbol);
          const summary = await fetchSummaryData(symbol); // Fetch summary data
          updateStockDetails(symbol, summary); // Update stock details
      } catch (error) {
          console.error(error);
      }
  }

  // Function to fetch summary data from API
  async function fetchSummaryData(symbol) {
      const url = `https://stocks3.onrender.com/api/stocks/getstockstatsdata`;
      try {
          const response = await fetch(url);
          const data = await response.json();
          // console.log(data);
          // console.log(symbol);
          
          return data.stocksStatsData[0][symbol].summary;

      } catch (error) {
          console.error('Error fetching summary data:', error);
          return null;
      }
  }

  function updateStockDetails(symbol, summary) {
    document.getElementById('stockName').textContent = `Stock Name: ${symbol}`;
    document.getElementById('stockProfit').textContent = `Profit: ${summary.profit}`;
    document.getElementById('stockBookValue').textContent = `Book Value: ${summary.bookValue}`;
    document.getElementById('stockSummary').textContent = `Stock Summary: ${summary}`;
}

  // Function to draw chart with pointer
  function drawChartWithPointer(data, labels, symbol) {
      const canvas = document.getElementById('stockChart');
      const ctx = canvas.getContext('2d');
      const chartHeight = canvas.height - 40;
      const chartWidth = canvas.width - 60;
      const dataMax = Math.max(...data);
      const dataMin = Math.min(...data);
      const dataRange = dataMax - dataMin;
      const dataStep = dataRange > 0 ? chartHeight / dataRange : 0;
      const stepX = chartWidth / (data.length - 1);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.beginPath();
      ctx.moveTo(0, chartHeight - (data[0] - dataMin) * dataStep);
      for (let i = 1; i < data.length; i++) {
          ctx.lineTo(i * stepX, chartHeight - (data[i] - dataMin) * dataStep);
      }
      ctx.strokeStyle = '#39FF14';
      ctx.lineWidth = 2;
      ctx.stroke();

      const tooltip = document.getElementById('tooltip');
      const xAxisLabel = document.getElementById('xAxisLabel');
      const pointer = document.getElementById('pointer');

      canvas.addEventListener('mousemove', event => {
          const x = event.offsetX;
          const y = event.offsetY;
          const dataIndex = Math.min(Math.floor(x / stepX), data.length - 1);
          const stockValue = data[dataIndex].toFixed(2);
          const xAxisValue = labels[dataIndex];

          tooltip.style.display = 'block';
          tooltip.style.left = `${x + 10}px`;
          tooltip.style.top = `${y - 20}px`;
          tooltip.textContent = `${symbol}: $${stockValue}`;

          xAxisLabel.style.display = 'block';
          xAxisLabel.style.fontSize = '14px';
          xAxisLabel.style.fontWeight = 'bolder';
          xAxisLabel.style.left = `${x}px`;
          xAxisLabel.textContent = xAxisValue;

          pointer.style.display = 'block';
          pointer.style.left = `${x}px`;

          ctx.clearRect(0, 0, canvas.width, chartHeight);
          ctx.clearRect(0, chartHeight + 20, canvas.width, canvas.height - chartHeight - 20);

          ctx.beginPath();
          ctx.moveTo(0, chartHeight - (data[0] - dataMin) * dataStep);
          for (let i = 1; i < data.length; i++) {
              ctx.lineTo(i * stepX, chartHeight - (data[i] - dataMin) * dataStep);
          }
          ctx.strokeStyle = '#39FF14';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.beginPath();
          ctx.setLineDash([2, 2]);
          ctx.moveTo(0, zeroY);
          ctx.lineTo(canvas.width, zeroY);
          ctx.strokeStyle = '#ccc';
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, chartHeight);
          ctx.strokeStyle = '#ccc';
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(x, chartHeight - (data[dataIndex] - dataMin) * dataStep, 6, 0, 2 * Math.PI);
          ctx.fillStyle = '#39FF14';
          ctx.fill();
      });

      canvas.addEventListener('mouseout', () => {
          tooltip.style.display = 'none';
          xAxisLabel.style.display = 'none';
          pointer.style.display = 'none';
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          drawChart(data, labels, symbol);
      });
  }
});
