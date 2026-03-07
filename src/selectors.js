export const selectors = {
  loginChoose: {
    block: '.member-profile-block',
    member: '.member-profile__details',
  },
  loginForm: {
    username: '#username',
    password: '#password',
    submit: '.login__form_action_container button',
  },
  searchResults: {
    cards: '.search-results-container > div:nth-child(1) ul > li',
    subtitle: 'div > div:nth-child(2).t-14.t-normal',
    connectButton: 'div div:nth-child(3) button',
    sendButton: 'button[aria-label="Send without a note"]',
    addMessageButton: 'button[aria-label="Add a note"]',
    inviteHeaderMsg: '.artdeco-modal h2#send-invite-modal',
    name: 'div[data-view-name=search-entity-result-universal-template] > div > div > div:nth-child(2) a',
  },
  nextPage: {
    button: 'button[aria-label="Next"]',
  },
}
