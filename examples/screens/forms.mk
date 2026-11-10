stack g=lg p=lg w=full
  steps "Account|Plan|Confirm" active=2
  grid cols=1 cols-md=2 g=lg
    card "Profile"
      input email label="Email" help="We never share it" "you@x.com"
      input label="Username" error="Already taken" value=ana
      input password label="Password" "••••••••"
      row g=md align=center
        otp 4 value=12
        link muted "Resend code"
      radios "Free|Pro|Team" value=Pro
      checkboxes "Email|SMS|Push" checked="1,3" inline
      upload "Drop your avatar here"
      divider "OR"
      button full icon=log-in "Continue with SSO"
    stack g=md
      row g=sm wrap
        chip x "Design"
        chip x icon=star "Research"
        chip active "All"
        badge success "Live"
        badge warning "Beta"
        badge error "Down"
      alert success x "Saved"
        text sm "Your profile was updated."
      alert warning "Storage almost full"
      alert error "Payment failed"
      row g=lg align=center
        avatars
          avatar "AM"
          avatar "BL"
          avatar "CK"
        spinner lg
        skeleton circle
        stack g=xs grow
          skeleton 2
      row g=md align=center wrap
        code "npm install mokui"
        kbd "Ctrl"
        kbd "K"
      calendar value=12 range="16-20"
