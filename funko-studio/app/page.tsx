import Studio from "@/components/Studio";

export default function Home() {
  return (
    <main>
      <header className="hero">
        <span className="badge">✨ Edição colecionador</span>
        <h1>
          Vire um <span className="grad">boneco colecionável</span>
        </h1>
        <p>
          Envie suas melhores fotos e nossa IA cria o seu boneco de vinil em <b>3 vistas</b>: frente, lateral e
          traseira.
        </p>
      </header>
      <Studio />
      <footer className="foot">Feito com carinho · As imagens são geradas por IA e podem variar a cada tentativa.</footer>
    </main>
  );
}
