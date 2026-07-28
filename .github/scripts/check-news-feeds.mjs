const sources = [
  {
    name: "Zenicainfo",
    url: "https://zenicainfo.ba/tag/smetovi/feed/",
    focused: true,
  },
  {
    name: "Zenit",
    url: "https://www.zenit.ba/?s=Smetovi&feed=rss2",
    focused: true,
  },
  {
    name: "072info",
    url: "https://www.072info.com/tag/smetovi/feed/",
    focused: true,
  },
  {
    name: "ZenicaBlog",
    url: "https://www.zenicablog.com/?s=Smetovi&feed=rss2",
    focused: false,
  },
  {
    name: "Grad Zenica",
    url: "https://zenica.ba/feed/",
    focused: false,
  },
  {
    name: "Klix",
    url: "https://www.klix.ba/rss",
    focused: false,
  },
];

const keywords = [
  "smetovi",
  "smetove",
  "smetovima",
  "zenica-smetovi",
  "zenica–smetovi",
  "eko kuća",
  "eko kuca",
  "restoran 960",
  "put prema smetovima",
  "izletište smetovi",
  "izletiste smetovi",
];

const maximumAgeMs = 72 * 60 * 60 * 1000;
const issueLabel = "prijedlog-novosti";
const trackerTitle = "Praćenje vijesti o Smetovima";
const notificationAddress = "info@zeforge.ba";
const token = process.env.GITHUB_TOKEN;
const repository = process.env.GITHUB_REPOSITORY;

function decodeXml(value = "") {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]*>/g, " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    )
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replace(/\s+/g, " ")
    .trim();
}

function field(item, names) {
  for (const name of names) {
    const match = item.match(
      new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, "i"),
    );
    if (match) return decodeXml(match[1]);
  }
  return "";
}

function parseFeed(xml) {
  return [...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)].map(
    ([, item]) => ({
      title: field(item, ["title"]),
      url: field(item, ["link", "guid"]),
      description: field(item, ["description", "content:encoded"]),
      publishedAt: field(item, ["pubDate", "dc:date"]),
    }),
  );
}

function isRelevant(article, focused) {
  const searchableText = `${article.title} ${article.description}`.toLocaleLowerCase(
    "bs",
  );
  const keywordMatch = keywords.some((keyword) =>
    searchableText.includes(keyword),
  );
  return keywordMatch || (focused && searchableText.includes("smetov"));
}

function isRecent(article) {
  const publishedAt = Date.parse(article.publishedAt);
  return (
    Number.isFinite(publishedAt) &&
    publishedAt <= Date.now() + 60 * 60 * 1000 &&
    Date.now() - publishedAt <= maximumAgeMs
  );
}

async function github(path, options = {}) {
  const response = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API ${response.status}: ${await response.text()}`);
  }

  return response.status === 204 ? null : response.json();
}

async function ensureLabel(owner, repo) {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/labels/${issueLabel}`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    },
  );

  if (response.status === 404) {
    await github(`/repos/${owner}/${repo}/labels`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: issueLabel,
        color: "f97316",
        description: "Automatski prijedlog članka za rubriku Novosti",
      }),
    });
    return;
  }

  if (!response.ok) {
    throw new Error(`Provjera GitHub oznake nije uspjela: ${response.status}`);
  }
}

async function sendEmailDigest(articles, trackerUrl) {
  if (articles.length === 0) return;

  const articleList = articles
    .map(
      (article, index) =>
        `${index + 1}. ${article.title}\nIzvor: ${article.source}\n${article.url}`,
    )
    .join("\n\n");
  const response = await fetch("https://busezapi.zeforge.ba/sendEmail", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      subject: `[Smetovi] ${articles.length} novih prijedloga za Novosti`,
      text: [
        `Pronađeni su novi članci povezani sa Smetovima za adresu ${notificationAddress}.`,
        "",
        articleList,
        "",
        `Pregled svih prijedloga: ${trackerUrl}`,
        "",
        "Ovo je automatska obavijest. Provjeri originalne izvore prije objave.",
      ].join("\n"),
      senderName: "Smetovi RSS monitor",
      senderContact: notificationAddress,
    }),
  });

  if (!response.ok) {
    throw new Error(`Slanje email pregleda nije uspjelo: HTTP ${response.status}`);
  }
}

async function main() {
  if (!token || !repository?.includes("/")) {
    throw new Error("Nedostaju GITHUB_TOKEN ili GITHUB_REPOSITORY.");
  }

  const [owner, repo] = repository.split("/");
  await ensureLabel(owner, repo);

  const existingIssues = await github(
    `/repos/${owner}/${repo}/issues?state=all&labels=${issueLabel}&per_page=100`,
  );
  let tracker = existingIssues.find((issue) => issue.title === trackerTitle);

  if (!tracker) {
    tracker = await github(`/repos/${owner}/${repo}/issues`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: trackerTitle,
        labels: [issueLabel],
        body: [
          "Ovaj Issue služi kao zajednički inbox za članke o Smetovima pronađene putem RSS kanala.",
          "",
          "Svaki novi prijedlog bit će dodan kao komentar. Prije objave na smetovi.ba potrebno je provjeriti originalni izvor.",
        ].join("\n"),
      }),
    });
  } else if (tracker.state === "closed") {
    tracker = await github(`/repos/${owner}/${repo}/issues/${tracker.number}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state: "open" }),
    });
  }

  const comments = await github(
    `/repos/${owner}/${repo}/issues/${tracker.number}/comments?per_page=100`,
  );
  const trackerContent = [tracker.body, ...comments.map((comment) => comment.body)]
    .filter(Boolean)
    .join("\n");
  const existingLinks = new Set(
    [...trackerContent.matchAll(/https?:\/\/[^\s)]+/g)].map(([url]) => url),
  );

  let created = 0;
  const newArticles = [];

  for (const source of sources) {
    try {
      const response = await fetch(source.url, {
        headers: { "User-Agent": "smetovi.ba news monitor" },
        signal: AbortSignal.timeout(15_000),
      });
      if (!response.ok) throw new Error(`RSS HTTP ${response.status}`);

      const articles = parseFeed(await response.text()).filter(
        (article) =>
          article.title &&
          article.url &&
          isRecent(article) &&
          isRelevant(article, source.focused),
      );

      for (const article of articles) {
        if (existingLinks.has(article.url)) continue;

        const excerpt =
          article.description.length > 500
            ? `${article.description.slice(0, 497)}...`
            : article.description;
        const body = [
          "## Nova moguća vijest",
          "",
          `- **Izvor:** ${source.name}`,
          `- **Naslov:** ${article.title}`,
          `- **Datum:** ${article.publishedAt}`,
          `- **Originalni članak:** ${article.url}`,
          "",
          "### Kratki pregled",
          "",
          excerpt || "_RSS kanal ne sadrži opis članka._",
          "",
          "---",
          "Ovaj prijedlog je automatski pronađen. Pregledaj izvor prije objave na smetovi.ba.",
        ].join("\n");

        await github(
          `/repos/${owner}/${repo}/issues/${tracker.number}/comments`,
          {
          method: "POST",
          headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ body }),
          },
        );
        existingLinks.add(article.url);
        newArticles.push({
          title: article.title,
          source: source.name,
          url: article.url,
        });
        created += 1;
      }
    } catch (error) {
      console.error(`${source.name}: ${error.message}`);
    }
  }

  await sendEmailDigest(newArticles, tracker.html_url);
  console.log(`Provjera završena. Kreirano prijedloga: ${created}.`);
}

await main();
