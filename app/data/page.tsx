import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

const PATH_ROOT="https://storage.googleapis.com/sps-btn-data-all-data/raw/sps/budget";

const FILES = [
  "2002-2003-operating-budget.pdf",
  "2003-2004-capital-budget.pdf",
  "2003-2004-operating-budget.pdf",
  "2004-2005-operating-budget.pdf",
  "2005-2006-operating-budget.pdf",
  "2006-2007-operating-budget.pdf",
  "2007-2008-capital-budget.pdf",
  "2007-2008-operating-budget.pdf",
  "2008-2009-capital-budget.pdf",
  "2008-2009-operating-budget.pdf",
  "2009-2010-capital-budget.pdf",
  "2009-2010-operating-budget.pdf",
  "2010-2011-budget-book.pdf",
  "2011-2012-budget-book.pdf",
  "2012-2013-budget-book.pdf",
  "2012-2013-budgetdata.xlsx",
  "2013-2014-budget-book.pdf",
  "2013-2014-budgetdata.xlsx",
  "2014-2015-adopted-budget.pdf",
  "2014-2015-purple-book.pdf",
  "2015-2016-budget-book.pdf",
  "2015-2016-purple-book.pdf",
  "2016-2017-adopted-budget.pdf",
  "2016-2017-budget-f195-format.pdf",
  "2016-2017-legislative-to-district-classsize-crosswalk.pdf",
  "2016-2017-purple-book.pdf",
  "2017-2018-budget-book.pdf",
  "2017-2018-purple-book.pdf",
  "2018-2019-adopted-budget.pdf",
  "2018-2019-purple-book.pdf",
  "2019-2020-adopted-budget.pdf",
  "2019-2020-equity-tier-calculation-for-2020-2021-budget.pdf",
  "2019-2020-purple-book.pdf",
  "2019-2020-wss-model.pdf",
  "2020-2021-adopted-budget.pdf",
  "2020-2021-purple-book.pdf",
  "2020-2021-wss-model.pdf",
  "2021-2022-adopted-budget.pdf",
  "2022-2023-adopted-budget.pdf",
  "2023-2024-adopted-budget.pdf",
  "2023-2024-adopted-budget.txt",
  "2024-2025-purple-book.pdf",
  "2024-2025-recommended-budget.pdf",
  "2025-2026-purple-book-2-26.pdf",
];

function BudgetBookList() {
  const children = new Array<React.ReactNode>;
  for (const f of FILES) {
    children.push(
      <li><Link key={f} href={`${PATH_ROOT}/${f}`}>{f}</Link></li>
    );
  }

  return (
    <ul>
      {children}
    </ul>
  );
}

export default function Page() {
  return (
    <Container
      maxWidth="lg"
      component="main"
      sx={{ display: 'flex', flexDirection: 'column', my: 2, gap: 4 }}
    >
      <Typography component="h1" variant="h2">Data Archive</Typography>
      <Stack>
      <Typography component="h4" variant="h4">Budget Books since 2019 and lots of Purple Books</Typography>
        <BudgetBookList />

      <Typography component="h4" variant="h4">How to find these docs</Typography>
      <p>
      These documents were scraped off of archive.org. The trick is the URL for the budget changes over the years.
      </p>
      <ul>
        <li>
          from 2019-now, the budgets were posted at https://www.seattleschools.org/departments/finance/budget/.
        </li>
        <li>
          from 2016-2018, the budget was at http://seattleschools.org/cms/One.aspx?portalId=627&pageId=4236325
        </li>
        <li>
          for 2015, the budget was at.  http://sps.ss8.sharpschool.com/cms/one.aspx?portalId=627&pageId=14984
        </li>
        <li>
          2014-2015 is a broken link for part of the crawl. Look at different months until you find it.
        </li>
        <li>
          from 2007-2014 the budget is all findable at
          http://seattleschools.org/modules/cms/pages.phtml?sessionid=&pageid=225568
        </li>
        <li>
          for 2004-2005, the budget is at
          There is no purple book. The have a "blue book" instead with one PDF per
          school:

          https://web.archive.org/web/20051003213015/http://www.seattleschools.org/area/finance/navsubs.nav?index=5
        </li>
        <li>
          for 2002-2003 the budget is at

          http://www.seattleschools.org/area/finance/budget/index.html
        </li>
      </ul>
      </Stack>
    </Container>
  );
}
