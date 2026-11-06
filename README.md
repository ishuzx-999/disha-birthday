# Happy 18th Birthday, Disha 🎂👑

A cinematic birthday website — one song, 140 photos, a folded letter that opens out of an envelope (full shayari + wishes inside), fireworks, a cartoon cake-cutting scene (knife + balloon pop), and a credits screen that says Thank You + I Love You.

**Fully automatic after the letter:** read all 12 pages (NEXT / NEXT…) and everything else runs by itself — the wish bursts on its own, fireworks, the cake cuts itself, the balloon pops, the movie plays, then the credits. Only two taps needed: opening the envelope and turning the pages. 🎬

## ✨ What's inside

| File / folder | What it is |
|---|---|
| `index.html` | The whole cinematic experience (studio card: **STUDIO ✦ ISHU**) |
| `style.css` | All the premium styling & animations (incl. the cartoon cake scene) |
| `script.js` | Music-synced engine (beat detection, movie, envelope, cake, EQ) |
| `photos.js` | Photo order + song timing data |
| `song_1.m4a` / `song_1.webm` | The one song (m4a for Chrome/Safari, webm backup) |
| `media/photos/` | 140 photos (full-body, always fully visible) |
| `media/emoji/` | 75 premium Apple-style emoji |
| `media/letter.webp` | The folded letter design — it sits folded, flicks open from the top, and all the shayari pages live inside |
| `media/disha_video.mp4` | Little secret video that plays mid-movie |
| corner byline | `a film by SIBU` — small, in the corner only |

## 📤 How to put it online (2 minutes)

### Option A — GitHub Pages (free, permanent)

1. Go to https://github.com/new and create a repository (any name, e.g. `disha-birthday`).
   - Select **Public** so the link works for everyone.
2. On the repo page, click **uploading an existing file** (or `Add file → Upload files`).
3. Drag & drop this whole folder's contents (all files, keep the `media` folder).
4. After upload finishes, click **Commit changes**.
5. Go to **Settings → Pages**.
   - Under **Branch**, select `main` (or `master`) and click **Save**.
   - Wait 1–2 minutes for the green box "Your site is live at: https://yourname.github.io/disha-birthday/"
6. Send Disha that link casually "ek chhoti si cheez" 😄

### Option B — Netlify Drop (fastest, no GitHub needed)

1. Open https://app.netlify.com/drop
2. Drag this whole folder onto the page.
3. Get your link instantly (e.g. `https://disha-birthday.netlify.app`).
4. To keep the same link forever, make a free Netlify account first.

### Option C — Local (offline test)

```powershell
cd "C:\Users\pc\Desktop\Disha_Birthday_Site"
python -m http.server 8124
```

Then open `http://localhost:8124` in your browser. Make sure a sound plays — the whole movie is synced to the music, so **keep the volume on**. 🔊

## 🎬 The flow (what she'll see)

1. **Studio intro** — STUDIO ✦ ISHU presents … DISHA
2. **Card** — tap OPEN
3. **Letter** — envelope opens from the top, 12 shayari pages (NEXT › at her own pace; 26s idle = auto page-turn)
4. **The wish** — on the last page, everything fires **automatically after 7 seconds** (no wish button needed)
5. **Fireworks** — HAPPY BIRTHDAY DISHA, boom
6. **Cake cartoon** — the cake rolls in, a knife + cartoon arm saws through it, a slice tips out, a balloon pops with confetti 🎈 (all by itself)
7. **The movie** — 140 photos + the secret video, beat-synced to the one song
8. **Credits** — Thank You + I Love You, replay / read-again buttons

## 💡 Tips

- Keep volume up — the letter, movie and fireworks are all synced to the song.
- If no music starts by itself, you'll see a small golden "TAP ANYWHERE FOR MUSIC" bubble — tap it (or tap anywhere) and the song begins. This is a browser safety rule, not a bug 😄
- Mobile works great (best on a phone standing in portrait).
- If a browser ever blocks autoplay, just tap anywhere to unlock the song.

Made with one heart, completely hers. ✦