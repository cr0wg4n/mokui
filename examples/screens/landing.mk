stack
  navbar "Acme"
    link muted "Product"
    link muted "Pricing"
    button primary sm "Sign up"
  hero "Draft any UI in seconds" sub="Describe it, render it, iterate with your team."
    button primary icon=zap "Get started"
    button "Read the docs"
  video 16:9 "Product tour" w=xl
  stack g=lg p=lg
    text xl bold center "Everything you need"
    grid min=md g=md
      card "Fast"
        icon zap xl
        text sm muted "Mocks cost a fraction of the tokens."
      card "Safe"
        icon shield xl
        text sm muted "Closed vocabulary, validated references."
      card "Anywhere"
        icon globe xl
        text sm muted "Works in Vue, React, Angular and plain HTML."
    text xl bold center "Pricing"
    grid min=md g=md
      card "Free"
        text xl bold "$0"
        list "1 project|Community support" divided
        button full "Start"
      card "Pro" #pro note="most popular"
        badge primary "Popular"
        text xl bold "$12"
        list "Unlimited projects|Email support|Analytics" divided
        button primary full "Upgrade"
      card "Team"
        text xl bold "$49"
        list "Everything in Pro|SSO|Audit log" divided
        button full "Contact sales"
    text xl bold center "Loved by teams"
    grid min=md g=md
      card
        rating 5
        text "Our drafts went from hours to minutes."
        row g=sm align=center
          avatar "AM"
          text sm muted "Ana Martin, Product"
      card
        rating 5
        text "Agents finally draw what we describe."
        row g=sm align=center
          avatar "BL"
          text sm muted "Bo Lee, Engineering"
    text xl bold center "FAQ"
    stack g=none
      collapse "Is it free?" open
        text sm "The library is free; paid plans add team features."
      collapse "Which frameworks work?"
        text sm "Any. The elements are web components."
  footer "Acme Inc|Privacy|Terms|Contact"
