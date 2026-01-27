// CleanStream Side Panel

interface SidePanelSyncPack {
  id: string
  slug: string
  reactionYoutubeUrl: string
  reactionTitle: string | null
  officialYoutubeUrl: string
  officialTitle: string | null
  baseOffsetMs: number
}

interface SidePanelTabInfo {
  id: number
  url: string
  title: string
  state: {
    videoId: string | null
    syncPack: SidePanelSyncPack | null
    isOfficialTab: boolean
    isReactionTab: boolean
  } | null
}

interface SidePanelState {
  currentPack: SidePanelSyncPack | null
  localOffset: number
  officialTabId: number | null
  reactionTabId: number | null
  youtubeTabs: SidePanelTabInfo[]
}

const sidePanelState: SidePanelState = {
  currentPack: null,
  localOffset: 0,
  officialTabId: null,
  reactionTabId: null,
  youtubeTabs: [],
}

const SIDEPANEL_API_BASE = 'http://localhost:3001'

// Format milliseconds to readable string
function sidePanelFormatMs(ms: number): string {
  const absMs = Math.abs(ms)
  const sign = ms < 0 ? '-' : '+'
  const seconds = Math.floor(absMs / 1000)
  const remaining = absMs % 1000

  if (seconds === 0) {
    return `${sign}${remaining}ms`
  }

  return `${sign}${seconds}.${String(remaining).padStart(3, '0')}s`
}

// Extract YouTube video ID from URL
function sidePanelExtractYouTubeId(url: string): string | null {
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

// Load local offset from storage
async function sidePanelLoadLocalOffset(): Promise<void> {
  if (!sidePanelState.currentPack) return

  const key = `cleanstream_offset_${sidePanelState.currentPack.id}`
  const result = await chrome.storage.local.get(key)
  sidePanelState.localOffset = result[key] || 0
}

// Save local offset to storage
async function sidePanelSaveLocalOffset(offset: number): Promise<void> {
  if (!sidePanelState.currentPack) return

  sidePanelState.localOffset = offset
  const key = `cleanstream_offset_${sidePanelState.currentPack.id}`
  await chrome.storage.local.set({ [key]: offset })
  sidePanelRender()
}

// Refresh YouTube tabs
async function sidePanelRefreshTabs(): Promise<void> {
  sidePanelState.youtubeTabs = await chrome.runtime.sendMessage({ type: 'GET_ALL_YOUTUBE_TABS' })

  // Find reaction and official tabs
  sidePanelState.reactionTabId = null
  sidePanelState.officialTabId = null

  if (sidePanelState.currentPack) {
    for (const tab of sidePanelState.youtubeTabs) {
      const videoId = sidePanelExtractYouTubeId(tab.url || '')
      if (videoId) {
        if (sidePanelState.currentPack.reactionYoutubeUrl.includes(videoId)) {
          sidePanelState.reactionTabId = tab.id
        }
        if (sidePanelState.currentPack.officialYoutubeUrl.includes(videoId)) {
          sidePanelState.officialTabId = tab.id
        }
      }
    }
  }

  sidePanelRender()
}

// Open official track in new tab
async function sidePanelOpenOfficialTrack(): Promise<void> {
  if (!sidePanelState.currentPack) return

  const tab = await chrome.runtime.sendMessage({
    type: 'OPEN_OFFICIAL_TAB',
    url: sidePanelState.currentPack.officialYoutubeUrl,
  })

  if (tab?.id) {
    sidePanelState.officialTabId = tab.id
    setTimeout(sidePanelRefreshTabs, 1000)
  }
}

// Nudge offset
async function sidePanelNudgeOffset(amount: number): Promise<void> {
  await sidePanelSaveLocalOffset(sidePanelState.localOffset + amount)
}

// Reset offset
async function sidePanelResetOffset(): Promise<void> {
  await sidePanelSaveLocalOffset(0)
}

// Render UI
function sidePanelRender(): void {
  const content = document.getElementById('content')
  if (!content) return

  if (!sidePanelState.currentPack) {
    content.innerHTML = `
      <div class="empty-state">
        <p>No Sync Pack detected on this page.</p>
        <p>Visit a YouTube reaction video that has a CleanStream Sync Pack, or:</p>
        <a href="${SIDEPANEL_API_BASE}" target="_blank">Browse Sync Packs</a>
      </div>
    `
    return
  }

  const totalOffset = sidePanelState.currentPack.baseOffsetMs + sidePanelState.localOffset

  content.innerHTML = `
    <div class="status found">
      ✓ Sync Pack found for this video
    </div>

    <div class="pack-info">
      <h3>Reaction</h3>
      <div class="title">${sidePanelState.currentPack.reactionTitle || 'Untitled Reaction'}</div>
      <h3 style="margin-top: 12px;">Official Track</h3>
      <div class="title">${sidePanelState.currentPack.officialTitle || 'Official Track'}</div>
    </div>

    <div class="section">
      <div class="section-title">Sync Steps</div>
      <div class="steps">
        <div class="step ${sidePanelState.officialTabId ? 'completed' : ''}">
          <div class="step-number">${sidePanelState.officialTabId ? '✓' : '1'}</div>
          <div class="step-content">
            <h4>Open Official Track</h4>
            <p>Open the licensed music in a new tab</p>
          </div>
        </div>
        ${!sidePanelState.officialTabId ? `
          <button class="btn btn-primary" id="open-official">
            Open Official Track
          </button>
        ` : ''}

        <div class="step">
          <div class="step-number">2</div>
          <div class="step-content">
            <h4>Play Official First</h4>
            <p>Start playing the official track, then play the reaction</p>
          </div>
        </div>

        <div class="step">
          <div class="step-number">3</div>
          <div class="step-content">
            <h4>Adjust if Needed</h4>
            <p>Use nudge controls below to fine-tune the sync</p>
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Offset Control</div>
      <div class="offset-display">
        <div class="offset-value">${sidePanelFormatMs(totalOffset)}</div>
        <div class="offset-label">
          Base: ${sidePanelFormatMs(sidePanelState.currentPack.baseOffsetMs)} | Your adjustment: ${sidePanelFormatMs(sidePanelState.localOffset)}
        </div>
      </div>
      <div class="nudge-buttons">
        <button class="nudge-btn" data-nudge="-200">-200ms</button>
        <button class="nudge-btn" data-nudge="-50">-50ms</button>
        <button class="nudge-btn" data-nudge="50">+50ms</button>
        <button class="nudge-btn" data-nudge="200">+200ms</button>
      </div>
      ${sidePanelState.localOffset !== 0 ? `
        <button class="reset-btn" id="reset-offset">Reset to Default</button>
      ` : ''}
    </div>

    ${sidePanelState.youtubeTabs.length > 0 ? `
      <div class="section">
        <div class="section-title">YouTube Tabs</div>
        <div class="tabs-list">
          ${sidePanelState.youtubeTabs.map((tab: SidePanelTabInfo) => {
            const videoId = sidePanelExtractYouTubeId(tab.url || '')
            let role = ''
            let roleClass = ''

            if (sidePanelState.currentPack && videoId) {
              if (sidePanelState.currentPack.reactionYoutubeUrl.includes(videoId)) {
                role = 'Reaction'
                roleClass = 'reaction'
              } else if (sidePanelState.currentPack.officialYoutubeUrl.includes(videoId)) {
                role = 'Official'
                roleClass = 'official'
              }
            }

            return `
              <div class="tab-item">
                <div class="tab-info">
                  <div class="tab-title">${tab.title || 'YouTube'}</div>
                  ${role ? `<div class="tab-role ${roleClass}">${role}</div>` : ''}
                </div>
              </div>
            `
          }).join('')}
        </div>
      </div>
    ` : ''}
  `

  // Add event listeners
  const openOfficialBtn = document.getElementById('open-official')
  if (openOfficialBtn) {
    openOfficialBtn.addEventListener('click', sidePanelOpenOfficialTrack)
  }

  const resetBtn = document.getElementById('reset-offset')
  if (resetBtn) {
    resetBtn.addEventListener('click', sidePanelResetOffset)
  }

  document.querySelectorAll('[data-nudge]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const amount = parseInt((e.target as HTMLElement).dataset.nudge || '0')
      sidePanelNudgeOffset(amount)
    })
  })
}

// Initialize
async function sidePanelInit(): Promise<void> {
  // Get current tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

  if (tab?.id) {
    // Try to get state from content script
    try {
      const response = await chrome.tabs.sendMessage(tab.id, { type: 'GET_PLAYER_STATE' })
      if (response?.syncPack) {
        sidePanelState.currentPack = response.syncPack
        sidePanelState.localOffset = response.localOffset || 0
      }
    } catch {
      // Content script might not be loaded
    }
  }

  // If no pack from content script, check tab states
  if (!sidePanelState.currentPack) {
    await sidePanelRefreshTabs()

    for (const ytTab of sidePanelState.youtubeTabs) {
      if (ytTab.state?.syncPack) {
        sidePanelState.currentPack = ytTab.state.syncPack
        await sidePanelLoadLocalOffset()
        break
      }
    }
  }

  sidePanelRender()
  await sidePanelRefreshTabs()

  // Refresh tabs periodically
  setInterval(sidePanelRefreshTabs, 5000)
}

sidePanelInit()
