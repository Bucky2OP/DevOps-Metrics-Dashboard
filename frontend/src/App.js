import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = {
  primary: "#00d4ff",
  secondary: "#7c3aed",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  bg: "#0f172a",
  card: "#1e293b",
  border: "#334155",
  text: "#e2e8f0",
  textMuted: "#94a3b8",
};

function App() {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({});
  const [timeSeriesData, setTimeSeriesData] = useState({});

  const fetchMetrics = () => {
    fetch("http://localhost:8080/metrics")
      .then((r) => r.json())
      .then((data) => {
        setMetrics(data || []);
        const grouped = {};
        (data || []).forEach((m) => {
          if (!grouped[m.name]) {
            grouped[m.name] = { sum: 0, count: 0, values: [] };
          }
          grouped[m.name].sum += m.value;
          grouped[m.name].count += 1;
          grouped[m.name].values.push(m.value);
        });
        const sum = {};
        Object.keys(grouped).forEach((key) => {
          const vals = grouped[key].values;
          sum[key] = {
            avg: (grouped[key].sum / grouped[key].count).toFixed(2),
            min: Math.min(...vals).toFixed(2),
            max: Math.max(...vals).toFixed(2),
            count: grouped[key].count,
          };
        });
        setSummary(sum);
        const timeSeries = {};
        (data || [])
          .slice(0, 50)
          .reverse()
          .forEach((m) => {
            if (!timeSeries[m.name]) {
              timeSeries[m.name] = [];
            }
            timeSeries[m.name].push({
              time: new Date(m.when).toLocaleTimeString(),
              value: parseFloat(m.value.toFixed(2)),
            });
          });
        setTimeSeriesData(timeSeries);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const emitDemo = () => {
    fetch("http://localhost:8080/emit_demo").then(() => {
      setTimeout(fetchMetrics, 500);
    });
  };

  const getMetricColor = (name) => {
    if (name.includes("error") || name.includes("failure")) return COLORS.danger;
    if (name.includes("success") || name.includes("coverage")) return COLORS.success;
    if (name.includes("deployment") || name.includes("build")) return COLORS.warning;
    return COLORS.primary;
  };

  const getMetricIcon = (name) => {
    if (name.includes("deployment")) return "🚀";
    if (name.includes("build")) return "🔨";
    if (name.includes("test")) return "✅";
    if (name.includes("error") || name.includes("failure")) return "❌";
    if (name.includes("cpu")) return "💻";
    if (name.includes("memory")) return "🧠";
    if (name.includes("network")) return "🌐";
    if (name.includes("api")) return "⚡";
    return "📊";
  };

  if (loading) {
    const loadingStyle = {
      padding: 40,
      background: COLORS.bg,
      minHeight: "100vh",
      color: COLORS.text,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    };
    return (
      <div style={loadingStyle}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 60, height: 60,
            border: `4px solid ${COLORS.border}`,
            borderTop: `4px solid ${COLORS.primary}`,
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 20px",
          }} />
          <h2>Loading metrics...</h2>
          <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
        </div>
      </div>
    );
  }

  const doraMetrics = Object.keys(summary).filter(
    (k) => k.includes("deployment") || k.includes("lead.time") || k.includes("failure") || k.includes("mttr")
  );
  const pipelineMetrics = Object.keys(summary).filter(
    (k) => k.includes("build") || k.includes("test") || k.includes("code.churn")
  );
  const infraMetrics = Object.keys(summary).filter(
    (k) => k.includes("cpu") || k.includes("memory") || k.includes("disk") || k.includes("network")
  );
  const appMetrics = Object.keys(summary).filter(
    (k) => k.includes("api") || k.includes("request") || k.includes("error") || k.includes("db")
  );

  return (
    <div style={{
      background: COLORS.bg,
      minHeight: "100vh",
      color: COLORS.text,
      padding: 30,
      fontFamily: "system-ui, -apple-system, sans-serif",
    }}>
      <div style={{
        background: `linear-gradient(135deg, ${COLORS.secondary} 0%, ${COLORS.primary} 100%)`,
        padding: 30,
        borderRadius: 16,
        marginBottom: 30,
        boxShadow: "0 8px 32px rgba(0, 212, 255, 0.2)",
      }}>
        <h1 style={{ margin: "0 0 10px 0", fontSize: 36 }}>🚀 DevOps Metrics Dashboard</h1>
        <p style={{ margin: 0, opacity: 0.9, fontSize: 16 }}>
          Real-time monitoring of DORA metrics, pipeline performance, and infrastructure health
        </p>
        <div style={{ marginTop: 20 }}>
          <button onClick={emitDemo} style={{
            padding: "12px 24px", fontSize: 16, cursor: "pointer",
            background: "rgba(255,255,255,0.2)", color: "white",
            border: "2px solid rgba(255,255,255,0.3)", borderRadius: 8,
            fontWeight: "bold", marginRight: 10,
          }}>Generate Demo Metrics</button>
          <button onClick={fetchMetrics} style={{
            padding: "12px 24px", fontSize: 16, cursor: "pointer",
            background: "transparent", color: "white",
            border: "2px solid rgba(255,255,255,0.3)", borderRadius: 8,
            fontWeight: "bold",
          }}>🔄 Refresh</button>
        </div>
      </div>

      <h2 style={{ marginBottom: 20, color: COLORS.primary }}>📈 DORA Metrics</h2>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: 20, marginBottom: 40,
      }}>
        {doraMetrics.map((name) => (
          <div key={name} style={{
            background: COLORS.card, padding: 20, borderRadius: 12,
            border: `1px solid ${COLORS.border}`,
            boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 28 }}>{getMetricIcon(name)}</span>
              <h3 style={{ margin: 0, fontSize: 14, color: COLORS.textMuted, textTransform: "uppercase" }}>
                {name.replace(/\./g, " ")}
              </h3>
            </div>
            <div style={{ fontSize: 32, fontWeight: "bold", margin: "10px 0", color: getMetricColor(name) }}>
              {summary[name].avg}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, fontSize: 12, color: COLORS.textMuted }}>
              <div><strong>Min:</strong> {summary[name].min}</div>
              <div><strong>Max:</strong> {summary[name].max}</div>
              <div><strong>Count:</strong> {summary[name].count}</div>
            </div>
          </div>
        ))}
      </div>

      <h2 style={{ marginBottom: 20, color: COLORS.warning }}>🔨 CI/CD Pipeline Metrics</h2>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: 20, marginBottom: 40,
      }}>
        {pipelineMetrics.map((name) => (
          <div key={name} style={{
            background: COLORS.card, padding: 20, borderRadius: 12,
            border: `1px solid ${COLORS.border}`,
            boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 28 }}>{getMetricIcon(name)}</span>
              <h3 style={{ margin: 0, fontSize: 14, color: COLORS.textMuted, textTransform: "uppercase" }}>
                {name.replace(/\./g, " ")}
              </h3>
            </div>
            <div style={{ fontSize: 32, fontWeight: "bold", margin: "10px 0", color: getMetricColor(name) }}>
              {summary[name].avg}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, fontSize: 12, color: COLORS.textMuted }}>
              <div><strong>Min:</strong> {summary[name].min}</div>
              <div><strong>Max:</strong> {summary[name].max}</div>
              <div><strong>Count:</strong> {summary[name].count}</div>
            </div>
          </div>
        ))}
      </div>

      <h2 style={{ marginBottom: 20, color: COLORS.success }}>📊 Performance Trends</h2>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(500px, 1fr))",
        gap: 20, marginBottom: 40,
      }}>
        {timeSeriesData["api.response_time"] && (
          <div style={{ background: COLORS.card, padding: 20, borderRadius: 12, border: `1px solid ${COLORS.border}` }}>
            <h3 style={{ marginTop: 0, color: COLORS.textMuted }}>⚡ API Response Time</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={timeSeriesData["api.response_time"]}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                <XAxis dataKey="time" stroke={COLORS.textMuted} />
                <YAxis stroke={COLORS.textMuted} />
                <Tooltip contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }} />
                <Line type="monotone" dataKey="value" stroke={COLORS.primary} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {timeSeriesData["cpu.usage"] && (
          <div style={{ background: COLORS.card, padding: 20, borderRadius: 12, border: `1px solid ${COLORS.border}` }}>
            <h3 style={{ marginTop: 0, color: COLORS.textMuted }}>💻 CPU Usage</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={timeSeriesData["cpu.usage"]}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                <XAxis dataKey="time" stroke={COLORS.textMuted} />
                <YAxis stroke={COLORS.textMuted} />
                <Tooltip contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }} />
                <Line type="monotone" dataKey="value" stroke={COLORS.warning} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {timeSeriesData["deployment.frequency"] && (
          <div style={{ background: COLORS.card, padding: 20, borderRadius: 12, border: `1px solid ${COLORS.border}` }}>
            <h3 style={{ marginTop: 0, color: COLORS.textMuted }}>🚀 Deployment Frequency</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={timeSeriesData["deployment.frequency"]}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                <XAxis dataKey="time" stroke={COLORS.textMuted} />
                <YAxis stroke={COLORS.textMuted} />
                <Tooltip contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }} />
                <Bar dataKey="value" fill={COLORS.success} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {timeSeriesData["error.rate"] && (
          <div style={{ background: COLORS.card, padding: 20, borderRadius: 12, border: `1px solid ${COLORS.border}` }}>
            <h3 style={{ marginTop: 0, color: COLORS.textMuted }}>❌ Error Rate</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={timeSeriesData["error.rate"]}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                <XAxis dataKey="time" stroke={COLORS.textMuted} />
                <YAxis stroke={COLORS.textMuted} />
                <Tooltip contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }} />
                <Line type="monotone" dataKey="value" stroke={COLORS.danger} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30 }}>
        <div>
          <h2 style={{ marginBottom: 20, color: COLORS.secondary }}>🖥️ Infrastructure</h2>
          <div style={{ display: "grid", gap: 15 }}>
            {infraMetrics.map((name) => (
              <div key={name} style={{
                background: COLORS.card, padding: 15, borderRadius: 8,
                border: `1px solid ${COLORS.border}`, display: "flex",
                justifyContent: "space-between", alignItems: "center",
              }}>
                <div>
                  <div style={{ fontSize: 12, color: COLORS.textMuted }}>{name.replace(/\./g, " ").toUpperCase()}</div>
                  <div style={{ fontSize: 24, fontWeight: "bold", color: getMetricColor(name) }}>{summary[name].avg}</div>
                </div>
                <span style={{ fontSize: 32 }}>{getMetricIcon(name)}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 style={{ marginBottom: 20, color: COLORS.secondary }}>⚡ Application</h2>
          <div style={{ display: "grid", gap: 15 }}>
            {appMetrics.map((name) => (
              <div key={name} style={{
                background: COLORS.card, padding: 15, borderRadius: 8,
                border: `1px solid ${COLORS.border}`, display: "flex",
                justifyContent: "space-between", alignItems: "center",
              }}>
                <div>
                  <div style={{ fontSize: 12, color: COLORS.textMuted }}>{name.replace(/\./g, " ").toUpperCase()}</div>
                  <div style={{ fontSize: 24, fontWeight: "bold", color: getMetricColor(name) }}>{summary[name].avg}</div>
                </div>
                <span style={{ fontSize: 32 }}>{getMetricIcon(name)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <h2 style={{ marginTop: 40, marginBottom: 20 }}>📋 Recent Metrics Log</h2>
      <div style={{ background: COLORS.card, borderRadius: 12, border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
        <div style={{ maxHeight: 400, overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: COLORS.border, position: "sticky", top: 0 }}>
                <th style={{ padding: 12, textAlign: "left", fontWeight: "600" }}>Metric Name</th>
                <th style={{ padding: 12, textAlign: "right", fontWeight: "600" }}>Value</th>
                <th style={{ padding: 12, textAlign: "left", fontWeight: "600" }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {metrics.slice(0, 100).map((m) => (
                <tr key={m.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                  <td style={{ padding: 12 }}>{getMetricIcon(m.name)} {m.name}</td>
                  <td style={{ padding: 12, textAlign: "right", color: getMetricColor(m.name), fontWeight: "bold" }}>
                    {m.value.toFixed(2)}
                  </td>
                  <td style={{ padding: 12, color: COLORS.textMuted }}>{new Date(m.when).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;