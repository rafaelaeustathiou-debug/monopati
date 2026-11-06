export default function App() {
  return (
    <main className="page-shell">
      <section className="welcome-card" aria-labelledby="page-title">
        <div className="brand-mark" aria-hidden="true">Μ</div>
        <p className="eyebrow">MONOPATI</p>
        <h1 id="page-title">Καλώς ήρθες!</h1>
        <p className="description">
          Η προεπισκόπηση της εφαρμογής λειτουργεί. Πρόσθεσε το περιεχόμενο της
          εφαρμογής σου στα αρχεία του φακέλου <code>src</code>.
        </p>
        <div className="status"><span className="status-dot" /> Το preview είναι έτοιμο</div>
      </section>
      <footer>Φτιαγμένο με React και Vite</footer>
    </main>
  );
}
