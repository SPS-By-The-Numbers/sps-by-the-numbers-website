'use client';

import HighchartsReact from 'highcharts-react-official'
import { useHighcharts } from 'components/providers/HighchartsProvider';
import { useState } from 'react';

import DataControl from 'components/DataControl'
import Histogram from 'components/Histogram'
import data2022 from 'data/panorama/2022.json'
import data2023 from 'data/panorama/2023.json'

// This specifies the sort order for answers. The min and max values
// also double as the mix/max of the graph. The exact value of other
// numbers in the middle don't matter other than the sign.
const AnswerSortOrder = {
  "Strongly disagree": -1,
  "Disagree": -2,
  "Kind of disagree": -100,
  "Kind of agree": 100,
  "Agree": 2,
  "Strongly agree": 1,

  "Yes": 1,
  "I don't know": 100,
  "No": -100,

  "Very Negatively": -1,
  "Somewhat Negatively": -100,
  "No Change": 1,
  "Somewhat Positively": 2,
  "Very Positively": 100,

  "Never": -1,
  "Sometimes": 100,
  "Often": 2,
  "Always": 1,
};

const INITIAL_SELECTED_SUBJECTS = ["Adams", "Cascadia", "", ""];
export default function PanoramaSlicer() {
  const { highchartsObjs } = useHighcharts();

  // Default to 2023.
  const [year, setYear] = useState(2023);

  const [reports, setReports] = useState(null);
  const [stacked, setStacked] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState("");
  const [selectedSurvey, setSelectedSurvey] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState(INITIAL_SELECTED_SUBJECTS);

  const loadData = (newYear) => {
    let data = null;
    if (newYear == 2023) {
      data = data2023;
    } else if (newYear == 2022) {
      data = data2022;
    } else {
      // Default to 2023.
      newYear = 2023;
      data = data2023;
    }

    // Set the state.
    const curReports = data['reports'];
    setYear(newYear);
    setReports(curReports);
    setSelectedReportType(curReports[0]);
    setSelectedSubjects(INITIAL_SELECTED_SUBJECTS);
  };

  const handleChange = (event) => {
    const target = event.target;
    const type = target.dataset.type;
    if (type === "report") {
      setSelectedReportType(target.value);
      setSelectedSurvey("");
      setSelectedSubjects(INITIAL_SELECTED_SUBJECTS);
    } else if (type === "survey") {
      setSelectedSurvey(target.value);
      setSelectedSubjects(INITIAL_SELECTED_SUBJECTS);
    } else if (type === "stacked") {
      setStacked(target.checked);
    } else if (type === "subject") {
      const newSelectedSubjects = [...selectedSubjects];
      newSelectedSubjects[parseInt(target.dataset.ordinal)] = event.target.value;
      setSelectedSubjects(newSelectedSubjects);
    } if (type === "year") {
      loadData(target.value);
    }
  };

  const calculateDistictivenessScore = (series) => {
    let score = 0;
    const to_process = [...series];
    const num_series = to_process.length;
    let cur  = undefined;
    while ((cur = to_process.shift()) !== undefined) {
      to_process.forEach(e => {
        for (let i = 0; i < cur.data.length; i++) {
          const diff = cur.data[i] - e.data[i];
          score += Math.abs(diff) / num_series / cur.data.length;
        }
      });
    }
    return score;
  };

  const makeGraphs = (reports, stacked) => {
    const graphs = [];
    if (reports === null) {
      graphs.push(<div key="ruh-roh">Data loading. please wait.</div>);
    } else {
      // [ { question, data: {xlabel, ylabel, series: [a,b,c]}}
      const all_question_data = {};

      // Iterate over all selected schools and group data by question
      // into all_question_data.
      selectedSubjects.forEach(school => {
        const report = reports[selectedReportType];
        if (!report) return;
        const survey = report[selectedSurvey];
        if (!survey) return;
        const school_data = survey[school];
        if (!school_data) return;

        Object.keys(school_data).forEach(question => {
          const responses = school_data[question];

          // Calculate percents.
          const total_respondents = responses.answer_respondents.reduce((a, n) => a+n, 0);

          // Set the data.
          let data = all_question_data[question];
          if (data === undefined) {
            data = {
              categories: responses.answers,
              xlabel: 'Rating',
              ylabel: '%',
              series: []
            };

            all_question_data[question] = data;
          }
          data.series.push({
            name: school,
            data: responses.answer_respondents.map(v => Math.round(v * 1000 / total_respondents)/10),
            tooltip: {
              footerFormat: `n = ${total_respondents}`
            }
          });
        });
      });

      const sorted_questions = [];
      for (let [question, data] of Object.entries(all_question_data)) {
        sorted_questions.push({
          question,
          data,
          distinctive_question_score: this.calculateDistictivenessScore(data.series)
        });
      }
      sorted_questions.sort((a,b) => b.distinctive_question_score - a.distinctive_question_score);


      sorted_questions.forEach( q => {
        const title = `${q.question} (diff = ${Math.round(q.distinctive_question_score*10)/10})`;
        if (stacked) {
          const series_by_response = {};
          const schools = [];
          q.data.series.forEach(d => {
            schools.push(d.name);
            // TODO(awong): Incorrect calculation of N.
            q.data.categories.forEach((a,idx) => {
                const arr = series_by_response[a] = series_by_response[a] || {
                  name: a,
                  data: [],
                  tooltip: d.tooltip
                };
                arr.type = "bar";
                arr.data.push(d.data[idx]);
            });
          });

          if (q.question.search("OSPI") !== -1) {
            console.log("wut");
            debugger;
          }

          // Now we have all the data. Sort the buckets and center on 0.
          const sortOrderMap = {};
          let shouldCenterOnZero = false;
          Object.entries(series_by_response).forEach(([key, value], idx) => {
            let sortPos = idx;
            if (key in AnswerSortOrder) {
               sortPos = AnswerSortOrder[key];
               shouldCenterOnZero = true;
            }
            sortOrderMap[sortPos] = key;
            if (sortPos < 0) {
              value.data = value.data.map(d => -d);
            }
          });
          const sortOrder = Object.keys(sortOrderMap).sort((a,b) => sortOrderMap[a] < sortOrderMap[b]);

          const options = {
            title: { text: title },
            xAxis: {
              title: { text: q.data.xlabel },
              categories: schools,
            },
            yAxis: {
              title: { text: q.data.ylabel },
              plotLines: [{
                color: 'black', // Color value
                value: 0, // Value of where the line will appear
                width: 3 // Width of the line
              }],
            },
            plotOptions: {
              series: {
                stacking: 'normal'
              }
            },
            series: sortOrder.map(v => series_by_response[sortOrderMap[v]]),
          };

          // HACK! Detect if the value was mapped frim AnswerSortOrder.
          if (shouldCenterOnZero) {
            options.yAxis.min = -80;
            options.yAxis.max = 80;
          }

          graphs.push(
            <div className="h-90 flex overflow-hidden">
              <figure className="p-2 m-1 flex flex-col w-full bg-gray-100 histogram">
                  <HighchartsReact
                    highcharts={highchartsObjs.highcharts}
                    options={options}
                  />
              </figure>
            </div>
          );
        } else {
          graphs.push(
            <div className="h-90 flex overflow-hidden">
            <Histogram key={q.question} data={q.data} title={`${q.question} (diff = ${Math.round(q.distinctive_question_score*10)/10})`} />
            </div>
          );
        }
      });
    }
    return graphs;
  };


  const graphs = makeGraphs(reports, stacked);

  return (
    <main className="app-main">
      <header className="p-2 h-full w-full min-h-screen items-stretch justify-items-stretch bg-gray-300 space-x-1">
        <h4 className="p-2 font-bold">Seattle Public Schools Panorama Comparison Tool, 2022-2023 data (<a href="https://sps-panorama.web.app/">2019 here</a>)</h4>
        <section className="p-2 whitespace-normal tracking-normal space-x-1">
            <p>Data taken scraped using <a href="https://github.com/awong-dev/sps-by-the-numbers/blob/main/tools/scrape-panorama.js">a javascript blob</a> run on Panorama data viewer portal linked from the 
            <a href="https://www.seattleschools.org/departments/rea/district-surveys/">SPS District Survey</a> page.  Note in 2022, not every survey had a lot of responses. Hover over bar graphs to check the &quot;n&quot;.
            </p>
            <p>Graphs are in pecentages. Hover over data series for population size. When multiple series are selected, graphs are sorted to show questions with *most different* responses first. <a target="_blank" href="https://github.com/awong-dev/sps-by-the-numbers">[source]</a> <a target="_blank" href="https://github.com/awong-dev/sps-by-the-numbers/issues">[submit bug/feedback]</a>
            </p>

        </section>
        <DataControl
          data={reports}
          year={year}
          report_type={selectedReportType}
          survey={selectedSurvey}
          stacked={stacked}
          subjects={selectedSubjects}
          onChange={handleChange}
        />
      </header>
      <div className="">
        <section className="p-2 text-sm min-h-screen flex flex-row flex-wrap items-stretch justify-items-stretch bg-gray-300 space-x-1">
        {graphs}
        </section>
      </div>
    </main>
  );
}
