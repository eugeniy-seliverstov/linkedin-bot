export const selectors = {
  searchResults: {
    card: '[data-view-name="people-search-result"]',
    name: 'a[data-view-name="search-result-lockup-title"]',
    connectLink: 'a[aria-label*="Invite"][aria-label*="to connect"]',
    pendingLink: 'a[aria-label*="Pending"]',
  },
  inviteModal: {
    sendWithoutNote: 'button[aria-label="Send without a note"]',
  },
  nextPage: {
    button: 'button[data-testid="pagination-controls-next-button-visible"]',
  },
}
