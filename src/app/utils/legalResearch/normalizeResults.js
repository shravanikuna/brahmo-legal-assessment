function normalizeIndianKanoonResults(data) {
    return data.docs.map(doc => ({
        id: doc.tid,
        title: doc.title,
        court: doc.docsource,
        date: doc.publishdate,
        citations: doc.numcites,
        headline: cleanHTML(doc.headline),
        score: calculateCaseScore(doc)
    }));
}