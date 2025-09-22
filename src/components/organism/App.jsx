import { useState } from 'react'
import '../layouts/App.css'
import Bar from '../atoms/bar.jsx'
import Corpo from '../atoms/corpo.jsx'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className='App'>
      <header>
        <Bar />
      </header>

      <main>
        <Corpo />
      </main>
    </div>
  )
}

export default App
