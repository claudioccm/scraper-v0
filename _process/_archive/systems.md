# Systems

## Confidence System

The Ai system will score it's confidence on how well it was able to scrape the data from that
specific url, and log which scraping processes it tried to use to get to this initial result.

## Automatic check for low confidence cards

Once all the cards are generated from that batch, the Ai System will analyse the low confidence
cards, and try to re-scrape the links using different methods from the ones tried.

## Scraping Ladder

We want to have a ladder of scraping systems available for the cards. We need rank them by cost,
time, and effort, to optimize the cost and speed to generate these cards.

## Check for Duplicates

We want the system to keep a log of all the URLs ever scraped, so if an Analyst pastes a duplicate
URL, the system will inform the user if that URL was already scraped, and if it was archived, is in
the "save for later" list, or was published on a given newsletter.

## Newsletter Export

We want the system to write the short paragraphs for each item in the newsletter (cards), and an
intro that quickly introduces the most important item(s) of the newsletter. The system will then
show the full text and links for the newsletter for manager to review. (Secondary) Once that is
approved, it will generate the posts in Directus via the API.
