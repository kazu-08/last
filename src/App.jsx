import React, { useState } from 'react';
import axios from 'axios';

const App = () => {
  const [stations, setStations] = useState([]); // 入力された駅名
  const [input, setInput] = useState(""); // ユーザーの入力
  const [results, setResults] = useState([]); // 中間地点付近の駅
  const [error, setError] = useState(""); // エラーメッセージ

  // 駅をリストに追加
  const addStation = async () => {
    if (!input.trim()) return;
    try {
      const response = await axios.get(
        `https://express.heartrails.com/api/json?method=getStations&name=${input}`
      );
      const stationData = response.data.response.station;
      if (stationData && stationData.length > 0) {
        setStations([...stations, stationData[0]]);
        setInput("");
        setError("");
      } else {
        setError("駅が見つかりませんでした");
      }
    } catch (err) {
      console.error(err);
      setError("データ取得中にエラーが発生しました");
    }
  };

  // 中間地点を計算
  const findMidpoints = async () => {
    if (stations.length < 2) {
      setError("少なくとも2つの駅を追加してください");
      return;
    }
    setError("");

    // 中間地点を計算
    const midpoint = calculateMidpoint(
      stations.map((station) => ({
        lat: parseFloat(station.y),
        lng: parseFloat(station.x),
      }))
    );

    try {
      const response = await axios.get(
        `https://express.heartrails.com/api/json?method=getStations&x=${midpoint.lng}&y=${midpoint.lat}`
      );
      const nearbyStations = response.data.response.station;
      if (nearbyStations && nearbyStations.length > 0) {
        setResults(nearbyStations);
      } else {
        setError("中間地点付近の駅が見つかりませんでした");
      }
    } catch (err) {
      console.error(err);
      setError("データ取得中にエラーが発生しました");
    }
  };

  // 中間地点の計算ロジック
  const calculateMidpoint = (locations) => {
    const latSum = locations.reduce((sum, loc) => sum + loc.lat, 0);
    const lngSum = locations.reduce((sum, loc) => sum + loc.lng, 0);
    return {
      lat: latSum / locations.length,
      lng: lngSum / locations.length,
    };
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>中間地点の駅検索</h1>
      <div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="駅名を入力"
        />
        <button onClick={addStation}>追加</button>
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {stations.map((station, index) => (
          <li key={index}>
            {station.name} ({station.line}線)
          </li>
        ))}
      </ul>
      <button onClick={findMidpoints} disabled={stations.length < 2}>
        中間地点を検索
      </button>
      <div>
        <h2>結果</h2>
        <ul>
          {results.map((station, index) => (
            <li key={index}>
              {station.name} ({station.line}線)
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;
