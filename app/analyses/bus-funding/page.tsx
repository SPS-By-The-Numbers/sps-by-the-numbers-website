import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

export default function Page() {
  return (
    <Container
      maxWidth="md"
      component="main"
      sx={{ display: 'flex', flexDirection: 'column', my: 4, gap: 3 }}
    >
      <Box>
        <Typography component="h1" variant="h4" gutterBottom>
          Bus Funding in Seattle Public Schools
        </Typography>
        <Typography component="p" variant="subtitle1" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
          By Mary Ellen Russell
        </Typography>
      </Box>

      <Box
        sx={{
          backgroundColor: 'rgba(0, 0, 0, 0.04)',
          borderLeft: '4px solid',
          borderColor: 'primary.main',
          p: 2,
          borderRadius: 1,
        }}
      >
        <Typography component="p" variant="body2">
          The following was posted on the Future Of Seattle Public Schools
          Facebook group by Mary Ellen Russell as an explainer for bus
          funding. It is reproduced here with permission from the author.
        </Typography>
      </Box>

      <Typography component="p">
        Let&rsquo;s talk about bus funding. A lot of people are wondering whether
        closing schools would end up increasing transportation costs. Closing
        schools would likely result in more kids riding the bus and riding
        slightly longer distances. The following explanation of bus funding is
        info that has been shared by SPS staff with the School Traffic Safety
        Committee since 2017. A lot of it is drawn from a meeting with Linda
        Sebring in 2019 that was directly focused on bus funding mechanisms.
        The remainder is drawn from information shared by SPS&rsquo;s transportation
        director and from publicly available budget documents.{' '}
        <strong>TLDR: more students riding buses would probably be revenue
        neutral.</strong>
      </Typography>

      <Typography component="p" sx={{ fontStyle: 'italic' }}>
        *Edited to add that it&rsquo;s completely fine to share this post with the
        caveat that I&rsquo;m working from best available numbers. If SPS wants to
        share more detailed breakdowns of transportation funding I&rsquo;d be
        DELIGHTED.*
      </Typography>

      <Typography component="h2" variant="h5" sx={{ mt: 2 }}>
        General Ed Bus Funding
      </Typography>

      <Typography component="p">
        One key thing to understand is that general ed busing is reimbursed by
        OSPI separately from other funding streams and separately from special
        ed busing. OSPI takes the district&rsquo;s ridership information and actual
        bus costs and enters them into a black box formula called STARS. (For
        busing OSPI uses calendar years, not school years, making tracking
        costs extra challenging.) The formula takes into account the number of
        buses, number of schools served by buses, number of students riding
        the bus, and the distance travelled on each route. OSPI reimburses the
        district either the amount that the formula spits out or the actual
        cost that the district paid for busing, whichever is lower.
      </Typography>

      <Typography component="p">
        If SPS spends the same or less than the formula spits out then it gets
        fully reimbursed, plus an inflation adjustment. SPS can get dinged on
        reimbursement if the routes are too long or too short according to the
        formula but this doesn&rsquo;t tend to be an issue. (Many rural and suburban
        WA districts transport kids farther than is needed for routes in SPS).
        The formula also penalizes districts for running buses that aren&rsquo;t
        full, which does happen in SPS but not on many routes. Overall more
        butts in seats on gen-ed buses equals more funding &mdash; exactly enough
        additional funding to cover those costs. Fewer butts equals less
        funding. This means that if SPS buses more students after closing
        schools it likely won&rsquo;t hurt the budget (or help).
      </Typography>

      <Typography component="p">
        Another important thing to know is that SPS can get up to 100% of its
        general ed busing costs reimbursed but can never end up with extra
        money from general ed busing. Cutting service does not free up money
        to spend elsewhere. If a district cuts its general education bus
        service the state will deduct the exact amount they saved from the
        transportation. You can never get reimbursed more than your actual
        costs for general ed busing. Conversely, if a district increases how
        many students ride general ed buses the state will increase the
        reimbursement by the same amount (after adjusting for the efficiency
        metrics in the STARS formula).
      </Typography>

      <Typography component="p">
        Before the pandemic SPS released a report from Council of Great City
        Schools showing that general ed busing was very close to 100% funded.
        Since then SPS has only released top-line numbers that don&rsquo;t separate
        out gen-ed busing from special-ed and McKinney Vento, which makes it
        hard to tell if their efficiency has slipped. The STARS formula hasn&rsquo;t
        been significantly revised so the best evidence that is publicly
        available points to general ed busing still being close to 100%
        funded.
      </Typography>

      <Typography component="h2" variant="h5" sx={{ mt: 2 }}>
        Special Ed &amp; McKinney Vento Transportation Funding
      </Typography>

      <Typography component="p">
        Transportation services for Special Education and McKinney Vento are a
        different story. These services are required by federal law but
        drastically underfunded by the state.
      </Typography>

      <Typography component="p">
        McKinney Vento transportation (for students experiencing
        homelessness) has typically been completely left out of the state
        funding formula. Students experiencing homelessness are transported to
        the same school all year long regardless of where in the region they
        move in order to provide a consistent learning environment. SPS uses a
        car service called HopSkipDrive to transport these kids from locations
        all over the region where it wouldn&rsquo;t make any sense to send a yellow
        bus. Homelessness among students at SPS has ballooned over the last 20
        years and McKinney Vento transportation now costs SPS $8 million a
        year, about half of the projected transportation deficit for 24-25
        (from the 24-25 budget book). In recent years SPS has been working
        with other schools in the region to coordinate McKinney Vento service
        and this has been bearing fruit in terms of saved costs. Last year SPS
        was able to recoup almost $1 million in costs from neighboring
        districts for transporting McKinney Vento students.
      </Typography>

      <Typography component="p">
        Last year the state also put up some funding for McKinney Vento for
        the very first time, as well as some additional money to fund special
        education transportation. It&rsquo;s great to see the state notice this
        problem, but SPS will only receive about $400k in additional funding,
        about 2.5% of its transportation deficit.
      </Typography>

      <Typography component="p">
        Special education transportation also continues to be drastically
        underfunded by the state, contributing most of the remainder of this
        year&rsquo;s projected $16 million transportation deficit. It is important
        to note that funding for these services cannot be backfilled with
        general ed transportation dollars. Reducing costs by cutting the
        number of general ed bus riders does not result in freeing up money;
        it results in the state cutting transportation reimbursement to the
        district. And the money to make up the transportation shortfall comes
        straight out of the general fund, directly leading to larger class
        sizes.
      </Typography>

      <Typography component="p">
        In 21-22 First Student didn&rsquo;t have enough bus drivers and after a few
        chaotic weeks of historically bad bus service SPS responded by
        suspending a large number of bus routes. This led to an increase in
        special education busing because many students with behavioral
        challenges who would normally ride a general education bus had busing
        added to their IEP in order to ensure that they had a consistent and
        reliable way to get to school. Since then SPS has been combing through
        students assigned to special education busing and looking for those
        who could be transitioned back to general education busing.
      </Typography>

      <Typography component="p">
        I&rsquo;m happy to say that this has opened up the opportunity for a rare
        win-win for students and the budget. Multiple parents of students
        using special education buses have shared that they would always have
        preferred for their students to ride the general ed bus with their
        peers, but that the need for minor accommodations, such as having a
        harness or epi pen available, have prevented that from happening. Over
        the last two years as SPS has sorted through special education busing
        they have been finding ways to move some of these students onto the
        general ed bus with their friends. It&rsquo;s nice to see SPS do this
        thoughtful work that is bearing fruit in improved finances and, more
        importantly, better outcomes for students.
      </Typography>

      <Typography component="h2" variant="h5" sx={{ mt: 2 }}>
        Crossing Guards
      </Typography>

      <Typography component="p">
        State law plainly says that WA will reimburse the full cost of
        crossing guards but the state does not allocate any funds for this.
        SPS has about $400k of crossing guard expenses each year. Since this
        is a drop in the bucket compared to special ed transportation and
        McKinney Vento transportation SPS doesn&rsquo;t care to bring it into the
        lobbying discussions.
      </Typography>

      <Typography component="h2" variant="h5" sx={{ mt: 2 }}>
        Takeaways
      </Typography>

      <Typography component="p">
        Continued work to make general ed busing efficient will likely save
        some money. One thing that SPS continually points to is the
        possibility of moving back to three bus tiers. This would likely
        result in some savings, however I&rsquo;m very skeptical of the district&rsquo;s
        perpetually increasing estimates. The 2017 School Board Action Report
        on moving from 3-tier busing to 2-tier busing stated that the
        additional cost per year would be $2.3 million total (in 2017 dollars
        of course). At the time the understanding was that after the switch
        the state would begin to reimburse the full cost, and indeed the
        Council of Great City Schools transportation report shows that for
        general education busing at least this was true, the state did fully
        cover the costs of 2-tier busing.
      </Typography>

      <Typography component="p">
        There is a much larger deficit in special education busing, and I
        haven&rsquo;t been able to find any data showing how much of the special
        education deficit is driven by costs associated with 2-tier busing.
        Because a much lower percentage of special education transportation
        costs are reimbursed by the state, improved efficiency in special
        education busing is probably one of the best places SPS could look to
        reduce the transportation deficit. But given that SPS estimated the
        ENTIRE increase in costs of moving from 3-tier busing to 2-tier busing
        to be $2.3 million just 7 years ago it really stretches credulity to
        think that just the special education portion of this cost would add
        up to as much as $11 million of savings now, as SPS presented in a
        recent board meeting.
      </Typography>

      <Typography component="p">
        Regardless of how much money could be saved by moving to 3-tier
        busing, (and of course setting aside the trade-offs this would have
        for families), even if SPS approaches 100% efficiency in its
        transportation system there will always be a sizable transportation
        deficit under the state&rsquo;s current funding model. SPS is required by
        law to provide special ed and McKinney Vento transportation and the
        state does not make provision to come anywhere close to funding these
        services no matter how efficiently they are provided.
      </Typography>
    </Container>
  );
}
