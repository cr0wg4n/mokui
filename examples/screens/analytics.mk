stack g=lg p=lg
  breadcrumb "Home|Analytics|Overview"
  row g=md align=center wrap
    text xl bold "Analytics"
    spacer
    segmented "Day|Week|Month" active=2
    button primary icon=download "Export"
  alert info "Heads up"
    text sm "Data refreshes every 15 minutes."
  grid min=sm g=md
    stat "Revenue" value="$48.2k" delta="+12%"
    stat "Users" value="2,410" delta="+4%"
    stat "Churn" value="3.1%" delta="-0.6%"
    stat "Sessions" value="18.9k"
  grid cols=1 cols-md=2 g=md
    card "Traffic"
      chart area labels="Mon|Tue|Wed|Thu|Fri|Sat|Sun"
    card "Sales"
      chart bar labels="Q1|Q2|Q3|Q4|Q5|Q6|Q7"
  grid cols=1 cols-md=3 g=md
    card "Sources"
      row g=lg align=center
        chart donut w=sm
        stack g=xs
          badge primary "Direct 40%"
          badge "Search 25%"
    card "Goal"
      text sm muted "Monthly target"
      progress 72
      rating 4
    card "Activity"
      timeline "Signed up:Mar 3|Verified|First project|Upgraded" active=3
  pagination "1|2|3|…|12" active=2
