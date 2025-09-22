import { useState } from 'react'
import '../layouts/bar.css'
function Bar() {
  return (
    <div className='bar'>
        <nav className='Nav-bar'>
          <div className='Nav-bar-content'>
              <div className='Nav-logo-to-invert'>
                <a>P.I.T.E.R</a>
              </div>

              <div className='Nav-itens'>
                <a href='https://unb-mds.github.io/Projeto-P.I.T.E.R/'>Sobre Nós</a>
              </div>
          </div>
        </nav>
    </div>
  )
}

export default Bar;
