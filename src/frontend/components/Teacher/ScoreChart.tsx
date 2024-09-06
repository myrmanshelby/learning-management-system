import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Box, Button, Typography, TextField, CircularProgress } from '@mui/material';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ScoreChart = ({ classID }) => {
  const [chartData, setChartData] = useState(null);
  const [chapterData, setChapterData] = useState(null);
  const [sectionData, setSectionData] = useState(null);
  const [learningObjectiveData, setLearningObjectiveData] = useState(null);
  const [selectedFeedback, setSelectedFeedback] = useState(''); // New state for selected feedback
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChapterData = async () => {
      try {
        const response = await fetch(`/api/class-chapter-data/${classID}`);
        const data = await response.json();
        const { objectiveScoreData, sectionScoreData, chapterScoreData } = data;
        setChapterData(chapterScoreData);
        setChartData(chapterScoreData);
        setSectionData(sectionScoreData);
        setLearningObjectiveData(objectiveScoreData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChapterData();
  }, [classID]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed.y * 100;
            return `${value.toFixed(2)}%`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        min: 0,
        max: 1,
        ticks: {
          callback: (value) => {
            return `${(value * 100).toFixed(2)}%`;
          },
        },
      },
      x: {
        ticks: {
          autoSkip: false,
          callback: function (value) {
            const label = this.getLabelForValue(value);
            const words = label.split(' ');
            const maxLineLength = 20; // Adjust this value as needed
            const lines = [];
            let currentLine = '';

            words.forEach((word) => {
              if (currentLine.length + word.length <= maxLineLength) {
                currentLine += (currentLine.length > 0 ? ' ' : '') + word;
              } else {
                lines.push(currentLine);
                currentLine = word;
              }
            });
            lines.push(currentLine);
            return lines;
          },
        },
      },
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const clickedIndex = elements[0].index;
        if (chartData.level === 'chapter') {
          const clickedChapter = chartData.labels[clickedIndex];
          if (sectionData[clickedChapter]) {
            setChartData(sectionData[clickedChapter]);
            setSelectedFeedback(''); // Clear feedback when switching levels
          }
        } else if (chartData.level === 'section') {
          const clickedSection = chartData.labels[clickedIndex];
          if (learningObjectiveData[clickedSection]) {
            setChartData(learningObjectiveData[clickedSection]);
            setSelectedFeedback(''); // Clear feedback when switching levels
          }
        } else if (chartData.level === 'learningObjective') {
          const clickedObjective = chartData.labels[clickedIndex];
          console.log(learningObjectiveData[chartData.title]);
          console.log(clickedObjective);
          const feedback = learningObjectiveData[chartData.title]?.feedback[clickedObjective] || 'No feedback available';
          setSelectedFeedback(feedback); // Set the feedback for the clicked objective
        }
      }
    },
    onHover: (event, elements) => {
      if (elements.length > 0 && (chartData.level === 'chapter' || chartData.level === 'section')) {
        event.native.target.style.cursor = 'pointer';
      } else {
        event.native.target.style.cursor = 'default';
      }
    },
  };

  const handleBackToSections = () => {
    const parentSection = Object.keys(learningObjectiveData).find((section) =>
      learningObjectiveData[section].title === chartData.title
    );
    if (parentSection) {
      const parentChapter = Object.keys(sectionData).find((chapter) =>
        sectionData[chapter].labels.includes(parentSection)
      );
      if (parentChapter) {
        setChartData(sectionData[parentChapter]);
        setSelectedFeedback(''); // Clear feedback when switching levels
      }
    }
  };

  const handleBackToChapters = () => {
    setChartData(chapterData);
    setSelectedFeedback(''); // Clear feedback when switching levels
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Typography>Error: {error}</Typography>;
  }

  return (
    <Box sx={{ width: '600px', margin: 'auto', textAlign: 'center' }}>
      <Typography variant="h6" align="center" gutterBottom>
        {chartData.title}
      </Typography>
      {chartData.level === 'chapter' && (
        <TextField
          fullWidth
          disabled
          variant="outlined"
          value="Click on a bar to view the section scores for that chapter."
          sx={{ marginBottom: 2 }}
        />
      )}
      {chartData.level === 'section' && (
        <TextField
          fullWidth
          disabled
          variant="outlined"
          value="Click on a bar to view the scores for the learning objectives in that section."
          sx={{ marginBottom: 2 }}
        />
      )}
      <Bar
        data={{
          labels: chartData.labels,
          datasets: [
            {
              label: 'Scores',
              data: chartData.data,
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
            },
          ],
        }}
        options={options}
      />
      {chartData.level === 'section' && (
        <Button
          variant="contained"
          color="primary"
          onClick={handleBackToChapters}
          sx={{ marginTop: 2 }}
        >
          Back to Chapter Scores
        </Button>
      )}
      {chartData.level === 'learningObjective' && (
        <>
          <Button
            variant="contained"
            color="primary"
            onClick={handleBackToSections}
            sx={{ marginTop: 2 }}
          >
            Back to Section Scores
          </Button>
          {selectedFeedback && (
            <TextField
              fullWidth
              multiline
              disabled
              variant="outlined"
              value={selectedFeedback}
              sx={{ marginTop: 2 }}
            />
          )}
        </>
      )}
    </Box>
  );
};

export default ScoreChart;