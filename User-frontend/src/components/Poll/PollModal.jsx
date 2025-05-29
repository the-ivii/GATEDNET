import React, { useEffect, useState } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import Modal from '../UI/Modal';
import Button from '../UI/Button';
import axios from 'axios';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const PollModal = ({ pollId, onClose }) => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!pollId) return;
    setLoading(true);
    setError(null);
    axios.get(`http://localhost:5001/api/member/polls/${pollId}/results`)
      .then(res => {
        setResults(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch poll results');
        setLoading(false);
      });
  }, [pollId]);

  if (!pollId) return null;

  let chartData = null;
  let chartOptions = null;
  if (results) {
    chartData = {
      labels: results.results.map(opt => opt.text),
      datasets: [
        {
          label: 'Votes (%)',
          data: results.results.map(opt => parseFloat(opt.percentage)),
          backgroundColor: 'rgba(45, 85, 255, 0.7)',
          borderColor: 'rgb(45, 85, 255)',
          borderWidth: 2,
        },
      ],
    };
    chartOptions = {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Vote Percentage by Option', color: '#fff', font: { size: 20 } },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.parsed.y}% (${results.results[ctx.dataIndex].votes} votes)`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: { color: '#fff', callback: v => v + '%' },
          grid: { color: 'rgba(255,255,255,0.1)' }
        },
        x: {
          ticks: { color: '#fff' },
          grid: { color: 'rgba(255,255,255,0.1)' }
        }
      }
    };
  }

  return (
    <Modal isOpen={!!pollId} onClose={onClose} title="Poll Results" width="lg" bgColorClass="bg-navy-900" titleColorClass="text-white">
      <div className="p-6 rounded-2xl">
        {loading ? (
          <div className="text-center text-white py-8">Loading poll results...</div>
        ) : error ? (
          <div className="text-center text-red-400 py-8">{error}</div>
        ) : results ? (
          <>
            <h2 className="text-2xl font-bold text-white mb-6 text-center">{results.title}</h2>
            <div className="mb-8">
              <Bar data={chartData} options={chartOptions} />
            </div>
            <div className="flex flex-col gap-2 mt-6">
              {results.results.map((opt, idx) => (
                <div key={idx} className="flex justify-between items-center bg-navy-800 border-2 border-navy-700 rounded-lg px-4 py-3 text-white">
                  <span className="font-semibold text-lg">{opt.text}</span>
                  <span className="text-gray-300 text-base">{opt.votes} votes</span>
                  <span className="font-bold text-blue-400 text-lg">{opt.percentage}%</span>
                </div>
              ))}
            </div>
            <div className="mt-8 flex justify-center">
              <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Close</Button>
            </div>
          </>
        ) : null}
      </div>
    </Modal>
  );
};

export default PollModal;