import { useEffect, useState } from "react";
import Chart from "chart.js/auto";

interface Article {
  article_id: string;
  lead: string;
  headline: string;
  keywords: string[];
  // Add other properties as needed
}

function countKeywordOccurrences(keywordArrays: string[][]): {
  [key: string]: number;
} {
  const keywordCounts: { [key: string]: number } = {};

  for (let i = 0; i < keywordArrays.length; i++) {
    const keywordArray = keywordArrays[i];

    if (keywordArray) {
      for (let j = 0; j < keywordArray.length; j++) {
        const keyword = keywordArray[j];

        if (keyword !== undefined) {
          if (keyword in keywordCounts) {
            keywordCounts[keyword]++;
          } else {
            keywordCounts[keyword] = 1;
          }
        }
      }
    }
  }

  return keywordCounts;
}

// function countKeywordOccurrences(keywordArrays: string[][]): {
//   [key: string]: number;
// } {
//   const keywordCounts: { [key: string]: number } = {};

//   keywordArrays.forEach((keywordArray) => {
//     keywordArray.forEach((keyword) => {
//       if (keyword in keywordCounts) {
//         keywordCounts[keyword]++;
//       } else {
//         keywordCounts[keyword] = 1;
//       }
//     });
//   });

//   const keywordEntries = Object.entries(keywordCounts);
//   const sortedKeywordEntries = keywordEntries.sort((a, b) => b[1] - a[1]);
//   const sortedKeywordCounts = Object.fromEntries(sortedKeywordEntries);

//   return sortedKeywordCounts;
// }

function findArticleObjects(data: any[]): Article[] {
  const foundObjects: Article[] = [];

  function searchObjects(obj: any) {
    if (typeof obj === "object" && obj !== null) {
      // Check if the object has the required properties
      if (
        "type" in obj &&
        obj.type === "article" &&
        "content" in obj &&
        "article" in obj
      ) {
        foundObjects.push(obj.article);
      }

      // Recursively search through nested structures
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          searchObjects(obj[key]);
        }
      }
    }
  }

  // Start searching from the top-level array
  data.forEach(searchObjects);

  return foundObjects;
}

function App(): JSX.Element {
  const [articles, setArticles] = useState<Article[]>([]);
  const [keywordCounts, setKeywordCounts] = useState<{
    [key: string]: number;
  } | null>(null);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        const response = await fetch(
          "https://api.il.fi/v3/frontpages/etusivu?add_alma_embeds=true&algorithm=f1&segment=4&add_third_plus_container=true&front_version_id=8169c62c-3e38-471c-abee-e715483aeded&user_id=f23acfa9-dfda-4333-b735-90896c9f52ee"
        );

        const data = await response.json();
        const tmp = await findArticleObjects(data.response);
        const keywords = tmp.map((x) => x?.keywords && x?.keywords);
        const counts = countKeywordOccurrences(keywords);

        console.log(counts);
        // for (const count in counts) {
        //   console.log(Object.keys(count));
        // }

        setKeywordCounts(counts);
        createChart(counts);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  function createChart(keywordCounts: { [key: string]: number }): void {
    // Sort the keywords based on their counts in descending order
    const sortedKeywords = Object.keys(keywordCounts).sort(
      (a, b) => keywordCounts[b] - keywordCounts[a]
    );

    // Get the top 25 keywords and their counts
    const topKeywords = sortedKeywords.slice(1, 26);
    const counts = topKeywords.map((keyword) => keywordCounts[keyword]);

    const ctx = document.getElementById(
      "keywordChart"
    ) as HTMLCanvasElement | null;
    if (!ctx) {
      console.error("Canvas element not found");
      return;
    }

    new Chart(ctx, {
      type: "bar",
      data: {
        labels: topKeywords,
        datasets: [
          {
            label: "Keyword Counts",
            data: counts,
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  return (
    <div
      className="App"
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <h1>Keyword Chart</h1>
      <canvas id="keywordChart" width="400" height="400"></canvas>
    </div>
  );
}

export default App;
