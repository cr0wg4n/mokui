stack g=lg p=lg
  text xl bold center "Pricing"
  grid min=md g=md
    card "Free"
      text xl bold "$0"
      list "1 project|Community support" divided
      button "Start"
    card "Pro" #pro note="most popular, highlight"
      badge primary "Popular"
      text xl bold "$12"
      list "Unlimited projects|Email support|Analytics" divided
      button primary "Upgrade"
    card "Team"
      text xl bold "$49"
      list "Everything in Pro|SSO|Audit log" divided
      button "Contact sales"
