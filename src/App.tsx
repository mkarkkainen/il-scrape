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

  keywordArrays.forEach((keywordArray) => {
    keywordArray?.forEach((keyword) => {
      if (keyword !== undefined) {
        keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
      }
    });
  });

  return keywordCounts;
}

function findArticleObjects(data: any[]): Article[] {
  const foundObjects: Article[] = [];

  function searchObjects(obj: any) {
    if (typeof obj === "object" && obj !== null) {
      if (
        "type" in obj &&
        obj.type === "article" &&
        "content" in obj &&
        "article" in obj
      ) {
        foundObjects.push(obj.article);
      }

      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          searchObjects(obj[key]);
        }
      }
    }
  }

  data.forEach(searchObjects);

  return foundObjects;
}

function App(): JSX.Element {
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
        const tmp = findArticleObjects(data.response);
        const keywords = tmp.flatMap((x) => x?.keywords || []);
        const counts = countKeywordOccurrences([keywords]);

        console.log(counts);

        if (!areKeywordCountsEqual(counts, keywordCounts)) {
          setKeywordCounts(counts);
          createChart(counts);
        } else {
          console.log("Data has not changed.");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();

    const intervalId = setInterval(fetchData, 120 * 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [keywordCounts]);

  function createChart(keywordCounts: { [key: string]: number }): void {
    // ... (your existing chart creation logic)
  }

  function areKeywordCountsEqual(
    counts1: { [key: string]: number },
    counts2: { [key: string]: number } | null
  ): boolean {
    if (counts2 === null) {
      return false;
    }

    const keys1 = Object.keys(counts1);
    const keys2 = Object.keys(counts2);

    if (keys1.length !== keys2.length) {
      return false;
    }

    for (const key of keys1) {
      if (counts1[key] !== counts2[key]) {
        return false;
      }
    }

    return true;
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
