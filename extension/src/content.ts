// CleanStream Content Script - Runs on YouTube pages

interface ContentSyncPack {
  id: string
  slug: string
  reactionYoutubeUrl: string
  reactionTitle: string | null
  officialYoutubeUrl: string
  officialTitle: string | null
  baseOffsetMs: number
}

interface ContentSyncState {
  syncPack: ContentSyncPack | null
  isReactionTab: boolean
  isOfficialTab: boolean
  localOffset: number
}

const contentState: ContentSyncState = {
  syncPack: null,
  isReactionTab: false,
  isOfficialTab: false,
  localOffset: 0,
}

let contentOverlayElement: HTMLElement | null = null

// Get YouTube player
function contentGetYouTubePlayer(): HTMLVideoElement | null {
  return document.querySelector('video.html5-main-video')
}

// Get current playback time
function contentGetCurrentTime(): number {
  const player = contentGetYouTubePlayer()
  return player ? player.currentTime * 1000 : 0
}

// Seek to time (in milliseconds)
function contentSeekTo(timeMs: number): void {
  const player = contentGetYouTubePlayer()
  if (player) {
    player.currentTime = timeMs / 1000
  }
}

// Check if video is playing
function contentIsPlaying(): boolean {
  const player = contentGetYouTubePlayer()
  return player ? !player.paused : false
}

// Play video
function contentPlay(): void {
  const player = contentGetYouTubePlayer()
  if (player) {
    player.play()
  }
}

// Pause video
function contentPause(): void {
  const player = contentGetYouTubePlayer()
  if (player) {
    player.pause()
  }
}

// Create the CleanStream overlay
function contentCreateOverlay(): void {
  if (contentOverlayElement) return

  contentOverlayElement = document.createElement('div')
  contentOverlayElement.id = 'cleanstream-overlay'
  contentOverlayElement.innerHTML = `
    <div class="cleanstream-badge">
      <span class="cleanstream-icon">🎵</span>
      <span class="cleanstream-text">CleanStream Ready</span>
    </div>
    <div class="cleanstream-controls" style="display: none;">
      <button class="cleanstream-btn" id="cs-open-panel">Open Controls</button>
    </div>
  `

  document.body.appendChild(contentOverlayElement)

  // Add click handler
  const openBtn = document.getElementById('cs-open-panel')
  if (openBtn) {
    openBtn.addEventListener('click', () => {
      chrome.runtime.sendMessage({ type: 'OPEN_SIDE_PANEL' })
    })
  }

  // Show controls on hover
  contentOverlayElement.addEventListener('mouseenter', () => {
    const controls = contentOverlayElement?.querySelector('.cleanstream-controls') as HTMLElement
    if (controls) controls.style.display = 'block'
  })

  contentOverlayElement.addEventListener('mouseleave', () => {
    const controls = contentOverlayElement?.querySelector('.cleanstream-controls') as HTMLElement
    if (controls) controls.style.display = 'none'
  })
}

// Update overlay based on state
function contentUpdateOverlay(): void {
  if (!contentOverlayElement) return

  const badge = contentOverlayElement.querySelector('.cleanstream-badge') as HTMLElement
  const text = contentOverlayElement.querySelector('.cleanstream-text') as HTMLElement

  if (contentState.syncPack) {
    contentOverlayElement.classList.add('active')
    if (contentState.isReactionTab) {
      text.textContent = 'Reaction Video - Sync Available'
      badge.style.background = 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
    } else if (contentState.isOfficialTab) {
      text.textContent = 'Official Track'
      badge.style.background = 'linear-gradient(135deg, #10b981, #3b82f6)'
    }
  } else {
    contentOverlayElement.classList.remove('active')
    text.textContent = 'No Sync Pack'
    badge.style.background = 'rgba(0, 0, 0, 0.7)'
  }
}

// Remove overlay
function contentRemoveOverlay(): void {
  if (contentOverlayElement) {
    contentOverlayElement.remove()
    contentOverlayElement = null
  }
}

// Load local offset from storage
async function contentLoadLocalOffset(): Promise<void> {
  if (!contentState.syncPack) return

  const key = `cleanstream_offset_${contentState.syncPack.id}`
  const result = await chrome.storage.local.get(key)
  contentState.localOffset = result[key] || 0
}

// Save local offset to storage
async function contentSaveLocalOffset(offset: number): Promise<void> {
  if (!contentState.syncPack) return

  contentState.localOffset = offset
  const key = `cleanstream_offset_${contentState.syncPack.id}`
  await chrome.storage.local.set({ [key]: offset })
}

// Handle messages from background script and side panel
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  switch (message.type) {
    case 'SYNC_PACK_FOUND':
      contentState.syncPack = message.syncPack
      contentState.isReactionTab = message.isReactionTab
      contentState.isOfficialTab = message.isOfficialTab
      contentLoadLocalOffset()
      contentCreateOverlay()
      contentUpdateOverlay()
      sendResponse({ success: true })
      break

    case 'GET_PLAYER_STATE':
      sendResponse({
        currentTime: contentGetCurrentTime(),
        isPlaying: contentIsPlaying(),
        syncPack: contentState.syncPack,
        isReactionTab: contentState.isReactionTab,
        isOfficialTab: contentState.isOfficialTab,
        localOffset: contentState.localOffset,
      })
      break

    case 'SEEK_TO':
      contentSeekTo(message.timeMs)
      sendResponse({ success: true })
      break

    case 'PLAY':
      contentPlay()
      sendResponse({ success: true })
      break

    case 'PAUSE':
      contentPause()
      sendResponse({ success: true })
      break

    case 'SET_LOCAL_OFFSET':
      contentSaveLocalOffset(message.offset)
      sendResponse({ success: true })
      break

    case 'NUDGE_OFFSET':
      contentSaveLocalOffset(contentState.localOffset + message.amount)
      sendResponse({ success: true, newOffset: contentState.localOffset })
      break
  }

  return true
})

// Initialize when DOM is ready
function contentInit(): void {
  // Check if we're on a YouTube video page
  if (window.location.pathname === '/watch') {
    // Request tab state from background
    chrome.runtime.sendMessage({ type: 'GET_TAB_STATE' }, (response) => {
      if (response) {
        contentState.syncPack = response.syncPack
        contentState.isReactionTab = response.isReactionTab
        contentState.isOfficialTab = response.isOfficialTab

        if (contentState.syncPack) {
          contentLoadLocalOffset()
          contentCreateOverlay()
          contentUpdateOverlay()
        }
      }
    })
  }
}

// Run initialization
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', contentInit)
} else {
  contentInit()
}

// Watch for URL changes (YouTube is a SPA)
let contentLastUrl = window.location.href
const contentObserver = new MutationObserver(() => {
  if (window.location.href !== contentLastUrl) {
    contentLastUrl = window.location.href
    contentRemoveOverlay()
    contentInit()
  }
})

contentObserver.observe(document.body, { childList: true, subtree: true })

console.log('CleanStream content script loaded')
