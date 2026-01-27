// CleanStream Background Service Worker

const BG_API_BASE = 'http://localhost:3001'

// Types
interface BgSyncPack {
  id: string
  slug: string
  reactionYoutubeUrl: string
  reactionTitle: string | null
  officialYoutubeUrl: string
  officialTitle: string | null
  baseOffsetMs: number
  driftCorrectionMs: number
}

interface BgTabState {
  videoId: string | null
  syncPack: BgSyncPack | null
  isOfficialTab: boolean
  isReactionTab: boolean
}

// Store tab states
const bgTabStates = new Map<number, BgTabState>()

// Extract YouTube video ID from URL
function bgExtractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }

  return null
}

// Fetch sync pack by reaction video ID
async function bgFetchSyncPackByVideoId(videoId: string): Promise<BgSyncPack | null> {
  try {
    const response = await fetch(`${BG_API_BASE}/api/sync-packs?videoId=${videoId}`)
    if (!response.ok) return null

    const packs = await response.json()
    // Find a pack where the reaction URL contains this video ID
    return packs.find((pack: BgSyncPack) =>
      pack.reactionYoutubeUrl.includes(videoId)
    ) || null
  } catch (error) {
    console.error('Error fetching sync pack:', error)
    return null
  }
}

// Fetch sync pack by slug
async function bgFetchSyncPackBySlug(slug: string): Promise<BgSyncPack | null> {
  try {
    const response = await fetch(`${BG_API_BASE}/api/sync-packs/${slug}`)
    if (!response.ok) return null
    return await response.json()
  } catch (error) {
    console.error('Error fetching sync pack:', error)
    return null
  }
}

// Handle tab updates
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete' || !tab.url) return

  const videoId = bgExtractYouTubeId(tab.url)

  if (videoId) {
    // Check if this video has a sync pack
    const syncPack = await bgFetchSyncPackByVideoId(videoId)

    const tabState: BgTabState = {
      videoId,
      syncPack,
      isOfficialTab: syncPack ? syncPack.officialYoutubeUrl.includes(videoId) : false,
      isReactionTab: syncPack ? syncPack.reactionYoutubeUrl.includes(videoId) : false,
    }

    bgTabStates.set(tabId, tabState)

    // Notify content script
    if (syncPack) {
      chrome.tabs.sendMessage(tabId, {
        type: 'SYNC_PACK_FOUND',
        syncPack,
        isReactionTab: tabState.isReactionTab,
        isOfficialTab: tabState.isOfficialTab,
      }).catch(() => {
        // Tab might not have content script loaded yet
      })
    }
  }
})

// Handle tab removal
chrome.tabs.onRemoved.addListener((tabId) => {
  bgTabStates.delete(tabId)
})

// Handle messages from content scripts and side panel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_TAB_STATE') {
    const tabId = sender.tab?.id
    if (tabId) {
      const tabState = bgTabStates.get(tabId)
      sendResponse(tabState || null)
    }
    return true
  }

  if (message.type === 'GET_SYNC_PACK') {
    bgFetchSyncPackBySlug(message.slug).then(sendResponse)
    return true
  }

  if (message.type === 'OPEN_OFFICIAL_TAB') {
    chrome.tabs.create({
      url: message.url,
      active: false,
    }).then(sendResponse)
    return true
  }

  if (message.type === 'GET_ALL_YOUTUBE_TABS') {
    chrome.tabs.query({ url: ['*://www.youtube.com/*', '*://youtube.com/*'] })
      .then((tabs) => {
        const tabInfo = tabs.map(tab => ({
          id: tab.id,
          url: tab.url,
          title: tab.title,
          state: tab.id ? bgTabStates.get(tab.id) : null,
        }))
        sendResponse(tabInfo)
      })
    return true
  }
})

// Open side panel when extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    chrome.sidePanel.open({ tabId: tab.id })
  }
})

console.log('CleanStream background service worker loaded')
