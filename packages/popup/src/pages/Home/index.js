const HomePage = () => {
  return (
    <div className="App">
      <header className="App-header">
        <button onClick={() => open(location.href)}>open</button>
        <p className="p-9">
          Edit <code>src/App.js</code> and save to reload.
        </p>
      </header>
    </div>
  )
}

export default HomePage
