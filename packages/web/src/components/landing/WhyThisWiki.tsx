import '../../styles/components/why-this-wiki.css';

export function WhyThisWiki() {
  return (
    <section className="why-this-wiki">
      <div className="why-this-wiki__content">
        <div className="why-this-wiki__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="32" height="32">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="why-this-wiki__text">
          <h3 className="why-this-wiki__title">Why another wiki?</h3>
          <p className="why-this-wiki__description">
            The official <a href="https://pzwiki.net/" target="_blank" rel="noopener noreferrer" className="why-this-wiki__link">PZwiki.net</a> is
            an excellent community-grown resource and we encourage everyone to use it! This site exists because
            our Discord community of modders—both new and experienced—kept doing in-depth vanilla research that
            was being passed around informally. We decided to create a single repository for our research and
            made it public to help the wider modding community. Think of this as a focused collection of
            modding research notes, shared openly.
          </p>
        </div>
      </div>
    </section>
  );
}
