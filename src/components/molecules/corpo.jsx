// ...existing code...
import '../layouts/corpo.css'
import Linegraph from '../atoms/graficos.js'
// ...existing code...

function Corpo() {
  return (
    <div className="Corpo container">
      <section className="hero">
        <h1>P.I.T.E.R — Protótipo Interativo</h1>
        <p>Interface limpa, responsiva e focada em usabilidade. Explore a documentação ou abra o repositório no GitHub.</p>
        <h2>O gráfico ficará aqui</h2>
        
        <div className="cta-row">
          <a className="btn" href="https://unb-mds.github.io/Projeto-P.I.T.E.R/">Ver Documentação</a>
          <a className="btn secondary" href="https://github.com/unb-mds/Projeto-P.I.T.E.R">Ver no GitHub</a>
        </div>
      </section>
    </div>
  )
}

export default Corpo
// ...existing code...