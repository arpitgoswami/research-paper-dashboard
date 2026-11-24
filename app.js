/* MTech review paper — plain HTML, CSS and JS. No build step, no framework. */

const STORAGE_KEY = 'review-quest.v3'
const STALE_KEYS = ['review-quest.v1', 'review-quest.v2']
const BARS = 22
const SCREENS = ['Overview', 'Sections', 'Focus']
const AUTO_ADVANCE_MS = 30_000

const STATUS_LABEL = { todo: 'Not started', doing: 'In progress', done: 'Complete' }
const STATUS_NEXT = { todo: 'doing', doing: 'done', done: 'todo' }
const NEXT_LABEL = { todo: 'Start', doing: 'Complete', done: 'Reopen' }

const DEFAULT_DATA = {
  title: 'MTech review paper',
  subtitle: 'Every section, from working title to the viva slide deck.',
  deadline: '2027-04-15',
  steps: [
    {
      id: 's1',
      title: 'Title',
      detail:
        'Lock a working title that names the topic, the method and the scope, then agree the keywords with your guide.',
      phase: 'Document',
      status: 'done',
      due: '2026-11-27',
    },
    {
      id: 's2',
      title: 'Abstract',
      detail:
        'Write 200–250 words: problem, approach, key findings and what the review contributes. Revise it last as well.',
      phase: 'Document',
      status: 'done',
      due: '2026-12-04',
    },
    {
      id: 's3',
      title: 'Introduction',
      detail:
        'Frame the field, state the review question and outline the structure of the paper in the final paragraph.',
      phase: 'Drafting',
      status: 'doing',
      due: '2026-12-12',
    },
    {
      id: 's4',
      title: 'Materials and Methods',
      detail:
        'Databases, search strings, inclusion criteria and screening counts — enough for someone to repeat the review.',
      phase: 'Drafting',
      status: 'todo',
      due: '2026-12-22',
    },
    {
      id: 's5',
      title: 'Results and Discussions',
      detail:
        'Present the synthesis, compare studies against the matrix, then argue what the evidence means for practice.',
      phase: 'Drafting',
      status: 'todo',
      due: '2027-01-08',
    },
    {
      id: 's6',
      title: 'Conclusion',
      detail:
        'Answer the review question, state the limitations honestly and point to the next piece of work.',
      phase: 'Drafting',
      status: 'todo',
      due: '2027-01-16',
    },
    {
      id: 's7',
      title: 'References',
      detail:
        'One citation style throughout, every DOI checked, no orphan or retracted sources in the list.',
      phase: 'Evidence',
      status: 'todo',
      due: '2027-01-24',
    },
    {
      id: 's8',
      title: 'Diagrams',
      detail:
        'Search flow, taxonomy and architecture figures drawn as vectors, numbered and referenced in the text.',
      phase: 'Evidence',
      status: 'todo',
      due: '2027-02-02',
    },
    {
      id: 's9',
      title: 'Embeddings',
      detail:
        'Place every figure and diagram inline near its first mention, with captions that stand on their own.',
      phase: 'Evidence',
      status: 'todo',
      due: '2027-02-09',
    },
    {
      id: 's10',
      title: 'Tables',
      detail:
        'Comparison and extraction tables aligned to the template: consistent headers, units, and no split rows.',
      phase: 'Evidence',
      status: 'todo',
      due: '2027-02-16',
    },
    {
      id: 's11',
      title: 'Turnitin',
      detail:
        'Run the similarity check, clear quoted text from the score and keep the report ready for submission.',
      phase: 'Compliance',
      status: 'todo',
      due: '2027-02-26',
    },
    {
      id: 's12',
      title: 'Re-establishment',
      detail:
        'Rework everything the guide flagged, then re-read the paper end to end so it reads as one argument.',
      phase: 'Compliance',
      status: 'todo',
      due: '2027-03-12',
    },
    {
      id: 's13',
      title: 'Communication',
      detail:
        'Guide approvals, committee emails and the submission window confirmed in writing before the deadline.',
      phase: 'Compliance',
      status: 'todo',
      due: '2027-03-22',
    },
    {
      id: 's14',
      title: 'Submission',
      detail:
        'Final PDF, plagiarism report, approval forms and a receipt copy filed for your own records.',
      phase: 'Delivery',
      status: 'todo',
      due: '2027-03-30',
    },
    {
      id: 's15',
      title: 'Presentation Building',
      detail:
        'Twelve slides, a two-minute summary and a rehearsed answer for every likely examiner question.',
      phase: 'Delivery',
      status: 'todo',
      due: '2027-04-10',
    },
  ],
}

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'doing', label: 'Doing' },
  { id: 'todo', label: 'To do' },
  { id: 'done', label: 'Done' },
]

/* ---------- helpers ---------- */

const el = (id) => document.getElementById(id)

function esc(value) {
  return String(value).replace(
    /[&<>"']/g,
    (ch) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch],
  )
}

function newId() {
  return `q${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

function dayStart(iso) {
  const date = new Date(`${iso}T00:00:00`)
  return Number.isNaN(date.getTime()) ? null : date
}

function shortDate(iso) {
  const date = dayStart(iso)
  if (!date) return 'No date'
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function daysBetween(iso) {
  const target = dayStart(iso)
  if (!target) return null
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.round((target.getTime() - today.getTime()) / 86_400_000)
}

function stageFor(percent) {
  if (percent >= 100) return 'Ready to submit'
  if (percent >= 70) return 'Final stretch'
  if (percent >= 40) return 'Writing in progress'
  if (percent > 0) return 'Gathering momentum'
  return 'Getting started'
}

/* ---------- icons ---------- */

const ICONS = {
  'arrow-left': '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  'arrow-right': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  'arrow-up': '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
  'arrow-down': '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  'calendar-days':
    '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
  download:
    '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
  pause:
    '<rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/>',
  play: '<path d="M6 3 20 12 6 21z"/>',
  pencil:
    '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  'rotate-ccw':
    '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  trash:
    '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  volume2:
    '<path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>',
  'volume-x': '<path d="M11 5 6 9H2v6h4l5 4z"/><path d="m22 9-6 6"/><path d="m16 9 6 6"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
}

function icon(name, size = 16) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`
}

function hydrateIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach((node) => {
    node.outerHTML = icon(node.dataset.icon, Number(node.dataset.size) || 16)
  })
}

/* ---------- audio ---------- */

const steps = (src) => src.trim().replace(/\s+/g, ' ').split(' ')
const bars = (...parts) => parts.flatMap(steps)

const SEMITONE = {
  C: 0,
  'C#': 1,
  D: 2,
  'D#': 3,
  E: 4,
  F: 5,
  'F#': 6,
  G: 7,
  'G#': 8,
  A: 9,
  'A#': 10,
  B: 11,
}

function frequency(note) {
  const match = /^([A-G]#?)(-?\d)$/.exec(note)
  if (!match) return 0
  const midi = SEMITONE[match[1]] + (Number(match[2]) + 1) * 12
  return 440 * 2 ** ((midi - 69) / 12)
}

const TRACKS = [
  {
    id: 'campus',
    name: 'Soft focus',
    mood: 'warm loop',
    bpm: 104,
    leadWave: 'square',
    bassWave: 'triangle',
    arpWave: 'square',
    lead: bars(
      'E5 -- G5 -- A5 -- G5 --',
      'E5 -- D5 -- C5 -- -- --',
      'D5 -- E5 -- G5 -- E5 --',
      'D5 -- C5 -- A4 -- -- --',
      'C5 -- E5 -- G5 -- E5 --',
      'A5 -- G5 -- E5 -- D5 --',
      'E5 -- D5 -- C5 -- D5 --',
      'C5 -- -- -- -- -- -- --',
    ),
    bass: bars(
      'A2 -- -- -- E2 -- -- --',
      'F2 -- -- -- C3 -- -- --',
      'G2 -- -- -- D3 -- -- --',
      'A2 -- -- -- E2 -- -- --',
      'F2 -- -- -- C3 -- -- --',
      'G2 -- -- -- D3 -- -- --',
      'E2 -- -- -- A2 -- -- --',
      'A2 -- -- -- -- -- -- --',
    ),
    arp: bars(
      'A4 C5 E5 C5 A4 C5 E5 C5',
      'F4 A4 C5 A4 F4 A4 C5 A4',
      'G4 B4 D5 B4 G4 B4 D5 B4',
      'A4 C5 E5 C5 A4 C5 E5 C5',
      'F4 A4 C5 A4 F4 A4 C5 A4',
      'G4 B4 D5 B4 G4 B4 D5 B4',
      'E4 A4 C5 A4 E4 A4 C5 A4',
      'A4 -- -- -- -- -- -- --',
    ),
    drums: 'k - h - s - h - k - h k s - h -',
  },
  {
    id: 'deadline',
    name: 'Deep work',
    mood: 'driving loop',
    bpm: 146,
    leadWave: 'square',
    bassWave: 'sawtooth',
    arpWave: 'triangle',
    lead: bars(
      'A5 A5 C6 A5 E5 -- G5 --',
      'A5 -- G5 E5 D5 -- E5 --',
      'C6 -- A5 -- G5 -- E5 --',
      'D5 -- E5 -- A4 -- -- --',
      'A5 C6 E6 C6 A5 C6 E6 C6',
      'G5 B5 D6 B5 G5 B5 D6 B5',
      'E5 G5 B5 G5 E5 G5 B5 G5',
      'A5 -- -- -- E5 -- -- --',
    ),
    bass: bars(
      'A2 A2 A2 -- A2 -- E2 --',
      'F2 F2 F2 -- F2 -- C3 --',
      'G2 G2 G2 -- G2 -- D3 --',
      'A2 A2 A2 -- E2 -- A2 --',
      'A2 A2 A2 -- A2 -- E2 --',
      'F2 F2 F2 -- F2 -- C3 --',
      'E2 E2 E2 -- E2 -- B2 --',
      'A2 -- -- -- -- -- -- --',
    ),
    arp: bars(
      'A4 E5 A5 E5 A4 E5 A5 E5',
      'F4 C5 F5 C5 F4 C5 F5 C5',
      'G4 D5 G5 D5 G4 D5 G5 D5',
      'A4 E5 A5 E5 A4 E5 A5 E5',
      'A4 E5 A5 E5 A4 E5 A5 E5',
      'F4 C5 F5 C5 F4 C5 F5 C5',
      'E4 B4 E5 B4 E4 B4 E5 B4',
      'A4 -- -- -- -- -- -- --',
    ),
    drums: 'k h s h k h s h k h s h k s s h',
  },
  {
    id: 'defense',
    name: 'Late night',
    mood: 'calm loop',
    bpm: 86,
    leadWave: 'triangle',
    bassWave: 'sine',
    arpWave: 'triangle',
    lead: bars(
      'C5 -- -- -- E5 -- -- --',
      'G5 -- -- -- E5 -- -- --',
      'A4 -- -- -- C5 -- -- --',
      'D5 -- -- -- -- -- -- --',
      'E5 -- -- -- G5 -- -- --',
      'A5 -- -- -- G5 -- -- --',
      'E5 -- D5 -- C5 -- -- --',
      'C5 -- -- -- -- -- -- --',
    ),
    bass: bars(
      'C3 -- -- -- -- -- -- --',
      'A2 -- -- -- -- -- -- --',
      'F2 -- -- -- -- -- -- --',
      'G2 -- -- -- -- -- -- --',
      'C3 -- -- -- -- -- -- --',
      'F2 -- -- -- -- -- -- --',
      'G2 -- -- -- -- -- -- --',
      'C3 -- -- -- -- -- -- --',
    ),
    arp: bars(
      'C4 E4 G4 E4 C4 E4 G4 E4',
      'A3 C4 E4 C4 A3 C4 E4 C4',
      'F3 A3 C4 A3 F3 A3 C4 A3',
      'G3 B3 D4 B3 G3 B3 D4 B3',
      'C4 E4 G4 E4 C4 E4 G4 E4',
      'F3 A3 C4 A3 F3 A3 C4 A3',
      'G3 B3 D4 B3 G3 B3 D4 B3',
      'C4 -- -- -- -- -- -- --',
    ),
    drums: 'k - - h - - h - k - - h - - h -',
  },
]

/* A tiny chiptune sequencer: square, triangle and noise voices scheduled
   from a 16th-note clock. No audio files, no network requests. */
class Chiptune {
  constructor() {
    this.ctx = null
    this.master = null
    this.analyser = null
    this.spectrum = new Uint8Array(32)
    this.noise = null
    this.timer = null
    this.step = 0
    this.next = 0
    this.volume = 0.55
    this.track = 0
    this.playing = false
  }

  async ensure() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') await this.ctx.resume()
      return this.ctx
    }
    const Ctor = window.AudioContext || window.webkitAudioContext
    const ctx = new Ctor()
    const master = ctx.createGain()
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 64
    analyser.smoothingTimeConstant = 0.7
    master.gain.value = this.volume
    master.connect(analyser)
    analyser.connect(ctx.destination)
    this.ctx = ctx
    this.master = master
    this.analyser = analyser
    this.spectrum = new Uint8Array(analyser.frequencyBinCount)
    if (ctx.state === 'suspended') await ctx.resume()
    return ctx
  }

  noiseBuffer(ctx) {
    if (this.noise) return this.noise
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.4, ctx.sampleRate)
    const channel = buffer.getChannelData(0)
    for (let i = 0; i < channel.length; i += 1) channel[i] = Math.random() * 2 - 1
    this.noise = buffer
    return buffer
  }

  blip(note, when, length, wave, level) {
    const ctx = this.ctx
    if (!ctx || !this.master) return
    const frequencyHz = frequency(note)
    if (!frequencyHz) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = wave
    osc.frequency.setValueAtTime(frequencyHz, when)
    gain.gain.setValueAtTime(0.0001, when)
    gain.gain.linearRampToValueAtTime(level, when + 0.008)
    gain.gain.exponentialRampToValueAtTime(0.0001, when + length)
    osc.connect(gain)
    gain.connect(this.master)
    osc.start(when)
    osc.stop(when + length + 0.02)
  }

  drum(kind, when) {
    const ctx = this.ctx
    if (!ctx || !this.master) return
    if (kind === 'k') {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(150, when)
      osc.frequency.exponentialRampToValueAtTime(44, when + 0.13)
      gain.gain.setValueAtTime(0.5, when)
      gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.15)
      osc.connect(gain)
      gain.connect(this.master)
      osc.start(when)
      osc.stop(when + 0.18)
      return
    }
    const source = ctx.createBufferSource()
    source.buffer = this.noiseBuffer(ctx)
    const filter = ctx.createBiquadFilter()
    const gain = ctx.createGain()
    filter.type = 'highpass'
    filter.frequency.value = kind === 's' ? 1400 : 5200
    const length = kind === 's' ? 0.11 : 0.04
    gain.gain.setValueAtTime(kind === 's' ? 0.16 : 0.09, when)
    gain.gain.exponentialRampToValueAtTime(0.0001, when + length)
    source.connect(filter)
    filter.connect(gain)
    gain.connect(this.master)
    source.start(when)
    source.stop(when + length + 0.02)
  }

  schedule() {
    const ctx = this.ctx
    if (!ctx || !this.playing) return
    const track = TRACKS[this.track]
    const stepLength = 60 / track.bpm / 4
    while (this.next < ctx.currentTime + 0.25) {
      const index = this.step
      const lead = track.lead[index % track.lead.length]
      const bass = track.bass[index % track.bass.length]
      const arp = track.arp[index % track.arp.length]
      if (lead && lead !== '--' && lead !== '..')
        this.blip(lead, this.next, stepLength * 1.6, track.leadWave, 0.1)
      if (bass && bass !== '--' && bass !== '..')
        this.blip(bass, this.next, stepLength * 3.4, track.bassWave, 0.2)
      if (arp && arp !== '--' && arp !== '..')
        this.blip(arp, this.next, stepLength * 0.9, track.arpWave, 0.035)
      const drums = track.drums.replace(/ /g, '')
      const hit = drums[index % drums.length]
      if (hit && hit !== '-') this.drum(hit, this.next)
      this.next += stepLength
      this.step = (index + 1) % 64
    }
  }

  async play() {
    await this.ensure()
    if (this.playing) return
    this.playing = true
    this.step = 0
    this.next = (this.ctx ? this.ctx.currentTime : 0) + 0.08
    this.timer = window.setInterval(() => this.schedule(), 25)
    this.schedule()
  }

  pause() {
    this.playing = false
    if (this.timer !== null) window.clearInterval(this.timer)
    this.timer = null
  }

  setVolume(value) {
    this.volume = value
    if (this.master && this.ctx)
      this.master.gain.setTargetAtTime(value, this.ctx.currentTime, 0.02)
  }

  setTrack(index) {
    this.track = index
    this.step = 0
    if (this.playing && this.ctx) this.next = this.ctx.currentTime + 0.06
  }

  getSpectrum() {
    if (this.analyser) this.analyser.getByteFrequencyData(this.spectrum)
    return this.spectrum
  }

  /* Short UI chirp: 'up' for progress, 'down' for undo, 'blip' for taps. */
  effect(kind) {
    if (!this.ctx || !this.master) return
    const now = this.ctx.currentTime + 0.01
    if (kind === 'blip') this.blip('E6', now, 0.06, 'square', 0.05)
    if (kind === 'up') {
      this.blip('C6', now, 0.07, 'square', 0.06)
      this.blip('G6', now + 0.07, 0.12, 'square', 0.05)
    }
    if (kind === 'down') this.blip('A4', now, 0.12, 'triangle', 0.07)
  }
}

/* ---------- state ---------- */

function load() {
  try {
    STALE_KEYS.forEach((key) => localStorage.removeItem(key))
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return JSON.parse(JSON.stringify(DEFAULT_DATA))
    const parsed = JSON.parse(raw)
    if (!parsed || !Array.isArray(parsed.steps) || !parsed.steps.length)
      return JSON.parse(JSON.stringify(DEFAULT_DATA))
    return {
      title: parsed.title || DEFAULT_DATA.title,
      subtitle: parsed.subtitle ?? DEFAULT_DATA.subtitle,
      deadline: parsed.deadline || DEFAULT_DATA.deadline,
      steps: parsed.steps.map((step, index) => ({
        id: step.id || `s${index}-${step.title}`,
        title: step.title || 'Untitled section',
        detail: step.detail || '',
        phase: step.phase || 'Section',
        status: ['todo', 'doing', 'done'].includes(step.status) ? step.status : 'todo',
        due: step.due || '',
      })),
    }
  } catch {
    return JSON.parse(JSON.stringify(DEFAULT_DATA))
  }
}

const state = {
  data: load(),
  filter: 'all',
  active: 0,
  draft: null,
  creating: false,
  playing: false,
  volume: 0.5,
  trackIndex: 0,
  savedAt: '',
}

let engine = null
let saveTimer = null
let autoTimer = null
let barEls = []

const audio = () => (engine = engine || new Chiptune())

function save() {
  window.clearTimeout(saveTimer)
  saveTimer = window.setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data))
      state.savedAt = new Date().toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      state.savedAt = ''
    }
    renderSaved()
  }, 250)
}

/* ---------- derived values ---------- */

function stats() {
  const total = state.data.steps.length
  const done = state.data.steps.filter((step) => step.status === 'done').length
  const doing = state.data.steps.filter((step) => step.status === 'doing').length
  return {
    total,
    done,
    doing,
    open: total - done,
    percent: total ? Math.round((done / total) * 100) : 0,
  }
}

const nextUp = () =>
  state.data.steps.find((step) => step.status === 'doing') ||
  state.data.steps.find((step) => step.status === 'todo')

const countOf = (status) =>
  status === 'all'
    ? state.data.steps.length
    : state.data.steps.filter((step) => step.status === status).length

/* ---------- render ---------- */

function renderOverview() {
  const s = stats()
  el('barCount').innerHTML = `<b>${s.done}</b><span class="bar-sep">/</span>${s.total}`
  el('kicker').textContent = stageFor(s.percent)

  const ticks = state.data.steps
    .map((step) => `<span class="tick ${step.status}" title="${esc(step.title)}"></span>`)
    .join('')

  const next = nextUp()
  el('overviewMeta').innerHTML = `
    <div class="meter">
      <div class="meter-top">
        <strong>${s.percent}<span class="pct">%</span></strong>
        <span>${s.done} of ${s.total} sections complete</span>
      </div>
      <div class="ticks" role="progressbar" aria-valuenow="${s.percent}" aria-valuemin="0" aria-valuemax="100" aria-label="Paper progress">
        ${ticks}
      </div>
    </div>
    <div class="figures">
      <div><strong>${s.done}</strong><span>Complete</span></div>
      <div><strong>${s.doing}</strong><span>In progress</span></div>
      <div><strong>${s.open}</strong><span>Open</span></div>
    </div>
    <div class="next">
      <p class="label">Next</p>
      ${
        next
          ? `<h2>${esc(next.title)}</h2>
             <p class="muted">${esc(next.detail)}</p>
             <button class="btn accent" data-next="${esc(next.id)}">
               ${icon('check', 15)}
               ${next.status === 'doing' ? 'Mark complete' : 'Start section'}
             </button>`
          : `<h2>All sections complete</h2>
             <p class="muted">Every section is checked off. Submit the paper.</p>`
      }
    </div>`
}

function renderDeadlineHint() {
  const hint = el('deadlineHint')
  const left = daysBetween(state.data.deadline)
  if (left === null) {
    hint.textContent = ''
    hint.className = 'hint'
    return
  }
  hint.textContent =
    left < 0
      ? `${Math.abs(left)} days overdue`
      : left === 0
        ? 'Due today'
        : `${left} days left`
  hint.className = left < 14 ? 'hint soon' : 'hint'
}

function syncFields() {
  el('paperTitle').value = state.data.title
  el('paperSubtitle').value = state.data.subtitle
  el('deadline').value = state.data.deadline
  renderDeadlineHint()
}

function renderFilters() {
  el('filters').innerHTML = FILTERS.map(
    (item) => `<button
      class="seg-btn${state.filter === item.id ? ' on' : ''}"
      data-filter="${item.id}"
      aria-pressed="${state.filter === item.id}"
    >${item.label}<span>${countOf(item.id)}</span></button>`,
  ).join('')
}

function renderRows() {
  const visible = state.data.steps
    .map((step, index) => ({ step, index }))
    .filter(({ step }) => state.filter === 'all' || step.status === state.filter)

  if (!visible.length) {
    el('rows').innerHTML = `<p class="empty">Nothing here.
      <button class="link" data-action="clear-filter">Show all sections</button></p>`
    return
  }

  el('rows').innerHTML = visible
    .map(({ step, index }) => {
      const left = daysBetween(step.due)
      const late = step.status !== 'done' && left !== null && left < 0
      return `<div class="row ${step.status}">
        <span class="row-num">${String(index + 1).padStart(2, '0')}</span>
        <button class="row-main" data-edit="${esc(step.id)}">
          <span class="row-title">${esc(step.title)}</span>
          <span class="row-meta">
            <span class="row-phase">${esc(step.phase)}</span>
            ${step.due ? `<span class="row-due">${shortDate(step.due)}</span>` : ''}
            ${late ? '<span class="row-late">overdue</span>' : ''}
          </span>
        </button>
        <button class="row-status" data-cycle="${esc(step.id)}"
          aria-label="${NEXT_LABEL[step.status]}: ${esc(step.title)}"
          title="${STATUS_LABEL[step.status]}"
        >${step.status === 'done' ? icon('check', 13) : ''}</button>
      </div>`
    })
    .join('')
}

function renderFocus() {
  const track = TRACKS[state.trackIndex]
  el('nowName').textContent = track.name
  el('nowMeta').textContent = `${track.mood} · ${track.bpm} BPM`
  el('trackList').innerHTML = TRACKS.map(
    (item, index) => `<button
      class="track-btn${state.trackIndex === index ? ' on' : ''}"
      data-track="${index}"
      aria-pressed="${state.trackIndex === index}"
    ><span>${item.name}</span><span>${item.bpm}</span></button>`,
  ).join('')
  el('playBtn').innerHTML = `${icon(state.playing ? 'pause' : 'play', 15)}${
    state.playing ? 'Pause' : 'Play'
  }`
  el('volumeIcon').innerHTML = icon(state.volume === 0 ? 'volume-x' : 'volume2', 15)
}

function renderSaved() {
  el('savedNote').textContent =
    'Edits save to this browser automatically.' +
    (state.savedAt ? ` Last saved at ${state.savedAt}.` : '')
}

function renderScreens() {
  document.querySelectorAll('#pager .screen').forEach((screen, index) => {
    screen.classList.toggle('is-active', index === state.active)
  })
}

function renderNav() {
  document.querySelectorAll('#dots .dot').forEach((dot, index) => {
    const on = index === state.active
    dot.classList.toggle('on', on)
    dot.setAttribute('aria-current', String(on))
  })
  el('prevBtn').disabled = state.active === 0
  el('nextBtn').disabled = state.active === SCREENS.length - 1
}

function buildNav() {
  el('dots').innerHTML = SCREENS.map(
    (name, index) => `<button class="dot" data-screen="${index}" aria-label="${name}">
      <span>${name}</span>
    </button>`,
  ).join('')
}

function renderAll() {
  renderOverview()
  renderFilters()
  renderRows()
  renderFocus()
  renderScreens()
  renderNav()
  renderSaved()
}

/* ---------- paging ---------- */

function goTo(index) {
  const clamped = Math.max(0, Math.min(SCREENS.length - 1, index))
  state.active = clamped
  renderScreens()
  renderNav()
  const pager = el('pager')
  pager.scrollTo({ left: clamped * pager.clientWidth, behavior: 'smooth' })
  restartAutoplay()
}

function restartAutoplay() {
  window.clearTimeout(autoTimer)
  autoTimer = null
  const fill = el('autoplayFill')
  if (fill) {
    fill.style.animation = 'none'
    void fill.offsetWidth
    if (state.draft) return
    fill.style.animation = ''
  }
  if (state.draft) return
  autoTimer = window.setTimeout(() => {
    goTo((state.active + 1) % SCREENS.length)
  }, AUTO_ADVANCE_MS)
}

/* ---------- editing ---------- */

function update(id, patch) {
  state.data.steps = state.data.steps.map((step) =>
    step.id === id ? { ...step, ...patch } : step,
  )
  save()
}

function cycle(step) {
  const next = STATUS_NEXT[step.status]
  update(step.id, { status: next })
  if (engine && engine.playing)
    engine.effect(next === 'done' ? 'up' : next === 'todo' ? 'down' : 'blip')
  renderOverview()
  renderFilters()
  renderRows()
}

function move(index, direction) {
  const target = index + direction
  if (target < 0 || target >= state.data.steps.length) return
  const list = [...state.data.steps]
  ;[list[index], list[target]] = [list[target], list[index]]
  state.data.steps = list
  save()
  renderOverview()
  renderFilters()
  renderRows()
}

function remove(id) {
  state.data.steps = state.data.steps.filter((step) => step.id !== id)
  save()
}

function openEditor(step) {
  state.creating = false
  state.draft = { ...step }
  renderSheet()
  restartAutoplay()
}

function startNew() {
  state.creating = true
  state.draft = {
    id: newId(),
    title: '',
    detail: '',
    phase: 'Section',
    status: 'todo',
    due: '',
  }
  renderSheet()
  restartAutoplay()
}

function closeSheet() {
  state.draft = null
  renderSheet()
  restartAutoplay()
}

function syncSheet() {
  if (!state.draft) return
  state.draft = {
    ...state.draft,
    title: el('fTitle').value,
    detail: el('fDetail').value,
    phase: el('fPhase').value,
    due: el('fDue').value,
    status: el('fStatus').value,
  }
}

function saveDraft() {
  if (!state.draft) return
  syncSheet()
  const draft = state.draft
  if (!draft.title.trim()) return
  const clean = {
    ...draft,
    title: draft.title.trim(),
    detail: draft.detail.trim(),
    phase: draft.phase.trim() || 'Section',
  }
  const exists = state.data.steps.some((step) => step.id === clean.id)
  state.data.steps = exists
    ? state.data.steps.map((step) => (step.id === clean.id ? clean : step))
    : [...state.data.steps, clean]
  save()
  closeSheet()
  renderAll()
}

function renderSheet() {
  const mount = el('editorMount')
  const draft = state.draft
  if (!draft) {
    mount.innerHTML = ''
    return
  }

  const index = state.data.steps.findIndex((step) => step.id === draft.id)
  const options = [
    ['todo', 'Not started'],
    ['doing', 'In progress'],
    ['done', 'Complete'],
  ]
    .map(
      ([value, label]) =>
        `<option value="${value}"${draft.status === value ? ' selected' : ''}>${label}</option>`,
    )
    .join('')

  mount.innerHTML = `<div class="overlay">
    <div class="sheet" role="dialog" aria-modal="true" aria-label="${
      state.creating ? 'Add a section' : 'Edit section'
    }">
      <div class="sheet-head">
        <h2>${state.creating ? 'Add section' : 'Edit section'}</h2>
        <button class="icon" data-close="1" aria-label="Close">${icon('x', 16)}</button>
      </div>

      <label class="field">
        <span>Title</span>
        <input id="fTitle" value="${esc(draft.title)}" placeholder="Section name" />
      </label>

      <label class="field">
        <span>What done looks like</span>
        <textarea id="fDetail" rows="3" placeholder="One or two concrete lines.">${esc(draft.detail)}</textarea>
      </label>

      <div class="field-row">
        <label class="field">
          <span>Phase</span>
          <input id="fPhase" value="${esc(draft.phase)}" maxlength="20" />
        </label>
        <label class="field">
          <span>Due</span>
          <input id="fDue" type="date" value="${esc(draft.due)}" />
        </label>
      </div>

      <label class="field">
        <span>Status</span>
        <select id="fStatus">${options}</select>
      </label>

      ${
        !state.creating && index > -1
          ? `<div class="sheet-tools">
              <button class="btn tiny" data-sheet="up" ${index === 0 ? 'disabled' : ''}>
                ${icon('arrow-up', 13)} Move up
              </button>
              <button class="btn tiny" data-sheet="down" ${
                index === state.data.steps.length - 1 ? 'disabled' : ''
              }>
                ${icon('arrow-down', 13)} Move down
              </button>
              <button class="btn tiny quiet" data-sheet="delete">
                ${icon('trash', 13)} Delete
              </button>
            </div>`
          : ''
      }

      <div class="sheet-actions">
        <button class="btn" data-close="1">Cancel</button>
        <button class="btn accent" id="saveDraftBtn" ${draft.title.trim() ? '' : 'disabled'}>
          ${icon('pencil', 14)} Save
        </button>
      </div>
    </div>
  </div>`

  const overlay = mount.querySelector('.overlay')
  const sheet = mount.querySelector('.sheet')
  overlay.addEventListener('click', closeSheet)
  sheet.addEventListener('click', (event) => event.stopPropagation())
  mount.querySelectorAll('[data-close]').forEach((button) => {
    button.addEventListener('click', closeSheet)
  })

  const title = el('fTitle')
  const saveButton = el('saveDraftBtn')
  title.addEventListener('input', () => {
    saveButton.disabled = !title.value.trim()
  })
  saveButton.addEventListener('click', saveDraft)

  mount.querySelectorAll('[data-sheet]').forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.dataset.sheet
      syncSheet()
      if (action === 'delete') {
        if (!window.confirm(`Delete "${state.draft.title}"?`)) return
        remove(state.draft.id)
        state.draft = null
        renderSheet()
        restartAutoplay()
        renderAll()
        return
      }
      const at = state.data.steps.findIndex((step) => step.id === state.draft.id)
      if (at < 0) return
      move(at, action === 'up' ? -1 : 1)
      renderSheet()
    })
  })

  title.focus()
}

/* ---------- wiring ---------- */

function toggleMusic() {
  const player = audio()
  if (player.playing) {
    player.pause()
    state.playing = false
    renderFocus()
    return
  }
  player.setVolume(state.volume)
  player.setTrack(state.trackIndex)
  player.play().then(() => {
    state.playing = true
    renderFocus()
  })
}

function exportJson() {
  const blob = new Blob([JSON.stringify(state.data, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'mtech-review-paper.json'
  link.click()
  URL.revokeObjectURL(url)
}

function reset() {
  if (!window.confirm('Reset every section back to the default list?')) return
  state.data = JSON.parse(JSON.stringify(DEFAULT_DATA))
  state.filter = 'all'
  save()
  syncFields()
  renderAll()
}

function start() {
  hydrateIcons()
  el('viz').innerHTML = Array.from({ length: BARS }, () => '<span></span>').join('')
  barEls = [...el('viz').children]
  buildNav()
  syncFields()
  el('volume').value = String(state.volume)
  renderAll()
  restartAutoplay()

  /* title, subtitle, deadline */
  el('paperTitle').value = state.data.title
  el('paperTitle').addEventListener('input', (event) => {
    state.data.title = event.target.value
    save()
  })
  el('paperSubtitle').value = state.data.subtitle
  el('paperSubtitle').addEventListener('input', (event) => {
    state.data.subtitle = event.target.value
    save()
  })
  el('deadline').addEventListener('change', (event) => {
    state.data.deadline = event.target.value
    renderDeadlineHint()
    save()
  })

  /* pager movement */
  const pager = el('pager')
  pager.addEventListener(
    'scroll',
    () => {
      const index = Math.round(pager.scrollLeft / Math.max(1, pager.clientWidth))
      if (index !== state.active && index >= 0 && index < SCREENS.length) {
        state.active = index
        renderScreens()
        renderNav()
        restartAutoplay()
      }
    },
    { passive: true },
  )

  el('prevBtn').addEventListener('click', () => goTo(state.active - 1))
  el('nextBtn').addEventListener('click', () => goTo(state.active + 1))
  el('dots').addEventListener('click', (event) => {
    const dot = event.target.closest('[data-screen]')
    if (dot) goTo(Number(dot.dataset.screen))
  })

  /* music */
  el('playBtn').addEventListener('click', toggleMusic)
  el('volume').addEventListener('input', (event) => {
    state.volume = Number(event.target.value)
    if (engine) engine.setVolume(state.volume)
    renderFocus()
  })
  el('trackList').addEventListener('click', (event) => {
    const button = event.target.closest('[data-track]')
    if (!button) return
    state.trackIndex = Number(button.dataset.track)
    if (engine) engine.setTrack(state.trackIndex)
    renderFocus()
  })

  /* data tools */
  el('exportBtn').addEventListener('click', exportJson)
  el('resetBtn').addEventListener('click', reset)

  /* rows, filters, chips, next card */
  document.addEventListener('click', (event) => {
    const target = event.target.closest(
      '[data-action],[data-edit],[data-cycle],[data-filter],[data-next]',
    )
    if (!target) return
    const data = target.dataset

    if (data.action === 'add') return startNew()
    if (data.action === 'clear-filter') {
      state.filter = 'all'
      renderFilters()
      renderRows()
      return
    }
    if (data.edit) {
      const step = state.data.steps.find((item) => item.id === data.edit)
      if (step) openEditor(step)
      return
    }
    if (data.cycle || data.next) {
      const id = data.cycle || data.next
      const step = state.data.steps.find((item) => item.id === id)
      if (step) cycle(step)
      return
    }
    if (data.filter) {
      state.filter = data.filter
      renderFilters()
      renderRows()
    }
  })

  /* keyboard */
  window.addEventListener('keydown', (event) => {
    if (state.draft) {
      if (event.key === 'Escape') closeSheet()
      return
    }
    const tag = event.target && event.target.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
    if (event.key === 'ArrowRight') goTo(state.active + 1)
    if (event.key === 'ArrowLeft') goTo(state.active - 1)
  })

  /* keep the current screen aligned when the stage resizes */
  window.addEventListener('resize', () => {
    pager.scrollLeft = state.active * pager.clientWidth
  })

  /* spectrum — when paused the bars fall back to a quiet resting score */
  const tick = () => {
    const spectrum = state.playing && engine ? engine.getSpectrum() : null
    barEls.forEach((bar, index) => {
      if (!spectrum) {
        if (bar.style.transform) bar.style.transform = ''
        return
      }
      const level = spectrum[index + 1] / 255
      bar.style.transform = `scaleY(${Math.max(0.1, Math.min(1, level * 1.7))})`
    })
    requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

start()
