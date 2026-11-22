
import { useState } from 'react'
import './App.css'

function App() {
  const [file, setFile] = useState(null)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleFileChange(event) {
    const selectedFile = event.target.files[0]

    if (selectedFile) {
      setFile(selectedFile)
      setResults(null)
      setError('')
    }
  }

  async function handleAnalyze() {
    if (!file) return

    setLoading(true)
    setError('')
    setResults(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('http://127.0.0.1:8000/analyze', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Unable to analyze this file.')
      }

      setResults(data)
    } catch (err) {
      setError(err.message || 'Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function formatNumber(value) {
    return Number(value).toLocaleString('en-US')
  }

  const maxRevenue = results
    ? Math.max(...results.revenue_by_product.map(item => item.Total), 1)
    : 1

  const sortedProducts = results
    ? [...results.revenue_by_product].sort(
        (a, b) => b.Total - a.Total
      )
    : []

  return (
    <div className="app-layout">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="brand">
          <div className="brand-logo">S</div>

          <div className="brand-info">
            <h2>SmartExcel</h2>
            <span>DATA ANALYSIS</span>
          </div>
        </div>

        <div className="sidebar-label">MENU</div>

        <nav className="sidebar-nav">
          <a href="#dashboard" className="nav-item active">
            <span>▦</span>
            Dashboard
          </a>

          <a href="#upload" className="nav-item">
            <span>⇧</span>
            Upload Data
          </a>

          <a href="#analytics" className="nav-item">
            <span>◫</span>
            Analytics
          </a>

          <a href="#reports" className="nav-item">
            <span>▤</span>
            Reports
          </a>
        </nav>

      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content" id="dashboard">

        {/* HEADER */}
        <header className="topbar">

          <div>
            <div className="breadcrumb">
              Dashboard / Overview
            </div>

            <h1>Dashboard</h1>

            <p className="page-subtitle">
              Analyze and organize your Excel data.
            </p>
          </div>

          <div className="connection-status">
            <span className="online-dot"></span>
            Backend connected
          </div>

        </header>

        {/* HERO */}
        <section className="hero">

          <div className="hero-content">

            <span className="hero-tag">
              EXCEL DATA ANALYSIS
            </span>

            <h2>
              Analyze your data.
              <br />
              Understand your results.
            </h2>

            <p>
              Upload your spreadsheet to clean data,
              calculate sales and generate clear summaries.
            </p>

            <a href="#upload" className="hero-button">
              Upload a file
              <span>→</span>
            </a>

          </div>

          <div className="hero-decoration">

            <div className="hero-circle circle-one"></div>
            <div className="hero-circle circle-two"></div>

            <div className="hero-chart">

              <div className="hero-chart-title">
                Data overview
              </div>

              <div className="mini-bars">
                <span style={{ height: '35%' }}></span>
                <span style={{ height: '55%' }}></span>
                <span style={{ height: '45%' }}></span>
                <span style={{ height: '80%' }}></span>
                <span style={{ height: '65%' }}></span>
                <span style={{ height: '100%' }}></span>
              </div>

              <div className="hero-chart-footer">
                <span>Performance</span>
                <strong>Analysis</strong>
              </div>

            </div>
          </div>

        </section>

        {/* UPLOAD SECTION */}
        <section className="section upload-section" id="upload">

          <div className="section-heading">

            <div>
              <h2>Upload your data</h2>
              <p>
                Select an Excel file to start your analysis.
              </p>
            </div>

            <span className="format-label">
              XLSX / XLS
            </span>

          </div>

          <div className="upload-panel">

            <label className="upload-zone">

              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
              />

              <div className="upload-symbol">
                ↑
              </div>

              <h3>Choose an Excel file</h3>

              <p>
                Click to <strong>browse files</strong>
              </p>

              <small>
                Supported formats: .xlsx and .xls
              </small>

            </label>

            {file && (

              <div className="selected-file">

                <div className="excel-icon">
                  XLS
                </div>

                <div className="selected-file-info">
                  <strong>{file.name}</strong>
                  <span>
                    {(file.size / 1024).toFixed(2)} KB
                  </span>
                </div>

                <button
                  className="remove-button"
                  onClick={() => {
                    setFile(null)
                    setResults(null)
                    setError('')
                  }}
                >
                  Remove
                </button>

              </div>

            )}

            <div className="upload-footer">

              <span>
                <span className="secure-icon">✓</span>
                File processed by the local backend.
              </span>

              <button
                className="analyze-button"
                disabled={!file || loading}
                onClick={handleAnalyze}
              >
                {loading ? 'Analyzing...' : 'Analyze data'}

                {!loading && <span>→</span>}
              </button>

            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

          </div>

        </section>

        {/* ANALYSIS RESULTS */}
        {results && (

          <section
            className="section results-section"
            id="analytics"
          >

            <div className="section-heading">

              <div>
                <h2>Analysis results</h2>
                <p>
                  Results for {results.filename}
                </p>
              </div>

              <span className="success-label">
                <span></span>
                Completed
              </span>

            </div>

            {/* KPI CARDS */}
            <div className="stats-grid">

              <div className="stat-card">
                <div className="stat-top">
                  <span>Total revenue</span>
                  <div className="stat-icon blue-icon">↗</div>
                </div>

                <h3>
                  {formatNumber(results.total_sales)}
                  <small> DT</small>
                </h3>

                <p>Calculated sales revenue</p>
              </div>

              <div className="stat-card">
                <div className="stat-top">
                  <span>Total records</span>
                  <div className="stat-icon purple-icon">▤</div>
                </div>

                <h3>{formatNumber(results.total_rows)}</h3>

                <p>Processed rows</p>
              </div>

              <div className="stat-card">
                <div className="stat-top">
                  <span>Missing values</span>
                  <div className="stat-icon orange-icon">!</div>
                </div>

                <h3>{formatNumber(results.missing_values)}</h3>

                <p>Missing data detected</p>
              </div>

              <div className="stat-card">
                <div className="stat-top">
                  <span>Duplicate rows</span>
                  <div className="stat-icon green-icon">✓</div>
                </div>

                <h3>{formatNumber(results.duplicate_rows)}</h3>

                <p>Duplicate records detected</p>
              </div>

            </div>

            {/* BEST PRODUCT */}
            <div className="best-product">

              <div className="best-product-icon">
                ★
              </div>

              <div>
                <span>BEST-SELLING PRODUCT</span>
                <h3>{results.best_product}</h3>
              </div>

              <div className="best-product-note">
                Based on quantity sold
              </div>

            </div>

            {/* CHART AND TABLE */}
            <div className="analytics-grid">

              <div className="panel chart-panel">

                <div className="panel-heading">
                  <div>
                    <h3>Revenue by product</h3>
                    <p>Revenue distribution</p>
                  </div>

                  <span className="chart-label">
                    DT
                  </span>
                </div>

                <div className="bar-chart">

                  {sortedProducts.map(item => (

                    <div
                      className="bar-row"
                      key={item.Product}
                    >

                      <div className="bar-info">
                        <span>{item.Product}</span>
                        <strong>
                          {formatNumber(item.Total)}
                        </strong>
                      </div>

                      <div className="bar-track">
                        <div
                          className="bar-fill"
                          style={{
                            width: `${(item.Total / maxRevenue) * 100}%`
                          }}
                        ></div>
                      </div>

                    </div>

                  ))}

                </div>

              </div>

              <div className="panel table-panel" id="reports">

                <div className="panel-heading">
                  <div>
                    <h3>Product summary</h3>
                    <p>Revenue details</p>
                  </div>
                </div>

                <div className="table-wrapper">

                  <table className="results-table">

                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Revenue</th>
                      </tr>
                    </thead>

                    <tbody>

                      {sortedProducts.map(item => (

                        <tr key={item.Product}>
                          <td>{item.Product}</td>
                          <td>
                            {formatNumber(item.Total)} DT
                          </td>
                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>

              </div>

            </div>

          </section>

        )}

        {/* FEATURES */}
        <section className="section features-section">

          <div className="section-heading">
            <div>
              <h2>Platform features</h2>
              <p>
                Tools for organizing and analyzing spreadsheet data.
              </p>
            </div>
          </div>

          <div className="features-grid">

            <div className="feature-card">
              <div className="feature-icon blue-icon">
                ▤
              </div>

              <h3>Data cleaning</h3>

              <p>
                Identify missing values and duplicated records
                in your spreadsheets.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon green-icon">
                ↗
              </div>

              <h3>Data analysis</h3>

              <p>
                Calculate sales and identify
                best-performing products.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon purple-icon">
                ▥
              </div>

              <h3>Visual reports</h3>

              <p>
                Explore results through organized tables
                and visual charts.
              </p>
            </div>

          </div>

        </section>

        {/* FOOTER */}
        <footer className="footer">
          <span>© 2026 SmartExcel</span>
          <span>Excel Data Analysis Platform</span>
        </footer>

      </main>
    </div>
  )
}

export default App
