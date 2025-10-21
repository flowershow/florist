# FlowerPress 🌸

A **Substack/Notion-style cloud editor for markdown-based [data-rich documents](https://datarichdocs.com/) and datasets** compatible with [Flowershow.app](https://flowershow.app).

* Primary focus: making it effortless to curate and publish datasets and associated commentary.
* Medium-term vision: a **general-purpose editor for markdown-based rich documents**, which can include datasets, tables, charts, and other content.

### 📺 Watch this first https://youtu.be/YE6VP7srXk4

### Core UX Principles

* **Markdown-first**: every page is persisted as a markdown file.
* **Seamless media handling**:
  * Drop in an image → stored as a separate file → embedded in the markdown.
  * Drop in a CSV/Excel file → stored separately → embedded as a live preview (table/graph).
  * Drop in links or screenshots → directly embedded.
* **Canvas experience**: Notion-like block editor, but output is markdown \+ linked assets.
* **Zero-friction workflow**: as simple as GitHub README \+ Issues, but with Substack-level smoothness.

## Document/Data Structure

* **One markdown document (the “readme”)** per dataset or data-rich page.
* **Associated assets**:
  * Images → stored alongside, referenced in markdown.
  * Data files (CSV, JSON, Excel, etc.) → stored alongside, embedded in markdown via preview.
* **Backend structure**:

```
dataset-name/
  README.md
  data.csv
  chart.png
  screenshot.jpg
```

* **Frontend rendering**: previews, charts, and tables auto-generated for embeds, while markdown provides narrative/context.

# References & Inspirations

* [**DataHub.io**](http://DataHub.io) **/ Evidence.dev etc** → markdown-driven data storytelling, embedding SQL \+ charts.
* **ObservableHQ.com** → interactive data notebooks, rich embedding of visualizations.
* **Substack** → frictionless publishing flow for blogs/newsletters.
* **Notion / BlockNote / TipTap** → block-based editors with markdown persistence.

---

# Appendix: Value Proposition for Data Publishing

## 1. Problem

Publishing datasets today is either:

* **Clunky**: GitHub repos/Issues → powerful but slow, not optimized for quick narrative \+ dataset publishing.
* **Closed**: Platforms like Statista or ObservableHQ lock content into proprietary silos.
* **Fragile**: Datasets disappear (URL rot, companies acquired/pivot, etc.).

**Need**: A *fast, markdown-native way* to curate and publish data-rich documents that combine narrative (markdown), data (CSV), and visuals (images/tables).

## 2. Solution

“Flowerpress” provides a **Substack/Notion-style editor** that outputs **markdown + linked assets**, making it effortless to:

* Write a **narrative (markdown README)**.
* Drop in **images → auto-upload \+ embed**.
* Drop in **CSV files → auto-upload \+ embed preview as a table (and later charts)**.
* Publish instantly, with elegant SEO-friendly output (via DataHub or Flowershow)

## DataHub.io and Flowershow: how FlowerPress fits into the existing ecosystem

Already have a markdown-based data / content publishing platform (DataHub.io and Flowershow) but lack an editor to easily create the markdown-based documents / repos that get published there.

* Want to make it easier for (me and team) to **curate and publish datasets quickly and informally**, with the ability to refine/improve over time.
  * 🚩 Right now I end up dumping things in github issues because it is quick and dirty.
* Flowershow already provides a markdown-based publishing pipeline that drives [DataHub.io](http://DataHub.io)
* Flowerpress is the complementary **editor** that streamline dataset publishing.
