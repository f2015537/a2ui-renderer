/**
 * Generates the screenshots and GIF embedded in README.md.
 *
 * Starts the Vite dev server in-process, drives the demo in headless
 * Chromium via Playwright, and writes everything to docs/media/. Run it
 * with `npm run capture-media`.
 *
 * GIF conversion: no system-wide `ffmpeg` was available in this
 * environment (checked via `which ffmpeg`). Playwright does download its
 * own ffmpeg build for internal video post-processing as part of
 * `playwright install`, and this script locates and reuses that binary —
 * but that build is compiled with `--disable-everything` and only
 * `pad`/`crop`/`scale` filters plus a PNG encoder enabled (no `fps`,
 * `palettegen`/`paletteuse`, or GIF muxer), so it can't produce a GIF
 * directly. Instead we use it purely to extract a scaled-down PNG frame
 * sequence from the recorded video, then assemble those frames into a GIF
 * with the pure-JS `gif-encoder-2` + `pngjs` packages (no native deps, so
 * no risk of a native-module build failing in a sandboxed environment).
 * If the bundled ffmpeg can't be found at all, this falls back to a plain
 * screenshot sequence showing the streaming reveal instead of silently
 * skipping the GIF (see `captureStreamingScreenshotSequence` below).
 */
import {
  access,
  constants,
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  writeFile,
} from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import type { Browser } from 'playwright'
import { createServer } from 'vite'
import { PNG } from 'pngjs'

// gif-encoder-2 is CommonJS-only with no published type declarations;
// createRequire lets us load it from this ESM script.
const require = createRequire(import.meta.url)
const GIFEncoder = require('gif-encoder-2') as new (
  width: number,
  height: number,
  algorithm?: 'neuquant' | 'octree',
  useOptimizer?: boolean,
) => {
  setDelay(ms: number): void
  setRepeat(count: number): void
  setQuality(quality: number): void
  start(): void
  addFrame(input: {
    getImageData: (
      sx: number,
      sy: number,
      sw: number,
      sh: number,
    ) => { data: Buffer | Uint8Array }
  }): void
  finish(): void
  out: { getData(): Buffer }
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const mediaDir = path.join(rootDir, 'docs', 'media')
const PORT = 4327
const BASE_URL = `http://localhost:${PORT}/`

async function findBundledFfmpeg(): Promise<string | undefined> {
  const cacheRoot =
    process.env.PLAYWRIGHT_BROWSERS_PATH ||
    (process.platform === 'darwin'
      ? path.join(os.homedir(), 'Library', 'Caches', 'ms-playwright')
      : process.platform === 'win32'
        ? path.join(os.homedir(), 'AppData', 'Local', 'ms-playwright')
        : path.join(os.homedir(), '.cache', 'ms-playwright'))

  let entries: string[]
  try {
    entries = await readdir(cacheRoot)
  } catch {
    return undefined
  }

  const ffmpegDir = entries.find((entry) => entry.startsWith('ffmpeg-'))
  if (!ffmpegDir) return undefined

  const binaryName =
    process.platform === 'darwin'
      ? 'ffmpeg-mac'
      : process.platform === 'win32'
        ? 'ffmpeg-win64.exe'
        : 'ffmpeg-linux'

  const binaryPath = path.join(cacheRoot, ffmpegDir, binaryName)
  try {
    await access(binaryPath, constants.X_OK)
    return binaryPath
  } catch {
    return undefined
  }
}

/** The `.a2ui-enter` mount animation runs for 220ms; wait it out before a screenshot. */
const ENTER_ANIMATION_MS = 350

async function captureScreenshots(browser: Browser): Promise<void> {
  const page = await browser.newPage({ viewport: { width: 480, height: 800 } })
  await page.goto(BASE_URL)
  await page.getByRole('heading', { name: 'a2ui-renderer demo' }).waitFor()

  await page.screenshot({
    path: path.join(mediaDir, '01-initial-chat.png'),
    fullPage: true,
  })

  await page.getByLabel('Message').fill("I'd like to signup please")
  await page.getByRole('button', { name: 'Send' }).click()
  await page.getByText('Create your account to get started.').waitFor()
  await page.waitForTimeout(ENTER_ANIMATION_MS)
  await page.screenshot({
    path: path.join(mediaDir, '02-signup-form.png'),
    fullPage: true,
  })

  // Deliberately different from the fields' own placeholder text (which is
  // "Ada Lovelace" / "ada@example.com") so this screenshot is unmistakably
  // showing entered values, not the placeholder ghost text from the one above.
  await page.getByLabel('Name').fill('Grace Hopper')
  await page.getByLabel('Email').fill('grace@example.com')
  await page.screenshot({
    path: path.join(mediaDir, '03-signup-form-filled.png'),
    fullPage: true,
  })

  // Submit callback: the form's onEvent fires, and the demo echoes the
  // collected values back as a "system" message.
  await page.getByRole('button', { name: 'Sign up' }).click()
  await page.getByText('Sent "submitSignup" to the agent with').waitFor()
  await page.waitForTimeout(ENTER_ANIMATION_MS)
  await page.screenshot({
    path: path.join(mediaDir, '04-signup-submitted.png'),
    fullPage: true,
  })

  await page.getByLabel('Message').fill('please confirm my booking')
  await page.getByRole('button', { name: 'Send' }).click()
  await page.getByText('Should I confirm this booking for you?').waitFor()
  await page.waitForTimeout(ENTER_ANIMATION_MS)
  await page.screenshot({
    path: path.join(mediaDir, '05-booking-confirm.png'),
    fullPage: true,
  })

  // Button-click callback: Confirm on this first booking card.
  await page.getByRole('button', { name: 'Confirm' }).click()
  await page.getByText('Sent "confirmBooking" to the agent.').waitFor()
  await page.screenshot({
    path: path.join(mediaDir, '06-booking-confirmed.png'),
    fullPage: true,
  })

  // A second, independent booking card so Cancel's callback can be shown
  // without disturbing the first card's already-clicked Confirm button.
  await page.getByLabel('Message').fill('book a table for two')
  await page.getByRole('button', { name: 'Send' }).click()
  await page.getByRole('button', { name: 'Cancel' }).last().click()
  await page.getByText('Sent "cancelBooking" to the agent.').waitFor()
  await page.waitForTimeout(ENTER_ANIMATION_MS)
  await page.screenshot({
    path: path.join(mediaDir, '07-booking-cancelled.png'),
    fullPage: true,
  })

  await page.close()
  console.log(
    'Wrote 01-initial-chat.png .. 07-booking-cancelled.png (7 screenshots)',
  )
}

async function captureStreamingScreenshotSequence(
  browser: Browser,
): Promise<void> {
  const page = await browser.newPage({ viewport: { width: 480, height: 720 } })
  await page.goto(BASE_URL)
  await page.getByRole('heading', { name: 'a2ui-renderer demo' }).waitFor()
  await page.getByLabel('Simulate streaming').check()
  await page.getByLabel('Message').fill('what are my preferences settings?')
  await page.getByRole('button', { name: 'Send' }).click()

  for (let i = 1; i <= 5; i += 1) {
    await page.screenshot({
      path: path.join(mediaDir, `streaming-${i}.png`),
    })
    await page.waitForTimeout(400)
  }

  await page.close()
  console.log('Wrote streaming-1.png through streaming-5.png (GIF fallback)')
}

async function captureStreamingClip(browser: Browser): Promise<void> {
  const tmpDir = await mkdtemp(path.join(os.tmpdir(), 'a2ui-capture-'))
  const context = await browser.newContext({
    viewport: { width: 480, height: 720 },
    recordVideo: { dir: tmpDir },
  })
  const page = await context.newPage()
  await page.goto(BASE_URL)
  await page.getByRole('heading', { name: 'a2ui-renderer demo' }).waitFor()

  await page.waitForTimeout(500)
  await page.getByLabel('Simulate streaming').check()
  await page.waitForTimeout(500)
  await page.getByLabel('Message').fill('what are my preferences settings?')
  await page.getByRole('button', { name: 'Send' }).click()

  // Let the progressive reveal play out (6 nodes * 300ms, plus headroom).
  await page.waitForTimeout(2200)

  // Fill in and submit the form so the clip also shows the resulting
  // form-submit callback, not just the reveal animation.
  await page.getByLabel(/^role/i).selectOption('designer')
  await page.waitForTimeout(400)
  await page.getByLabel('Team').fill('Platform')
  await page.waitForTimeout(400)
  await page.getByLabel(/subscribe/i).check()
  await page.waitForTimeout(400)
  await page.getByRole('button', { name: 'Save preferences' }).click()
  await page.getByText('Sent "submitPreferences" to the agent with').waitFor()

  // Hold on the final state so the clip comfortably sits in the 5-10s range.
  await page.waitForTimeout(1500)

  const video = page.video()
  await context.close() // flushes the recorded video to disk
  const videoPath = video ? await video.path() : undefined

  if (!videoPath) {
    console.warn(
      'No video was recorded; falling back to a screenshot sequence.',
    )
    await captureStreamingScreenshotSequence(browser)
    return
  }

  const ffmpegPath = await findBundledFfmpeg()
  if (!ffmpegPath) {
    console.warn(
      'Could not locate an ffmpeg binary (system or Playwright-bundled); ' +
        'falling back to a screenshot sequence instead of a GIF.',
    )
    await captureStreamingScreenshotSequence(browser)
    return
  }

  try {
    await buildGifFromVideo(ffmpegPath, videoPath, tmpDir)
  } catch (error) {
    console.warn(
      'GIF assembly failed; falling back to a screenshot sequence instead.',
      error,
    )
    await captureStreamingScreenshotSequence(browser)
  }
}

/** True if a sampled grid of pixels are all within a few shades of white. */
function isBlankFrame(png: {
  width: number
  height: number
  data: Buffer
}): boolean {
  const { width, height, data } = png
  const stride = 17 // an odd/prime-ish stride so the grid doesn't alias with UI edges
  for (let y = 0; y < height; y += stride) {
    for (let x = 0; x < width; x += stride) {
      const i = (y * width + x) * 4
      if (data[i] < 250 || data[i + 1] < 250 || data[i + 2] < 250) {
        return false
      }
    }
  }
  return true
}

/**
 * Extracts a scaled-down PNG frame sequence from `videoPath` with the
 * (filter-limited) bundled ffmpeg, then assembles those frames into a GIF
 * with `gif-encoder-2`. See the file header comment for why this two-step
 * approach is needed instead of a direct ffmpeg-to-GIF conversion.
 */
async function buildGifFromVideo(
  ffmpegPath: string,
  videoPath: string,
  tmpDir: string,
): Promise<void> {
  const framesDir = path.join(tmpDir, 'frames')
  await mkdir(framesDir, { recursive: true })

  const fps = 8
  execFileSync(ffmpegPath, [
    '-y',
    '-i',
    videoPath,
    '-vf',
    'scale=480:-1',
    '-r',
    String(fps),
    path.join(framesDir, 'frame-%03d.png'),
  ])

  const frameFiles = (await readdir(framesDir))
    .filter((name) => name.endsWith('.png'))
    .sort()
  if (frameFiles.length === 0) {
    throw new Error('ffmpeg produced no frames to encode')
  }

  const allFrames = await Promise.all(
    frameFiles.map(async (name) =>
      PNG.sync.read(await readFile(path.join(framesDir, name))),
    ),
  )

  // Playwright's video recording starts at page/context creation, a moment
  // before the page's first paint, so the recording's first frame (or two)
  // is a blank white frame rather than the app. Drop those so the GIF opens
  // on real content instead of a flash of blank white.
  let startIndex = 0
  while (
    startIndex < allFrames.length - 1 &&
    isBlankFrame(allFrames[startIndex])
  ) {
    startIndex += 1
  }
  const frames = allFrames.slice(startIndex)
  if (startIndex > 0) {
    console.log(
      `Trimmed ${startIndex} leading blank frame(s) before first paint.`,
    )
  }

  const { width, height } = frames[0]

  const encoder = new GIFEncoder(width, height, 'octree', true)
  encoder.setDelay(1000 / fps)
  encoder.setRepeat(0)
  encoder.setQuality(10)
  encoder.start()
  for (const frame of frames) {
    encoder.addFrame({
      getImageData: () => ({ data: frame.data }),
    })
  }
  encoder.finish()

  const gifPath = path.join(mediaDir, 'streaming-demo.gif')
  await writeFile(gifPath, encoder.out.getData())
  console.log(
    `Wrote ${path.relative(rootDir, gifPath)} (${frames.length} frames)`,
  )
}

async function main(): Promise<void> {
  await mkdir(mediaDir, { recursive: true })

  const server = await createServer({
    root: rootDir,
    server: { port: PORT, strictPort: true },
  })
  await server.listen()

  const browser = await chromium.launch()
  try {
    await captureScreenshots(browser)
    await captureStreamingClip(browser)
  } finally {
    await browser.close()
    await server.close()
  }
}

main().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
