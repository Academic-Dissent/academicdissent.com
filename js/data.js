// Academic Dissent — sample data and schema
// Post schema:
// {
//   slug: string,
//   title: string,
//   date: 'YYYY-MM-DD',
//   target: { title: string, authors: string, journal: string, date: string, link?: string },
//   subject: 'Monetary Policy' | 'Distributed Ledger Technology (DLT)' | 'Market Microstructure' | 'Applied Microeconomics',
//   tags: string[], // e.g., ['Endogeneity','P-Hacking']
//   claim: string, // markdown
//   dissent: string, // markdown
//   proof: string, // markdown + LaTeX + fenced code
//   conclusion: string // markdown
// }

window.AD_DATA = {
  posts: []
};
